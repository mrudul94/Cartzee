"use client";

import { ShoppingCart } from "lucide-react";
import { cartTotals, useCart } from "@/hooks/useCart";
import { useHydrated } from "@/hooks/useHydrated";
import { useSettings } from "@/components/layout/SettingsProvider";

/** Header cart: trolley icon with live item count; opens the CartDrawer. */
export function CartButton() {
  const hydrated = useHydrated();
  const { delivery } = useSettings();
  const items = useCart((s) => s.items);
  const open = useCart((s) => s.open);
  const count = hydrated ? cartTotals(items, delivery).count : 0;
  return (
    <button
      type="button"
      onClick={open}
      aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}
      className="inline-flex h-11 w-11 items-center justify-center rounded-md text-text hover:bg-secondary/60 focus-visible:outline-none focus-visible:shadow-focus"
    >
      <span className="relative">
        <ShoppingCart aria-hidden className="h-6 w-6" />
        {count > 0 && (
          <span aria-hidden className="absolute -right-3 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-text-inverse">
            {count}
          </span>
        )}
      </span>
    </button>
  );
}
