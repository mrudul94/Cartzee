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
import { CardOfferTags } from "./CardOfferTags";
import { WishlistButton } from "./WishlistButton";

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
 * "add to cart" button and a wishlist heart, then a 2-line title, a rating pill (only once there are real
 * reviews), price with MRP and % off, and offer chips (free delivery, UPI discount). The whole card links to the product.
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
        {/* One badge on the photo keeps cards clean: sold out, else discount, else New, else Bestseller. */}
        <div className="absolute left-2 top-2">
          {!product.inStock ? (
            <Badge variant="dark" className="normal-case tracking-normal">Sold out</Badge>
          ) : off > 0 ? (
            <Badge variant="sale" className="normal-case tracking-normal">{off}% off</Badge>
          ) : product.isNew ? (
            <Badge variant="success" className="normal-case tracking-normal">New</Badge>
          ) : (
            product.isBestseller && <Badge variant="outline" className="normal-case tracking-normal">Bestseller</Badge>
          )}
        </div>
        <WishlistButton slug={product.slug} title={product.title} className="absolute right-2 top-2 z-raised" />
        <AddToCartButton product={product} iconOnly className="absolute bottom-2 right-2 z-raised" />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-2">
        <H className="line-clamp-2 min-h-10 text-sm font-normal leading-snug text-text">
          <Link
            href={product.path}
            className="after:absolute after:inset-0 after:z-base focus-visible:outline-none focus-visible:after:shadow-focus"
          >
            {product.title}
          </Link>
        </H>
        {product.reviewCount > 0 && (
          <span className="flex items-center gap-1 text-xs">
            <span className="inline-flex items-center gap-1 rounded-sm bg-success px-1.5 py-0.5 font-semibold text-text-inverse">
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
        <CardOfferTags price={product.price} madeInIndia={product.madeInIndia} qualityCertified={product.qualityCertified} />
      </div>
    </article>
  );
}
