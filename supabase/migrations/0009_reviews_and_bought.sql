-- Customer reviews (verified purchases), shop replies, ratings computed from real reviews,
-- and an honest "bought" count per product from real orders.

-- ---------------------------------------------------------------- reviews
alter table public.reviews add column if not exists user_id uuid references auth.users (id) on delete set null;
alter table public.reviews add column if not exists order_id uuid references public.orders (id) on delete set null;
alter table public.reviews add column if not exists reply text not null default '';
alter table public.reviews add column if not exists replied_at timestamptz;

-- One review per product per order.
create unique index if not exists reviews_one_per_order_item on public.reviews (order_id, product_id) where order_id is not null;

-- Length limits for shopper-written text (existing rows are not re-checked).
alter table public.reviews drop constraint if exists reviews_text_lengths;
alter table public.reviews add constraint reviews_text_lengths
  check (char_length(author) between 1 and 80 and char_length(title) <= 120 and char_length(body) <= 2000 and char_length(reply) <= 1000)
  not valid;

-- ---------------------------------------------------------------- product rating from approved reviews
create or replace function public.refresh_product_rating(p_product uuid)
returns void language sql security definer set search_path = public as $$
  update public.products set
    rating = coalesce((select round(avg(r.rating)::numeric, 1) from public.reviews r where r.product_id = p_product and r.is_approved), 0),
    review_count = (select count(*) from public.reviews r where r.product_id = p_product and r.is_approved)
  where id = p_product;
$$;

create or replace function public.reviews_refresh_rating()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op in ('UPDATE', 'DELETE') then perform public.refresh_product_rating(old.product_id); end if;
  if tg_op in ('INSERT', 'UPDATE') and (tg_op = 'INSERT' or new.product_id is distinct from old.product_id) then
    perform public.refresh_product_rating(new.product_id);
  end if;
  return null;
end $$;

drop trigger if exists reviews_refresh_rating on public.reviews;
create trigger reviews_refresh_rating after insert or update or delete on public.reviews
  for each row execute function public.reviews_refresh_rating();

-- Bring existing products in line with their approved reviews.
select public.refresh_product_rating(id) from public.products;

-- ---------------------------------------------------------------- "bought" count from real orders
-- Number of orders containing the product that were paid and not cancelled or returned.
alter table public.products add column if not exists bought_count int not null default 0 check (bought_count >= 0);
grant select (bought_count) on public.products to anon, authenticated;

create or replace function public.order_counts_as_bought(s public.order_status)
returns boolean language sql immutable as $$
  select s in ('paid', 'placed_on_meesho', 'shipped', 'delivered', 'return_requested');
$$;

create or replace function public.orders_update_bought()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  delta int := 0;
begin
  if public.order_counts_as_bought(new.status) and not public.order_counts_as_bought(old.status) then delta := 1;
  elsif public.order_counts_as_bought(old.status) and not public.order_counts_as_bought(new.status) then delta := -1;
  end if;
  if delta <> 0 then
    update public.products p set bought_count = greatest(0, p.bought_count + delta)
    where p.id in (select distinct oi.product_id from public.order_items oi where oi.order_id = new.id);
  end if;
  return null;
end $$;

drop trigger if exists orders_update_bought on public.orders;
create trigger orders_update_bought after update of status on public.orders
  for each row execute function public.orders_update_bought();

-- Backfill from orders placed so far.
update public.products p set bought_count = (
  select count(distinct oi.order_id)
  from public.order_items oi join public.orders o on o.id = oi.order_id
  where oi.product_id = p.id and public.order_counts_as_bought(o.status)
);

-- These helpers run only from triggers / server code.
revoke execute on function public.refresh_product_rating(uuid) from public, anon, authenticated;
revoke execute on function public.reviews_refresh_rating() from public, anon, authenticated;
revoke execute on function public.orders_update_bought() from public, anon, authenticated;
