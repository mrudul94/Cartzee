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
  const [chosenSize, setChosenSize] = useState<string>();
  const [sizeError, setSizeError] = useState(false);
  const sizeRef = useRef<HTMLFieldSetElement>(null);
  const onSizeMissing = () => {
    setSizeError(true);
    sizeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    sizeRef.current?.querySelector("input")?.focus();
  };
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
        {product.inStock && product.sizes.length > 0 && (
          <fieldset ref={sizeRef} aria-describedby={sizeError ? "size-error" : undefined}>
            <legend className="mb-2 text-sm font-medium">
              Size{chosenSize ? `: ${chosenSize}` : ""} <span className="text-error">*</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <label key={s} className="cursor-pointer">
                  <input
                    type="radio"
                    name="size"
                    value={s}
                    checked={chosenSize === s}
                    onChange={() => {
                      setChosenSize(s);
                      setSizeError(false);
                    }}
                    className="peer sr-only"
                  />
                  <span
                    className={cn(
                      "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border px-3 text-sm font-semibold transition-colors duration-fast peer-focus-visible:shadow-focus",
                      chosenSize === s ? "border-ink bg-ink text-text-inverse" : "border-border-strong bg-surface text-text hover:border-ink",
                      sizeError && "border-error",
                    )}
                  >
                    {s}
                  </span>
                </label>
              ))}
            </div>
            {sizeError && (
              <p id="size-error" role="alert" className="mt-2 text-sm text-error">
                Please choose a size.
              </p>
            )}
          </fieldset>
        )}
        {product.inStock && (
          <div className="flex items-center gap-3">
            <span id="qty-label" className="text-sm font-medium">
              Quantity
            </span>
            <QuantityStepper value={qty} onChange={setQty} max={product.maxQty} label="Quantity" />
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <AddToCartButton product={product} quantity={qty} chosenSize={chosenSize} onSizeMissing={onSizeMissing} size="lg" fullWidth className={cn(!product.inStock && "col-span-2")} />
          {product.inStock && <AddToCartButton product={product} quantity={qty} chosenSize={chosenSize} onSizeMissing={onSizeMissing} mode="buy" size="lg" fullWidth />}
        </div>
      </div>
      <StickyBuyBar product={product} quantity={qty} chosenSize={chosenSize} onSizeMissing={onSizeMissing} visible={showSticky} />
    </>
  );
}

/** Mobile-only fixed bottom bar with price and buy actions. */
export function StickyBuyBar({
  product,
  quantity,
  visible,
  chosenSize,
  onSizeMissing,
}: {
  product: CardProduct;
  quantity: number;
  visible: boolean;
  chosenSize?: string;
  onSizeMissing?: () => void;
}) {
  return (
    <div
      aria-hidden={!visible}
      className={cn(
        // Sits just above the floating phone bottom bar (MobileTabBar).
        "fixed inset-x-0 bottom-20 z-sticky border-t border-border bg-surface px-4 py-3 shadow-lg transition duration-base md:hidden",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0",
      )}
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-text-muted">{product.title}</p>
          <p className="text-lg font-bold">{formatINR(product.price)}</p>
        </div>
        <AddToCartButton product={product} quantity={quantity} chosenSize={chosenSize} onSizeMissing={onSizeMissing} showIcon={false} label="Add" />
        {product.inStock && <AddToCartButton product={product} quantity={quantity} chosenSize={chosenSize} onSizeMissing={onSizeMissing} mode="buy" showIcon={false} label="Buy" />}
      </div>
    </div>
  );
}
