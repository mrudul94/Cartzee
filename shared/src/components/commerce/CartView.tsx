"use client";

import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cartTotals, useCart } from "@/hooks/useCart";
import { useHydrated } from "@/hooks/useHydrated";
import { useSettings } from "@/components/layout/SettingsProvider";
import { paths } from "@/lib/utils/paths";
import { CartLineItem } from "./CartLineItem";
import { FreeShippingProgress, OrderSummary } from "./OrderSummary";
import { PrepaidNotice } from "./PrepaidNotice";

/** Full cart page body: line items + summary card with checkout CTA. */
export function CartView() {
  const hydrated = useHydrated();
  const { delivery } = useSettings();
  const items = useCart((s) => s.items);
  const totals = cartTotals(items, delivery);

  if (!hydrated) return <p className="py-16 text-center text-text-muted">Loading your cart…</p>;
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <ShoppingBag aria-hidden className="h-12 w-12 text-text-muted" />
        <p className="text-lg font-semibold">Your cart is empty</p>
        <Button href={paths.bestsellers()} variant="secondary">
          Shop bestsellers
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <Card padding="md" className="lg:col-span-2">
        <FreeShippingProgress subtotal={totals.subtotal} className="mb-2" />
        <ul className="divide-y divide-border">
          {items.map((l) => (
            <CartLineItem key={l.productId} line={l} size="md" />
          ))}
        </ul>
      </Card>
      <Card padding="md" className="flex flex-col gap-4 self-start lg:sticky lg:top-24">
        <OrderSummary title="Order summary" subtotal={totals.subtotal} shipping={totals.shipping} total={totals.total} savings={totals.savings} />
        <Button href={paths.checkout()} size="lg" fullWidth>
          Proceed to checkout
        </Button>
        <PrepaidNotice variant="inline" />
      </Card>
    </div>
  );
}
