import type { Category, Product } from "@/lib/types";

/** Canonical URL builders. The only place URL shapes are defined. */
export const paths = {
  home: () => "/",
  category: (c: Pick<Category, "slug" | "parentSlug">) => (c.parentSlug ? `/${c.parentSlug}/${c.slug}` : `/${c.slug}`),
  product: (p: Pick<Product, "categorySlug" | "subcategorySlug" | "slug">) =>
    `/${p.categorySlug}/${p.subcategorySlug}/${p.slug}`,
  budget: (slug: string) => `/budget/${slug}`,
  flashSale: () => "/flash-sale",
  bestsellers: () => "/bestsellers",
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
} as const;
