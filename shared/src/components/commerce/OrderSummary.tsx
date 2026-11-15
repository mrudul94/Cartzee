"use client";

import { cn } from "@/lib/utils/cn";
import { useSettings } from "@/components/layout/SettingsProvider";
import { formatINR } from "@/lib/utils/format";

export type OrderSummaryProps = {
  subtotal: number;
  shipping: number;
  total: number;
  savings?: number;
  /** Show the "add ₹X more for free delivery" nudge. */
  showFreeShippingHint?: boolean;
  title?: string;
  className?: string;
};

/** Price breakdown used by cart drawer, cart page, checkout and order success. */
export function OrderSummary({ subtotal, shipping, total, savings = 0, showFreeShippingHint = false, title, className }: OrderSummaryProps) {
  return (
    <section className={cn("flex flex-col gap-3", className)} aria-label={title ?? "Order summary"}>
      {title && <h2 className="font-heading text-xl font-semibold">{title}</h2>}
      {showFreeShippingHint && <FreeShippingProgress subtotal={subtotal} />}
      <dl className="flex flex-col gap-2 text-base">
        <div className="flex justify-between">
          <dt className="text-text-muted">Subtotal</dt>
          <dd>{formatINR(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-text-muted">Delivery</dt>
          <dd>{shipping === 0 ? <span className="text-success">Free</span> : formatINR(shipping)}</dd>
        </div>
        {savings > 0 && (
          <div className="flex justify-between text-success">
            <dt>You save (on MRP)</dt>
            <dd>{formatINR(savings)}</dd>
          </div>
        )}
        <div className="flex justify-between border-t border-border pt-3 text-lg font-bold">
          <dt>Total</dt>
          <dd>{formatINR(total)}</dd>
        </div>
      </dl>
      <p className="text-sm text-text-muted">Inclusive of all taxes. UPI discount, if any, is applied at payment.</p>
    </section>
  );
}

/** "Add ₹X more for free delivery" message with a progress bar. */
export function FreeShippingProgress({ subtotal, className }: { subtotal: number; className?: string }) {
  const { freeAbove } = useSettings().delivery;
  if (subtotal <= 0 || freeAbove <= 0) return null;
  const remaining = freeAbove - subtotal;
  const progress = Math.min(100, (subtotal / freeAbove) * 100);
  return (
    <div className={className}>
      <p className="text-sm text-text">
        {remaining > 0 ? (
          <>
            Add <strong>{formatINR(remaining)}</strong> more for free delivery
          </>
        ) : (
          <strong className="text-success">You get free delivery</strong>
        )}
      </p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary" aria-hidden>
        <div className="h-full rounded-full bg-success transition-all duration-slow" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
