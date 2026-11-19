"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, ShoppingCart, Zap } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";
import { useCart } from "@/hooks/useCart";
import type { CardProduct } from "@/lib/utils/product";
import { track } from "@/lib/utils/analytics";
import { cn } from "@/lib/utils/cn";
import { paths } from "@/lib/utils/paths";

export type AddToCartButtonProps = {
  product: Pick<CardProduct, "id" | "slug" | "path" | "title" | "image" | "price" | "mrp" | "inStock" | "maxQty"> & { sizes?: string[] };
  /** Clothing size picked on the product page (required when the product has sizes). */
  chosenSize?: string;
  /** Called instead of adding when a size is required but not chosen. */
  onSizeMissing?: () => void;
  quantity?: number;
  /** "add" adds and opens the cart drawer; "buy" adds and goes straight to checkout. */
  mode?: "add" | "buy";
  label?: string;
  showIcon?: boolean;
  /** Round "+" icon button (compact product cards); full label is the accessible name. */
  iconOnly?: boolean;
} & Pick<ButtonProps, "size" | "fullWidth" | "className" | "variant">;

export function AddToCartButton({ product, quantity = 1, mode = "add", label, showIcon = true, iconOnly = false, chosenSize, onSizeMissing, size = "md", fullWidth, className, variant }: AddToCartButtonProps) {
  const add = useCart((s) => s.add);
  const open = useCart((s) => s.open);
  const router = useRouter();

  if (!product.inStock) {
    if (iconOnly) return null;
    return (
      <Button size={size} fullWidth={fullWidth} className={className} variant="soft" disabled>
        Sold out
      </Button>
    );
  }

  const hasSizes = (product.sizes?.length ?? 0) > 0;
  // On product cards a size can't be chosen, so the "+" opens the product page instead.
  if (iconOnly && hasSizes) {
    return (
      <Link
        href={product.path}
        aria-label={`Choose a size: ${product.title}`}
        title="Choose a size"
        className={cn(
          "inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-primary shadow-md transition-transform duration-fast hover:scale-105 focus-visible:outline-none focus-visible:shadow-focus",
          className,
        )}
      >
        <Plus aria-hidden className="h-5 w-5" strokeWidth={2.5} />
      </Link>
    );
  }

  const onClick = () => {
    if (hasSizes && !chosenSize) {
      onSizeMissing?.();
      toast({ tone: "error", title: "Choose a size", description: product.title });
      return;
    }
    add(
      {
        productId: product.id,
        slug: product.slug,
        path: product.path,
        title: product.title,
        image: product.image.src,
        price: product.price,
        mrp: product.mrp,
        maxQty: product.maxQty,
        ...(chosenSize ? { size: chosenSize } : {}),
      },
      quantity,
    );
    track("add_to_cart", { value: product.price * quantity, items: [{ item_id: product.id, item_name: product.title, price: product.price, quantity }] });
    if (mode === "buy") {
      router.push(paths.checkout());
    } else {
      toast({ title: "Added to cart", description: product.title });
      open();
    }
  };

  const isBuy = mode === "buy";
  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={`Add to cart: ${product.title}`}
        title="Add to cart"
        className={cn(
          "inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-primary shadow-md transition-transform duration-fast hover:scale-105 focus-visible:outline-none focus-visible:shadow-focus",
          className,
        )}
      >
        <Plus aria-hidden className="h-5 w-5" strokeWidth={2.5} />
      </button>
    );
  }
  return (
    <Button
      size={size}
      fullWidth={fullWidth}
      className={className}
      variant={variant ?? (isBuy ? "secondary" : "primary")}
      onClick={onClick}
      icon={showIcon ? isBuy ? <Zap aria-hidden className="h-4 w-4" /> : <ShoppingCart aria-hidden className="h-4 w-4" /> : undefined}
      aria-label={`${isBuy ? "Buy now" : "Add to cart"}: ${product.title}`}
    >
      {label ?? (isBuy ? "Buy Now" : "Add to Cart")}
    </Button>
  );
}
