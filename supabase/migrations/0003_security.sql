-- Row-Level Security and privileges.
-- Model: the public storefront reads catalogue data with the anon key (RLS + column grants);
-- everything involving customers, orders or supplier data goes through server code with the
-- service_role key, which bypasses RLS. Admins (Milestone C) get read access via is_admin().

alter table public.categories     enable row level security;
alter table public.products       enable row level security;
alter table public.product_images enable row level security;
alter table public.customers      enable row level security;
alter table public.orders         enable row level security;
alter table public.order_items    enable row level security;
alter table public.order_events   enable row level security;
alter table public.reviews        enable row level security;
alter table public.blog_posts     enable row level security;
alter table public.admins         enable row level security;

-- ---------------------------------------------------------------- public catalogue
create policy "categories are public" on public.categories for select to anon, authenticated using (true);
create policy "active products are public" on public.products for select to anon, authenticated using (is_active or public.is_admin());
create policy "images of active products are public" on public.product_images for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and (p.is_active or public.is_admin())));
create policy "approved reviews are public" on public.reviews for select to anon, authenticated using (is_approved or public.is_admin());
create policy "published posts are public" on public.blog_posts for select to anon, authenticated using (is_published or public.is_admin());

-- Supplier data (Meesho link and cost) must never reach the browser: column-level grants.
revoke select on public.products from anon, authenticated;
grant select (
  id, slug, category_id, subcategory_id, title, summary, description, how_to_use, specs, material, colour,
  price, mrp, rating, review_count, stock, is_bestseller, is_flash_sale, is_active, faqs, seo_title,
  seo_description, created_at, updated_at
) on public.products to anon, authenticated;

-- No public writes anywhere.
revoke insert, update, delete, truncate on all tables in schema public from anon, authenticated;

-- ---------------------------------------------------------------- private tables
revoke all on public.customers, public.orders, public.order_items, public.order_events, public.admins from anon;
create policy "admins read customers" on public.customers for select to authenticated using (public.is_admin());
create policy "admins read orders" on public.orders for select to authenticated using (public.is_admin());
create policy "admins read order items" on public.order_items for select to authenticated using (public.is_admin());
create policy "admins read order events" on public.order_events for select to authenticated using (public.is_admin());
create policy "admins see own admin row" on public.admins for select to authenticated using (user_id = auth.uid());

-- ---------------------------------------------------------------- functions
revoke execute on function public.create_order(jsonb, jsonb, jsonb, numeric, numeric) from public, anon, authenticated;
revoke execute on function public.mark_order_paid(uuid, text, text, bigint) from public, anon, authenticated;
revoke execute on function public.set_order_status(uuid, public.order_status, jsonb, text, text) from public, anon, authenticated;
grant execute on function public.create_order(jsonb, jsonb, jsonb, numeric, numeric) to service_role;
grant execute on function public.mark_order_paid(uuid, text, text, bigint) to service_role;
grant execute on function public.set_order_status(uuid, public.order_status, jsonb, text, text) to service_role;
grant execute on function public.search_products(text) to anon, authenticated, service_role;
grant execute on function public.is_admin() to anon, authenticated, service_role;
