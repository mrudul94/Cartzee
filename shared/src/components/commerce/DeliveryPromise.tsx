"use client";

import { Truck } from "lucide-react";
import { useSettings } from "@/components/layout/SettingsProvider";
import { usePincode } from "@/hooks/usePincode";
import { estimateDelivery } from "@/lib/utils/delivery";
import { formatINR } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

/**
 * Delivery line under the price: "Get it by <date>" for the shopper's saved PIN (from the header
 * "Deliver to" or the PIN checker), plus free delivery or the fee for this price.
 */
export function DeliveryPromise({ price, className }: { price: number; className?: string }) {
  const [pin] = usePincode();
  const { freeAbove, fee } = useSettings().delivery;
  const est = pin ? estimateDelivery(pin) : null;
  const free = price >= freeAbove;
  return (
    <p className={cn("flex items-start gap-2 text-sm text-text", className)}>
      <Truck aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-success" />
      <span>
        {est ? (
          <>
            Get it by <strong>{est.to}</strong> <span className="text-text-muted">(to {pin})</span>
          </>
        ) : (
          <>Delivery in 4 to 10 days across India. Add your PIN code below for an exact date.</>
        )}
        <br />
        {free ? (
          <strong className="text-success">Free delivery</strong>
        ) : (
          <span className="text-text-muted">
            {formatINR(fee)} delivery, free on orders above {formatINR(freeAbove)}
          </span>
        )}
      </span>
    </p>
  );
}
