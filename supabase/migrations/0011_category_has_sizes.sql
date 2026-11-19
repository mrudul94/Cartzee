-- Clothing categories: products in them must list sizes (Admin → Products shows the Sizes box only there).
alter table public.categories add column if not exists has_sizes boolean not null default false;

-- Switch it on for existing clothing categories (and their subcategories) by name.
update public.categories set has_sizes = true
where name ~* '(fashion|cloth|wear|apparel)'
   or parent_id in (select id from public.categories where name ~* '(fashion|cloth|wear|apparel)');
