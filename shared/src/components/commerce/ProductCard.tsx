import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils/cn";
import { calcDiscount, formatBought } from "@/lib/utils/format";
import type { CardProduct } from "@/lib/utils/product";
import { AddToCartButton } from "./AddToCartButton";
import { PriceBlock } from "./PriceBlock";
import { FreeDeliveryTag } from "./FreeDeliveryTag";

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
 * Compact product tile (marketplace style): photo with discount and status badges and a round
 * "add to cart" button, then a 2-line title, a rating pill (only once there are reviews), price with
 * MRP and % off, and a "Free delivery" note. The whole card links to the product.
 */
export function ProductCard({ product, variant, priority = false, headingLevel = "h3", className }: ProductCardProps) {
  const off = calcDiscount(product.mrp, product.price);
  const bought = formatBought(product.boughtCount);
  const H = headingLevel;
  return (
    <article className={cn(cardVariants({ variant }), "transition duration-base hover:z-raised hover:scale-105 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:scale-100", className)}>
      <div className="relative aspect-product overflow-hidden bg-background">
        <Image
          src={product.image.src}
          alt={product.image.alt}
          fill
          sizes="(min-width: 1280px) 20vw, (min-width: 768px) 25vw, 50vw"
          priority={priority}
          className={cn(
            "object-cover transition duration-slow group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100",
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
            sizes="(min-width: 1280px) 20vw, (min-width: 768px) 25vw, 50vw"
            className="object-cover opacity-0 transition duration-slow group-hover:scale-110 group-hover:opacity-100 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        )}
        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {!product.inStock ? (
            <Badge variant="dark">Sold out</Badge>
          ) : (
            off > 0 && <Badge variant="sale">{off}% OFF</Badge>
          )}
          {product.isNew && product.inStock && <Badge variant="success">New</Badge>}
          {product.isBestseller && product.inStock && !product.isNew && <Badge variant="outline">Bestseller</Badge>}
        </div>
        <AddToCartButton product={product} iconOnly className="absolute bottom-2 right-2 z-raised" />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-2 md:p-3">
        <H className="line-clamp-2 text-sm font-medium leading-snug text-text md:text-base">
          <Link
            href={product.path}
            className="after:absolute after:inset-0 after:z-base focus-visible:outline-none focus-visible:after:shadow-focus"
          >
            {product.title}
          </Link>
        </H>
        {product.reviewCount > 0 && (
          <span className="flex items-center gap-1 text-xs">
            <span className="inline-flex items-center gap-1 rounded-sm bg-success-soft px-1 font-semibold text-success">
              <Star aria-hidden className="h-3 w-3" fill="currentColor" strokeWidth={0} />
              {product.rating.toFixed(1)}
            </span>
            <span className="text-text-muted">({product.reviewCount})</span>
            <span className="sr-only">
              Rated {product.rating.toFixed(1)} out of 5 from {product.reviewCount} reviews
            </span>
          </span>
        )}
        {bought && <span className="text-xs font-medium text-text-muted">{bought}</span>}
        <PriceBlock price={product.price} mrp={product.mrp} size="sm" className="mt-auto" />
        <FreeDeliveryTag price={product.price} />
      </div>
    </article>
  );
}
