"use client";

import { useEffect, useRef, useState } from "react";
import { QuantityStepper } from "@/components/ui/Misc";
import { cn } from "@/lib/utils/cn";
import { formatINR } from "@/lib/utils/format";
import type { CardProduct } from "@/lib/utils/product";
import { AddToCartButton } from "./AddToCartButton";

export type ProductBuyBoxProps = { product: CardProduct; className?: string };

/**
 * Quantity + Add to Cart + Buy Now. On mobile, a sticky bottom bar (StickyBuyBar)
 * appears once the inline buttons scroll out of view.
 */
export function ProductBuyBox({ product, className }: ProductBuyBoxProps) {
  const [qty, setQty] = useState(1);
  const ref = useRef<HTMLDivElement>(null);
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setShowSticky(!entry?.isIntersecting && (entry?.boundingClientRect.top ?? 0) < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <div ref={ref} className={cn("flex flex-col gap-3", className)}>
        {product.inStock && (
          <div className="flex items-center gap-3">
            <span id="qty-label" className="text-sm font-medium">
              Quantity
            </span>
            <QuantityStepper value={qty} onChange={setQty} max={product.maxQty} label="Quantity" />
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <AddToCartButton product={product} quantity={qty} size="lg" fullWidth className={cn(!product.inStock && "col-span-2")} />
          {product.inStock && <AddToCartButton product={product} quantity={qty} mode="buy" size="lg" fullWidth />}
        </div>
      </div>
      <StickyBuyBar product={product} quantity={qty} visible={showSticky} />
    </>
  );
}

/** Mobile-only fixed bottom bar with price and buy actions. */
export function StickyBuyBar({ product, quantity, visible }: { product: CardProduct; quantity: number; visible: boolean }) {
  return (
    <div
      aria-hidden={!visible}
      className={cn(
        "fixed inset-x-0 bottom-0 z-sticky border-t border-border bg-surface px-4 py-3 shadow-lg transition-transform duration-base md:hidden",
        visible ? "translate-y-0" : "pointer-events-none translate-y-full",
      )}
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-text-muted">{product.title}</p>
          <p className="text-lg font-bold">{formatINR(product.price)}</p>
        </div>
        <AddToCartButton product={product} quantity={quantity} showIcon={false} label="Add" />
        {product.inStock && <AddToCartButton product={product} quantity={quantity} mode="buy" showIcon={false} label="Buy" />}
      </div>
    </div>
  );
}
