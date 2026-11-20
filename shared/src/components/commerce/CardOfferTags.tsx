"use client";

import { BadgeCheck } from "lucide-react";
import { useSettings } from "@/components/layout/SettingsProvider";
import { cn } from "@/lib/utils/cn";

/**
 * Small trust chips on product cards: free delivery (from Settings, when the price reaches it), "Made in India"
 * (country of origin is India) and "Quality Certified" (set per product in the admin). The UPI discount is shown
 * on the product page and in checkout instead, to keep cards uncluttered.
 */
export function CardOfferTags({ price, madeInIndia = false, qualityCertified = false, className }: { price: number; madeInIndia?: boolean; qualityCertified?: boolean; className?: string }) {
  const { delivery } = useSettings();
  const free = price >= delivery.freeAbove;
  if (!free && !madeInIndia && !qualityCertified) return null;
  const chip = "inline-flex items-center gap-1 whitespace-nowrap rounded-sm px-1.5 py-0.5 text-xs font-medium";
  return (
    <span className={cn("flex flex-col items-start gap-1", className)}>
      {(free || madeInIndia) && (
        <span className="flex flex-wrap gap-1">
          {free && (
            <span className={cn(chip, "bg-success-soft text-success")}>Free delivery</span>
          )}
          {madeInIndia && <span className={cn(chip, "bg-neutral-soft text-text")}>Made in India</span>}
        </span>
      )}
      {qualityCertified && (
        <span className={cn(chip, "rounded-full bg-info-soft py-1 pl-1 pr-2 font-semibold text-info")}>
          <BadgeCheck aria-hidden className="h-4 w-4 fill-info text-info-soft" />
          Quality Certified
        </span>
      )}
    </span>
  );
}
