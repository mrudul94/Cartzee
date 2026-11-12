"use client";

import { useCallback } from "react";

const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

export type RazorpayCheckoutOptions = {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  readonly?: { contact?: boolean; email?: boolean };
};

export type RazorpaySuccess = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };

type RazorpayInstance = { open: () => void; on: (event: string, cb: (r: { error?: { description?: string } }) => void) => void };
type RazorpayCtor = new (opts: Record<string, unknown>) => RazorpayInstance;
declare global {
  interface Window {
    Razorpay?: RazorpayCtor;
  }
}

let loading: Promise<RazorpayCtor> | null = null;

/** Loads checkout.js once, on demand (keeps it off every page for performance). */
function loadScript(): Promise<RazorpayCtor> {
  if (window.Razorpay) return Promise.resolve(window.Razorpay);
  loading ??= new Promise<RazorpayCtor>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.onload = () => (window.Razorpay ? resolve(window.Razorpay) : reject(new Error("Razorpay failed to load")));
    s.onerror = () => {
      loading = null;
      reject(new Error("Could not load the payment window. Check your connection and try again."));
    };
    document.body.appendChild(s);
  });
  return loading;
}

export class PaymentDismissedError extends Error {
  constructor() {
    super("Payment was cancelled. You have not been charged.");
  }
}

/**
 * Opens Razorpay Checkout and resolves with the signed success payload, or rejects when the
 * customer closes the window (PaymentDismissedError) or the payment fails.
 */
export function useRazorpay() {
  return useCallback(async (options: RazorpayCheckoutOptions, theme?: { color?: string }) => {
    const Razorpay = await loadScript();
    return new Promise<RazorpaySuccess>((resolve, reject) => {
      const rzp = new Razorpay({
        ...options,
        theme,
        handler: (r: RazorpaySuccess) => resolve(r),
        modal: { ondismiss: () => reject(new PaymentDismissedError()), confirm_close: true },
        retry: { enabled: true, max_count: 2 },
      });
      rzp.on("payment.failed", (r) => reject(new Error(r.error?.description ?? "Payment failed. You have not been charged.")));
      rzp.open();
    });
  }, []);
}
