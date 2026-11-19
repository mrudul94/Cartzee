-- Product order: an optional position set in Admin → Products. Lower numbers show first in homepage
-- rows, category pages and other lists; products without a position follow, newest first.
alter table public.products add column if not exists position integer check (position between 1 and 9999);
grant select (position) on public.products to anon, authenticated;
create index if not exists products_position_idx on public.products (position nulls last, created_at desc);
