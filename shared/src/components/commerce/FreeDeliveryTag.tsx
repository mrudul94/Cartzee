"use client";

import { Truck } from "lucide-react";
import { useSettings } from "@/components/layout/SettingsProvider";
import { cn } from "@/lib/utils/cn";

/** "Free delivery" note on product cards when the price alone reaches the free-delivery threshold (from Settings). */
export function FreeDeliveryTag({ price, className }: { price: number; className?: string }) {
  const { freeAbove } = useSettings().delivery;
  if (price < freeAbove) return null;
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium text-success", className)}>
      <Truck aria-hidden className="h-4 w-4" />
      Free delivery
    </span>
  );
}
