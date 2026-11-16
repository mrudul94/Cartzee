-- Saved delivery addresses for shopper accounts (My account → Saved addresses; prefilled at checkout).
-- Row-level security: a signed-in shopper can only read and change their own addresses.

create table if not exists public.customer_addresses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  label       text not null default '' check (char_length(label) <= 30),
  name        text not null check (char_length(name) between 2 and 80),
  phone       text not null check (phone ~ '^[6-9][0-9]{9}$'),
  line1       text not null check (char_length(line1) between 5 and 120),
  line2       text not null default '' check (char_length(line2) <= 120),
  landmark    text not null default '' check (char_length(landmark) <= 80),
  city        text not null check (char_length(city) between 2 and 60),
  state       text not null check (char_length(state) between 2 and 60),
  pincode     text not null check (pincode ~ '^[1-9][0-9]{5}$'),
  is_default  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists customer_addresses_user_idx on public.customer_addresses (user_id);
-- At most one default address per shopper.
create unique index if not exists customer_addresses_one_default on public.customer_addresses (user_id) where is_default;

alter table public.customer_addresses enable row level security;
revoke all on public.customer_addresses from anon, authenticated;
grant select, insert, update, delete on public.customer_addresses to authenticated;

drop policy if exists "own addresses" on public.customer_addresses;
create policy "own addresses" on public.customer_addresses
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
