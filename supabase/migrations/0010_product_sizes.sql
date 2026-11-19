-- Sizes for clothing: a product can list sizes (e.g. S, M, L or 2-3Y, 4-5Y). When it does, the shopper must
-- pick one; the chosen size is stored on the order item so the right size is ordered from the supplier.
-- Products without sizes work exactly as before.

alter table public.products add column if not exists sizes text[] not null default '{}';
grant select (sizes) on public.products to anon, authenticated;

alter table public.order_items add column if not exists size text not null default '';

-- ---------------------------------------------------------------- create_order (with sizes)
-- p_items: [{ product_id, quantity, size? }]. Lines are merged per product + size; stock is checked per product.
create or replace function public.create_order(
  p_customer jsonb,
  p_address jsonb,
  p_items jsonb,
  p_free_above numeric,
  p_shipping_fee numeric
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

  create temporary table if not exists pg_temp.order_lines (product_id uuid, size text, quantity int) on commit drop;
  delete from pg_temp.order_lines;
  insert into pg_temp.order_lines (product_id, size, quantity)
  select (x->>'product_id')::uuid, coalesce(trim(x->>'size'), ''), sum((x->>'quantity')::int)
  from jsonb_array_elements(p_items) as x
  group by 1, 2;

  -- Each line: product available, quantity in range, size valid for the product.
  for r in
    select l.product_id, l.size, l.quantity, p.id as pid, p.title, p.is_active, p.sizes
    from pg_temp.order_lines l left join public.products p on p.id = l.product_id
  loop
    if r.pid is null or not r.is_active then
      raise exception 'A product in your cart is no longer available' using errcode = 'P0001';
    end if;
    if r.quantity < 1 or r.quantity > 10 then
      raise exception 'Quantity for % must be between 1 and 10', r.title using errcode = 'P0001';
    end if;
    if coalesce(array_length(r.sizes, 1), 0) > 0 then
      if r.size = '' then
        raise exception 'Choose a size for %', r.title using errcode = 'P0001';
      elsif not (r.size = any (r.sizes)) then
        raise exception 'Size % is not available for %', r.size, r.title using errcode = 'P0001';
      end if;
    elsif r.size <> '' then
      raise exception '% does not come in sizes', r.title using errcode = 'P0001';
    end if;
  end loop;

  -- Stock is per product (all sizes together).
  for r in
    select p.title, p.stock, sum(l.quantity) as quantity
    from pg_temp.order_lines l join public.products p on p.id = l.product_id
    group by p.id, p.title, p.stock
  loop
    if r.stock < r.quantity then
      raise exception '% is out of stock', r.title using errcode = 'P0001';
    end if;
  end loop;

  insert into public.customers (phone, name, email)
  values (p_customer->>'phone', p_customer->>'name', p_customer->>'email')
  on conflict (phone) do update set name = excluded.name, email = excluded.email
  returning id into v_customer;

  select coalesce(sum(p.price * l.quantity), 0) into v_subtotal
  from pg_temp.order_lines l join public.products p on p.id = l.product_id;

  v_shipping := case when v_subtotal >= p_free_above then 0 else p_shipping_fee end;

  insert into public.orders (customer_id, address, subtotal, shipping, total)
  values (v_customer, p_address, v_subtotal, v_shipping, v_subtotal + v_shipping)
  returning id into v_order;

  insert into public.order_items (order_id, product_id, slug, path, title, image, quantity, size, unit_price, unit_mrp, meesho_price, meesho_url)
  select v_order, p.id, p.slug, '/' || c.slug || coalesce('/' || s.slug, '') || '/' || p.slug, p.title,
         coalesce((select i.src from public.product_images i where i.product_id = p.id order by i.sort_order limit 1), ''),
         l.quantity, l.size, p.price, p.mrp, p.meesho_price, p.meesho_url
  from pg_temp.order_lines l
  join public.products p on p.id = l.product_id
  join public.categories c on c.id = p.category_id
  left join public.categories s on s.id = p.subcategory_id;

  insert into public.order_events (order_id, status, note) values (v_order, 'pending_payment', 'Order created');
  return v_order;
end $$;
