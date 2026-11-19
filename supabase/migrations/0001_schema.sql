-- Cartzee schema. Apply with `supabase db push` (or paste into the Supabase SQL editor in order).
-- Money is stored as numeric(10,2) rupees; Razorpay amounts are converted to paise in app code.
-- gen_random_uuid() is built into Postgres 13+ (no extension needed).


-- ---------------------------------------------------------------- helpers
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------- categories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  parent_id uuid references public.categories(id) on delete restrict,
  intro text not null default '',
  blurb text not null default '',
  image text not null default '',
  sort_order int not null default 0,
  seo_title text,
  seo_description text,
  faqs jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index categories_parent_idx on public.categories(parent_id);
create trigger categories_updated before update on public.categories for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,                       -- seed id (prd_001) for stable references
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  category_id uuid not null references public.categories(id) on delete restrict,
  subcategory_id uuid not null references public.categories(id) on delete restrict,
  title text not null,
  summary text not null default '',
  description text not null default '',
  how_to_use text[] not null default '{}',
  specs jsonb not null default '[]'::jsonb,
  material text not null default '',
  colour text not null default '',
  price numeric(10,2) not null check (price > 0),
  mrp numeric(10,2) not null,
  meesho_url text not null default '',
  meesho_price numeric(10,2) not null default 0 check (meesho_price >= 0),
  price_checked_at timestamptz not null default now(),
  rating numeric(2,1) not null default 0 check (rating between 0 and 5),
  review_count int not null default 0 check (review_count >= 0),
  stock int not null default 0 check (stock >= 0),
  is_bestseller boolean not null default false,
  is_flash_sale boolean not null default false,
  is_active boolean not null default true,
  faqs jsonb not null default '[]'::jsonb,
  seo_title text,
  seo_description text,
  search_vector tsvector generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(summary, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(material, '') || ' ' || coalesce(colour, '')), 'C')
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_mrp_gte_price check (mrp >= price)
);
create index products_category_idx on public.products(category_id) where is_active;
create index products_subcategory_idx on public.products(subcategory_id) where is_active;
create index products_price_idx on public.products(price) where is_active;
create index products_search_idx on public.products using gin(search_vector);
create trigger products_updated before update on public.products for each row execute function public.set_updated_at();

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  src text not null,
  alt text not null,
  sort_order int not null default 0
);
create index product_images_product_idx on public.product_images(product_id, sort_order);

-- ---------------------------------------------------------------- customers & orders
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique check (phone ~ '^[6-9][0-9]{9}$'),
  name text not null,
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger customers_updated before update on public.customers for each row execute function public.set_updated_at();

create type public.order_status as enum (
  'pending_payment', 'paid', 'placed_on_meesho', 'shipped', 'delivered',
  'cancelled_refunded', 'return_requested', 'returned_refunded'
);

create sequence public.order_number_seq start 1001;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  number text not null unique default ('CS' || nextval('public.order_number_seq')),
  customer_id uuid not null references public.customers(id) on delete restrict,
  status public.order_status not null default 'pending_payment',
  address jsonb not null,
  subtotal numeric(10,2) not null check (subtotal >= 0),
  shipping numeric(10,2) not null default 0 check (shipping >= 0),
  discount numeric(10,2) not null default 0 check (discount >= 0),
  total numeric(10,2) not null check (total >= 0),
  razorpay_order_id text unique,
  razorpay_payment_id text,
  meesho_order_id text,
  meesho_cost numeric(10,2),
  tracking_url text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_status_created_idx on public.orders(status, created_at desc);
create index orders_customer_idx on public.orders(customer_id);
create trigger orders_updated before update on public.orders for each row execute function public.set_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  slug text not null,
  path text not null,
  title text not null,
  image text not null default '',
  quantity int not null check (quantity between 1 and 10),
  -- locked at order time
  unit_price numeric(10,2) not null,
  unit_mrp numeric(10,2) not null,
  meesho_price numeric(10,2) not null,
  meesho_url text not null default ''
);
create index order_items_order_idx on public.order_items(order_id);

create table public.order_events (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  status public.order_status not null,
  note text,
  actor text not null default 'system',
  created_at timestamptz not null default now()
);
create index order_events_order_idx on public.order_events(order_id, created_at);

-- ---------------------------------------------------------------- content
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  author text not null,
  city text not null default '',
  rating smallint not null check (rating between 1 and 5),
  title text not null default '',
  body text not null default '',
  photos text[] not null default '{}',
  verified boolean not null default false,
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);
create index reviews_product_idx on public.reviews(product_id) where is_approved;

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  excerpt text not null default '',
  body jsonb not null default '[]'::jsonb,
  faqs jsonb not null default '[]'::jsonb,
  cover text not null default '',
  author text not null default 'Cartzee Team',
  is_published boolean not null default false,
  published_at timestamptz,
  updated_at timestamptz not null default now()
);
create trigger blog_posts_updated before update on public.blog_posts for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- admins (used by RLS + admin panel)
create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
