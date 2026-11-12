"use client";

import { ShoppingBag } from "lucide-react";
import { cartTotals, useCart } from "@/hooks/useCart";
import { useHydrated } from "@/hooks/useHydrated";

/** Header cart icon with live item count; opens the CartDrawer. */
export function CartButton() {
  const hydrated = useHydrated();
  const items = useCart((s) => s.items);
  const open = useCart((s) => s.open);
  const count = hydrated ? cartTotals(items).count : 0;
  return (
    <button
      type="button"
      onClick={open}
      aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-md text-text hover:bg-secondary/60 focus-visible:outline-none focus-visible:shadow-focus"
    >
      <ShoppingBag aria-hidden className="h-6 w-6" />
      {count > 0 && (
        <span aria-hidden className="absolute right-0.5 top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-text-inverse">
          {count}
        </span>
      )}
    </button>
  );
}
