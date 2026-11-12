"use client";

import { useRouter } from "next/navigation";
import { ShoppingBag, Zap } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";
import { useCart } from "@/hooks/useCart";
import type { CardProduct } from "@/lib/utils/product";
import { paths } from "@/lib/utils/paths";

export type AddToCartButtonProps = {
  product: Pick<CardProduct, "id" | "slug" | "path" | "title" | "image" | "price" | "mrp" | "inStock" | "maxQty">;
  quantity?: number;
  /** "add" adds and opens the cart drawer; "buy" adds and goes straight to checkout. */
  mode?: "add" | "buy";
  label?: string;
  showIcon?: boolean;
} & Pick<ButtonProps, "size" | "fullWidth" | "className" | "variant">;

export function AddToCartButton({ product, quantity = 1, mode = "add", label, showIcon = true, size = "md", fullWidth, className, variant }: AddToCartButtonProps) {
  const add = useCart((s) => s.add);
  const open = useCart((s) => s.open);
  const router = useRouter();

  if (!product.inStock) {
    return (
      <Button size={size} fullWidth={fullWidth} className={className} variant="soft" disabled>
        Sold out
      </Button>
    );
  }

  const onClick = () => {
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
      },
      quantity,
    );
    if (mode === "buy") {
      router.push(paths.checkout());
    } else {
      toast({ title: "Added to cart", description: product.title });
      open();
    }
  };

  const isBuy = mode === "buy";
  return (
    <Button
      size={size}
      fullWidth={fullWidth}
      className={className}
      variant={variant ?? (isBuy ? "secondary" : "primary")}
      onClick={onClick}
      icon={showIcon ? isBuy ? <Zap aria-hidden className="h-4 w-4" /> : <ShoppingBag aria-hidden className="h-4 w-4" /> : undefined}
      aria-label={`${isBuy ? "Buy now" : "Add to cart"}: ${product.title}`}
    >
      {label ?? (isBuy ? "Buy Now" : "Add to Cart")}
    </Button>
  );
}
