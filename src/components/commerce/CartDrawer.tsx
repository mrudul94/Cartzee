"use client";

import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Modal";
import { cartTotals, useCart } from "@/hooks/useCart";
import { useHydrated } from "@/hooks/useHydrated";
import { paths } from "@/lib/utils/paths";
import { CartLineItem } from "./CartLineItem";
import { FreeShippingProgress, OrderSummary } from "./OrderSummary";
import { PrepaidNotice } from "./PrepaidNotice";

/** Slide-in mini cart; opened by Add to Cart and the header cart button. Mounted once in the store layout. */
export function CartDrawer() {
  const hydrated = useHydrated();
  const { items, isOpen, setOpen, close } = useCart();
  const totals = cartTotals(items);
  const empty = !hydrated || items.length === 0;

  return (
    <Drawer
      open={isOpen}
      onOpenChange={setOpen}
      title={empty ? "Your cart" : `Your cart (${totals.count})`}
      footer={
        empty ? undefined : (
          <div className="flex flex-col gap-3">
            <OrderSummary subtotal={totals.subtotal} shipping={totals.shipping} total={totals.total} savings={totals.savings} />
            <Button href={paths.checkout()} onClick={close} size="lg" fullWidth>
              Checkout securely
            </Button>
            <Button href={paths.cart()} onClick={close} variant="link" className="self-center">
              View full cart
            </Button>
          </div>
        )
      }
    >
      {empty ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <ShoppingBag aria-hidden className="h-12 w-12 text-text-muted" />
          <p className="text-lg font-semibold">Your cart is empty</p>
          <p className="text-text-muted">Browse bestsellers and add something useful for your home.</p>
          <Button href={paths.bestsellers()} onClick={close} variant="secondary">
            Shop bestsellers
          </Button>
        </div>
      ) : (
        <>
          <FreeShippingProgress subtotal={totals.subtotal} />
          <ul className="divide-y divide-border">
            {items.map((l) => (
              <CartLineItem key={l.productId} line={l} />
            ))}
          </ul>
          <PrepaidNotice variant="inline" className="mt-2" />
        </>
      )}
    </Drawer>
  );
}
