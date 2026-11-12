-- Server-side business functions. All are SECURITY DEFINER and executable only by service_role
-- (see 0003_security.sql), except search_products which is public and returns ids only.

-- ---------------------------------------------------------------- search
-- Prefix full-text search over product title/summary/material/colour plus category names.
-- Returns ids + rank only, so callers read products through normal column-restricted selects.
create or replace function public.search_products(q text)
returns table (id uuid, rank real)
language sql stable security definer set search_path = public as $$
  with tsq as (
    select to_tsquery('english', string_agg(t || ':*', ' & ')) as query
    from regexp_split_to_table(lower(coalesce(q, '')), '[^a-z0-9]+') as t
    where length(t) > 1
  )
  select p.id, ts_rank(p.search_vector, tsq.query) as rank
  from public.products p
  join public.categories c on c.id = p.category_id
  join public.categories s on s.id = p.subcategory_id
  cross join tsq
  where p.is_active
    and tsq.query is not null
    and (p.search_vector @@ tsq.query or to_tsvector('english', c.name || ' ' || s.name) @@ tsq.query)
  order by rank desc, p.review_count desc
  limit 48;
$$;

-- ---------------------------------------------------------------- create_order
-- Re-prices every line from the products table (never trusts client prices), checks stock,
-- upserts the customer by phone and creates order + items + first event atomically.
create or replace function public.create_order(
  p_customer jsonb,          -- { name, phone, email }
  p_address jsonb,           -- full address object (stored as-is for the admin queue)
  p_items jsonb,             -- [{ product_id, quantity }]
  p_free_above numeric,      -- free-shipping threshold (from app config)
  p_shipping_fee numeric     -- flat fee below threshold
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_customer uuid;
  v_order uuid;
  v_subtotal numeric(10,2);
  v_shipping numeric(10,2);
  r record;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Your cart is empty' using errcode = 'P0001';
  end if;

  for r in
    with req as (
      select (x->>'product_id')::uuid as product_id, sum((x->>'quantity')::int) as quantity
      from jsonb_array_elements(p_items) as x
      group by 1
    )
    select req.product_id, req.quantity, p.id as pid, p.title, p.stock, p.is_active
    from req left join public.products p on p.id = req.product_id
  loop
    if r.pid is null or not r.is_active then
      raise exception 'A product in your cart is no longer available' using errcode = 'P0001';
    end if;
    if r.quantity < 1 or r.quantity > 10 then
      raise exception 'Quantity for % must be between 1 and 10', r.title using errcode = 'P0001';
    end if;
    if r.stock < r.quantity then
      raise exception '% is out of stock', r.title using errcode = 'P0001';
    end if;
  end loop;

  insert into public.customers (phone, name, email)
  values (p_customer->>'phone', p_customer->>'name', p_customer->>'email')
  on conflict (phone) do update set name = excluded.name, email = excluded.email
  returning id into v_customer;

  select coalesce(sum(p.price * l.quantity), 0) into v_subtotal
  from (
    select (x->>'product_id')::uuid as product_id, sum((x->>'quantity')::int) as quantity
    from jsonb_array_elements(p_items) as x group by 1
  ) l
  join public.products p on p.id = l.product_id;

  v_shipping := case when v_subtotal >= p_free_above then 0 else p_shipping_fee end;

  insert into public.orders (customer_id, address, subtotal, shipping, total)
  values (v_customer, p_address, v_subtotal, v_shipping, v_subtotal + v_shipping)
  returning id into v_order;

  insert into public.order_items (order_id, product_id, slug, path, title, image, quantity, unit_price, unit_mrp, meesho_price, meesho_url)
  select v_order, p.id, p.slug, '/' || c.slug || '/' || s.slug || '/' || p.slug, p.title,
         coalesce((select i.src from public.product_images i where i.product_id = p.id order by i.sort_order limit 1), ''),
         l.quantity, p.price, p.mrp, p.meesho_price, p.meesho_url
  from (
    select (x->>'product_id')::uuid as product_id, sum((x->>'quantity')::int) as quantity
    from jsonb_array_elements(p_items) as x group by 1
  ) l
  join public.products p on p.id = l.product_id
  join public.categories c on c.id = p.category_id
  join public.categories s on s.id = p.subcategory_id;

  insert into public.order_events (order_id, status, note) values (v_order, 'pending_payment', 'Order created');
  return v_order;
end $$;

-- ---------------------------------------------------------------- mark_order_paid
-- Idempotent: locks the order row, so concurrent webhook + client-verify calls cannot both
-- transition it. Returns changed=true only for the call that actually marked it paid.
-- Raises on amount or Razorpay-order mismatch.
create or replace function public.mark_order_paid(
  p_order_id uuid,
  p_razorpay_order_id text,
  p_payment_id text,
  p_amount_paise bigint
) returns table (order_id uuid, changed boolean)
language plpgsql security definer set search_path = public as $$
declare
  o public.orders%rowtype;
begin
  select * into o from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'Order not found' using errcode = 'P0002';
  end if;
  if o.status <> 'pending_payment' then
    return query select o.id, false;
    return;
  end if;
  if p_razorpay_order_id is not null and o.razorpay_order_id is distinct from p_razorpay_order_id then
    raise exception 'Payment does not belong to this order' using errcode = 'P0001';
  end if;
  if p_amount_paise is not null and round(o.total * 100)::bigint <> p_amount_paise then
    raise exception 'Paid amount % does not match order total %', p_amount_paise, round(o.total * 100) using errcode = 'P0001';
  end if;

  update public.orders
     set status = 'paid', paid_at = now(), razorpay_payment_id = coalesce(p_payment_id, razorpay_payment_id)
   where id = o.id;

  insert into public.order_events (order_id, status, note)
  values (o.id, 'paid', 'Payment captured' || coalesce(' (' || p_payment_id || ')', ''));

  update public.products p
     set stock = greatest(0, p.stock - oi.quantity)
    from public.order_items oi
   where oi.order_id = o.id and oi.product_id = p.id;

  return query select o.id, true;
end $$;

-- ---------------------------------------------------------------- set_order_status
-- Applies a status change + optional fulfilment fields and logs an event atomically.
-- Transition rules are enforced in app code (src/lib/orders/status.ts) before calling.
create or replace function public.set_order_status(
  p_order_id uuid,
  p_status public.order_status,
  p_patch jsonb default '{}'::jsonb,
  p_note text default null,
  p_actor text default 'admin'
) returns uuid
language plpgsql security definer set search_path = public as $$
begin
  update public.orders set
    status = p_status,
    meesho_order_id = coalesce(p_patch->>'meeshoOrderId', meesho_order_id),
    meesho_cost = coalesce((p_patch->>'meeshoCost')::numeric, meesho_cost),
    tracking_url = coalesce(p_patch->>'trackingUrl', tracking_url)
  where id = p_order_id;
  if not found then
    raise exception 'Order not found' using errcode = 'P0002';
  end if;
  insert into public.order_events (order_id, status, note, actor) values (p_order_id, p_status, p_note, p_actor);
  return p_order_id;
end $$;
