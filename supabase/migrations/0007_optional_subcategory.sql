-- Subcategory is optional for products.
-- A product without a subcategory lives at /<category>/<product> instead of /<category>/<sub>/<product>.
-- Search and order creation now use LEFT JOINs so such products are found and can be ordered.
-- (create or replace keeps the existing grants from 0003_security.sql.)

alter table public.products alter column subcategory_id drop not null;

-- ---------------------------------------------------------------- search
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
  left join public.categories s on s.id = p.subcategory_id
  cross join tsq
  where p.is_active
    and tsq.query is not null
    and (p.search_vector @@ tsq.query or to_tsvector('english', c.name || ' ' || coalesce(s.name, '')) @@ tsq.query)
  order by rank desc, p.review_count desc
  limit 48;
$$;

-- ---------------------------------------------------------------- create_order
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
  select v_order, p.id, p.slug, '/' || c.slug || coalesce('/' || s.slug, '') || '/' || p.slug, p.title,
         coalesce((select i.src from public.product_images i where i.product_id = p.id order by i.sort_order limit 1), ''),
         l.quantity, p.price, p.mrp, p.meesho_price, p.meesho_url
  from (
    select (x->>'product_id')::uuid as product_id, sum((x->>'quantity')::int) as quantity
    from jsonb_array_elements(p_items) as x group by 1
  ) l
  join public.products p on p.id = l.product_id
  join public.categories c on c.id = p.category_id
  left join public.categories s on s.id = p.subcategory_id;

  insert into public.order_events (order_id, status, note) values (v_order, 'pending_payment', 'Order created');
  return v_order;
end $$;
