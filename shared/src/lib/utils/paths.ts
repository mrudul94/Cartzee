import type { Category, Product } from "@/lib/types";

/** Canonical URL builders. The only place URL shapes are defined. */
export const paths = {
  home: () => "/",
  category: (c: Pick<Category, "slug" | "parentSlug">) => (c.parentSlug ? `/${c.parentSlug}/${c.slug}` : `/${c.slug}`),
  product: (p: Pick<Product, "categorySlug" | "subcategorySlug" | "slug">) =>
    // Subcategory is optional: products without one live directly under the category.
    p.subcategorySlug ? `/${p.categorySlug}/${p.subcategorySlug}/${p.slug}` : `/${p.categorySlug}/${p.slug}`,
  budget: (slug: string) => `/budget/${slug}`,
  flashSale: () => "/flash-sale",
  bestsellers: () => "/bestsellers",
  newArrivals: () => "/new-arrivals",
  search: (q?: string) => (q ? `/search?q=${encodeURIComponent(q)}` : "/search"),
  cart: () => "/cart",
  checkout: () => "/checkout",
  orderSuccess: (id: string) => `/order/${id}`,
  track: () => "/track-order",
  guides: () => "/guides",
  guide: (slug: string) => `/guides/${slug}`,
  policy: (slug: "shipping" | "returns" | "privacy" | "terms") => `/policies/${slug}`,
  about: () => "/about",
  contact: () => "/contact",
  faq: () => "/faq",
  login: () => "/account",
  signIn: (next?: string) => (next ? `/login?next=${encodeURIComponent(next)}` : "/login"),
  /** Admin website URLs (the admin is its own app, so routes start at "/"). */
  admin: (path = "/") => path,
} as const;
