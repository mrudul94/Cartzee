"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export type OrderStatusPollerProps = { intervalMs?: number; maxAttempts?: number };

/**
 * While an order is still `pending_payment` (webhook not yet received), refreshes the server
 * component every few seconds so the page flips to "confirmed" without a manual reload.
 */
export function OrderStatusPoller({ intervalMs = 3000, maxAttempts = 20 }: OrderStatusPollerProps) {
  const router = useRouter();
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (attempts >= maxAttempts) return;
    const t = setTimeout(() => {
      router.refresh();
      setAttempts((n) => n + 1);
    }, intervalMs);
    return () => clearTimeout(t);
  }, [attempts, intervalMs, maxAttempts, router]);

  return (
    <p role="status" className="flex items-center justify-center gap-2 text-sm text-text-muted">
      {attempts < maxAttempts ? (
        <>
          <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> Confirming your payment with the bank…
        </>
      ) : (
        "This is taking longer than usual. If money was deducted, your order will be confirmed automatically, or refunded within 5 to 7 days."
      )}
    </p>
  );
}
