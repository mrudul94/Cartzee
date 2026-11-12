import { CreditCard, ShieldCheck, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { site } from "@/lib/site";

export type PrepaidNoticeProps = { variant?: "inline" | "box"; className?: string };

/** States the prepaid-only policy clearly (product page, cart, checkout). */
export function PrepaidNotice({ variant = "box", className }: PrepaidNoticeProps) {
  if (variant === "inline") {
    return (
      <p className={cn("flex items-start gap-2 text-sm text-text-muted", className)}>
        <ShieldCheck aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-success" />
        <span>
          <strong className="font-semibold text-text">Prepaid orders only.</strong> Pay by UPI, card or netbanking.
          No Cash on Delivery. Extra {site.upiDiscountPercent}% off on UPI.
        </span>
      </p>
    );
  }
  return (
    <div className={cn("rounded-md border border-border bg-background p-4", className)}>
      <p className="flex items-center gap-2 font-semibold text-text">
        <ShieldCheck aria-hidden className="h-5 w-5 text-success" />
        Secure prepaid checkout, no Cash on Delivery
      </p>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-muted">
        <li className="flex items-center gap-1.5">
          <Smartphone aria-hidden className="h-4 w-4" /> UPI (extra {site.upiDiscountPercent}% off)
        </li>
        <li className="flex items-center gap-1.5">
          <CreditCard aria-hidden className="h-4 w-4" /> Credit & debit cards
        </li>
        <li className="flex items-center gap-1.5">
          <CreditCard aria-hidden className="h-4 w-4" /> Netbanking
        </li>
      </ul>
      <p className="mt-2 text-sm text-text-muted">Payments are processed securely by Razorpay. We never store card details.</p>
    </div>
  );
}
