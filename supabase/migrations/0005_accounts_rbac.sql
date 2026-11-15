-- Customer accounts, admin roles/permissions and sign-in rate limiting.

-- ---------------------------------------------------------------- customer accounts
-- Orders placed by a signed-in shopper are linked to their auth user.
alter table public.orders add column user_id uuid references auth.users(id) on delete set null;
create index orders_user_idx on public.orders(user_id, created_at desc);

-- A signed-in customer can read only their own orders and order items (defence in depth;
-- the shop reads orders server-side). Customers can never write orders directly.
grant select on public.orders, public.order_items, public.order_events to authenticated;
create policy "customers read own orders" on public.orders for select to authenticated using (user_id = auth.uid());
create policy "customers read own order items" on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "customers read own order events" on public.order_events for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

-- ---------------------------------------------------------------- admin roles (RBAC)
alter table public.admins
  add column role text not null default 'admin' check (role in ('super_admin', 'admin')),
  add column permissions text[] not null default '{}'
    check (permissions <@ array['orders', 'products', 'content', 'reviews', 'settings']::text[]);
-- Everyone who was an admin before roles existed is the store owner: make them Super Admins.
update public.admins set role = 'super_admin';
-- Admin rows are only ever changed by the server (service role); admins can't edit their own role.
revoke insert, update, delete, truncate on public.admins from anon, authenticated;

-- ---------------------------------------------------------------- sign-in rate limiting
create table public.auth_attempts (
  id bigint generated always as identity primary key,
  key text not null,          -- e.g. "admin:email@example.com" or "mfa:<user id>"
  ip_hash text not null default '',
  success boolean not null,
  created_at timestamptz not null default now()
);
create index auth_attempts_key_idx on public.auth_attempts(key, created_at desc);
create index auth_attempts_ip_idx on public.auth_attempts(ip_hash, created_at desc);
alter table public.auth_attempts enable row level security;
revoke all on public.auth_attempts from anon, authenticated;
