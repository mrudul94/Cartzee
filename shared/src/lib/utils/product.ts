import type { Product } from "@/lib/types";
import { paths } from "./paths";

/** Serializable product shape passed to client components (cards, listings, buy buttons). */
export type CardProduct = {
  id: string;
  slug: string;
  path: string;
  title: string;
  price: number;
  mrp: number;
  image: { src: string; alt: string };
  hoverImage?: { src: string; alt: string };
  rating: number;
  reviewCount: number;
  boughtCount: number;
  /** Clothing sizes; empty when the product has none. */
  sizes: string[];
  inStock: boolean;
  maxQty: number;
  material: string;
  colour: string;
  createdAt: string;
  isBestseller: boolean;
  /** Shows the "New" badge (see isProductNew). */
  isNew: boolean;
  /** Country of origin is India: "Made in India" label. */
  madeInIndia: boolean;
  qualityCertified: boolean;
};

/** Products added within this many days get the automatic "New" badge. */
export const NEW_BADGE_DAYS = 30;

/** New badge rule: manual override wins; otherwise automatic for NEW_BADGE_DAYS after the product was added. */
export function isProductNew(p: Pick<Product, "isNew" | "createdAt">, now = new Date()): boolean {
  if (p.isNew === true) return true;
  if (p.isNew === false) return false;
  return now.getTime() - new Date(p.createdAt).getTime() < NEW_BADGE_DAYS * 86_400_000;
}

export function toCardProduct(p: Product): CardProduct {
  return {
    id: p.id,
    slug: p.slug,
    path: paths.product(p),
    title: p.title,
    price: p.price,
    mrp: p.mrp,
    image: p.images[0] ?? { src: "/logo/mark.png", alt: p.title },
    hoverImage: p.images[1],
    rating: p.rating,
    reviewCount: p.reviewCount,
    boughtCount: p.boughtCount ?? 0,
    sizes: p.sizes ?? [],
    inStock: p.stock > 0,
    maxQty: Math.min(10, p.stock),
    material: p.material,
    colour: p.colour,
    createdAt: p.createdAt,
    isBestseller: p.isBestseller,
    isNew: isProductNew(p),
    madeInIndia: (p.countryOfOrigin ?? "").trim().toLowerCase() === "india",
    qualityCertified: p.qualityCertified ?? false,
  };
}

/** Shop order: products with an admin position first (lower first), then the rest newest first. */
export function byPosition(a: { position?: number | null; createdAt: string }, b: { position?: number | null; createdAt: string }) {
  const pa = a.position ?? Infinity;
  const pb = b.position ?? Infinity;
  if (pa !== pb) return pa - pb;
  return b.createdAt.localeCompare(a.createdAt);
}

/** "Trending now": most bought first, then best rated (with reviews), then newest. */
export function byTrending(
  a: { boughtCount?: number; rating: number; reviewCount: number; createdAt: string },
  b: { boughtCount?: number; rating: number; reviewCount: number; createdAt: string },
) {
  const bought = (b.boughtCount ?? 0) - (a.boughtCount ?? 0);
  if (bought !== 0) return bought;
  const score = (p: typeof a) => (p.reviewCount > 0 ? p.rating : 0);
  if (score(b) !== score(a)) return score(b) - score(a);
  return b.createdAt.localeCompare(a.createdAt);
}
