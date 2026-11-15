-- CMS: editable shop content, product "New" override, category visibility, admin activity log.
-- Content is validated in app code (src/lib/content/schema.ts) before it is written.

-- ---------------------------------------------------------------- site_content
create table public.site_content (
  key text primary key check (key ~ '^[a-z]+(:[a-z0-9-]+)?$'),
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by text not null default 'system'
);
create trigger site_content_updated before update on public.site_content for each row execute function public.set_updated_at();

alter table public.site_content enable row level security;
create policy "site content is public" on public.site_content for select to anon, authenticated using (true);
revoke insert, update, delete, truncate on public.site_content from anon, authenticated;

-- ---------------------------------------------------------------- products: manual "New" badge
-- null = automatic (created in the last 30 days), true = always New, false = never New.
alter table public.products add column is_new boolean;
grant select (is_new) on public.products to anon, authenticated;

-- ---------------------------------------------------------------- categories: visibility
alter table public.categories add column is_active boolean not null default true;
drop policy "categories are public" on public.categories;
create policy "visible categories are public" on public.categories for select to anon, authenticated
  using (is_active or public.is_admin());

-- ---------------------------------------------------------------- admin activity log
create table public.admin_activity (
  id bigint generated always as identity primary key,
  actor text not null,
  action text not null,
  target text not null default '',
  created_at timestamptz not null default now()
);
create index admin_activity_created_idx on public.admin_activity(created_at desc);

alter table public.admin_activity enable row level security;
revoke all on public.admin_activity from anon;
revoke insert, update, delete, truncate on public.admin_activity from authenticated;
create policy "admins read activity" on public.admin_activity for select to authenticated using (public.is_admin());
