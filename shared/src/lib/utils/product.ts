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
  inStock: boolean;
  maxQty: number;
  material: string;
  colour: string;
  createdAt: string;
  isBestseller: boolean;
  /** Shows the "New" badge (see isProductNew). */
  isNew: boolean;
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
    inStock: p.stock > 0,
    maxQty: Math.min(10, p.stock),
    material: p.material,
    colour: p.colour,
    createdAt: p.createdAt,
    isBestseller: p.isBestseller,
    isNew: isProductNew(p),
  };
}
