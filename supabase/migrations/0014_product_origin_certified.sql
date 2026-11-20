-- Product trust labels on cards and product pages (Admin → Products → Details).
-- country_of_origin: shown as "Country of origin" on the product page and "Made in India" on cards when it is India
--   (Indian e-commerce rules require the country of origin on listings). Empty = not shown.
-- quality_certified: "Quality Certified" label; tick only for products with a real certification.
alter table public.products add column if not exists country_of_origin text not null default ''
  check (char_length(country_of_origin) <= 60);
alter table public.products add column if not exists quality_certified boolean not null default false;
grant select (country_of_origin, quality_certified) on public.products to anon, authenticated;
