-- Demo products: sample items added by `pnpm demo:add` so the shop can be judged with a full catalogue.
-- They look like normal products but can never be ordered, and `pnpm demo:remove` deletes them all.
alter table public.products add column if not exists is_demo boolean not null default false;
create index if not exists products_demo_idx on public.products (is_demo) where is_demo;

-- Any order line for a demo product is refused (covers create_order and every other insert path).
create or replace function public.order_items_block_demo() returns trigger
language plpgsql set search_path = public as $$
begin
  if exists (select 1 from public.products p where p.id = new.product_id and p.is_demo) then
    raise exception '% is a sample product and is not for sale yet. Please remove it from your cart.', new.title using errcode = 'P0001';
  end if;
  return new;
end $$;

drop trigger if exists order_items_block_demo on public.order_items;
create trigger order_items_block_demo before insert on public.order_items
  for each row execute function public.order_items_block_demo();
