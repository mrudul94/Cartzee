"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/commerce/ProductCard";
import { useHydrated } from "@/hooks/useHydrated";
import { useWishlist } from "@/hooks/useWishlist";
import type { CardProduct } from "@/lib/utils/product";

/** Wishlist page body: saved products (fresh prices and stock), or an empty state. */
export function WishlistView() {
  const hydrated = useHydrated();
  const slugs = useWishlist((s) => s.slugs);
  const [products, setProducts] = useState<CardProduct[] | null>(null);
  const key = slugs.join(",");
  useEffect(() => {
    if (!hydrated) return;
    if (!key) return setProducts([]);
    let live = true;
    fetch(`/api/products?slugs=${encodeURIComponent(key)}`)
      .then((r) => (r.ok ? r.json() : { products: [] }))
      .then((d: { products: CardProduct[] }) => live && setProducts(d.products))
      .catch(() => live && setProducts([]));
    return () => {
      live = false;
    };
  }, [hydrated, key]);

  if (products === null) return <p className="py-10 text-center text-text-muted">Loading your wishlist…</p>;
  // Keep the saved order; drop products that no longer exist.
  const shown = slugs.map((s) => products.find((p) => p.slug === s)).filter((p): p is CardProduct => Boolean(p));
  if (shown.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface px-4 py-12 text-center">
        <Heart aria-hidden className="h-10 w-10 text-primary" />
        <p className="text-lg font-semibold">Your wishlist is empty</p>
        <p className="max-w-narrow text-text-muted">Tap the heart on any product to save it here for later. Saved items stay on this device.</p>
        <Button href="/" variant="secondary">
          Start shopping
        </Button>
      </div>
    );
  }
  return (
    <>
      <p className="mb-3 text-text-muted" aria-live="polite">
        {shown.length} saved {shown.length === 1 ? "item" : "items"}
      </p>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {shown.map((p) => (
          <li key={p.id}>
            <ProductCard product={p} headingLevel="h2" />
          </li>
        ))}
      </ul>
    </>
  );
}
