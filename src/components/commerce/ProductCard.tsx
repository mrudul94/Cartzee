import Image from "next/image";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils/cn";
import { calcDiscount } from "@/lib/utils/format";
import type { CardProduct } from "@/lib/utils/product";
import { AddToCartButton } from "./AddToCartButton";
import { PriceBlock } from "./PriceBlock";
import { RatingStars } from "./RatingStars";

const cardVariants = cva("group relative flex h-full flex-col overflow-hidden rounded-lg bg-surface", {
  variants: {
    variant: { default: "border border-border", plain: "" },
  },
  defaultVariants: { variant: "default" },
});

export type ProductCardProps = VariantProps<typeof cardVariants> & {
  product: CardProduct;
  /** Set for above-the-fold cards to load the image eagerly (LCP). */
  priority?: boolean;
  headingLevel?: "h2" | "h3";
  className?: string;
};

/**
 * Product tile: image (second image on hover), discount badge, title, rating,
 * MRP/sale price and Add to Cart (or Sold out). Whole card is a link via a stretched title.
 */
export function ProductCard({ product, variant, priority = false, headingLevel = "h3", className }: ProductCardProps) {
  const off = calcDiscount(product.mrp, product.price);
  const H = headingLevel;
  return (
    <article className={cn(cardVariants({ variant }), className)}>
      <div className="relative aspect-product overflow-hidden bg-background">
        <Image
          src={product.image.src}
          alt={product.image.alt}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          priority={priority}
          className={cn(
            "object-cover transition-opacity duration-slow",
            product.hoverImage && "group-hover:opacity-0",
            !product.inStock && "opacity-60",
          )}
        />
        {product.hoverImage && (
          <Image
            src={product.hoverImage.src}
            alt=""
            aria-hidden
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover opacity-0 transition-opacity duration-slow group-hover:opacity-100"
          />
        )}
        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {!product.inStock ? (
            <Badge variant="dark">Sold out</Badge>
          ) : (
            off > 0 && <Badge variant="sale">{off}% off</Badge>
          )}
          {product.isBestseller && product.inStock && <Badge variant="outline">Bestseller</Badge>}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3 md:p-4">
        <H className="line-clamp-2 text-base font-medium leading-snug text-text">
          <Link
            href={product.path}
            className="after:absolute after:inset-0 after:z-base focus-visible:outline-none focus-visible:after:shadow-focus"
          >
            {product.title}
          </Link>
        </H>
        <RatingStars value={product.rating} count={product.reviewCount} />
        <PriceBlock price={product.price} mrp={product.mrp} size="sm" className="mt-auto" />
        <AddToCartButton product={product} size="sm" fullWidth className="relative z-raised" />
      </div>
    </article>
  );
}
