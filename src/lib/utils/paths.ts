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
  /**
   * Admin URLs. With NEXT_PUBLIC_ADMIN_HOST set (production: admin.cityseller.in) the admin is its
   * own website and URLs have no /admin prefix (admin.cityseller.in/orders); locally they stay /admin/…
   * Route files always live under app/admin; middleware maps between the two.
   */
  admin: (path = "/") => {
    const clean = path === "/" ? "" : path;
    return process.env.NEXT_PUBLIC_ADMIN_HOST ? clean || "/" : `/admin${clean}`;
  },
} as const;
