"use client";

import { useEffect } from "react";
import { track } from "@/lib/utils/analytics";

export type PurchaseTrackerProps = {
  orderNumber: string;
  total: number;
  shipping: number;
  items: { id: string; title: string; price: number; quantity: number }[];
};

/** Sends the GA4 `purchase` event once per order (guarded against reloads). Renders nothing. */
export function PurchaseTracker({ orderNumber, total, shipping, items }: PurchaseTrackerProps) {
  useEffect(() => {
    const key = `cs-purchase-${orderNumber}`;
    try {
      if (sessionStorage.getItem(key) || localStorage.getItem(key)) return;
      localStorage.setItem(key, "1");
    } catch {
      /* storage blocked: still send once for this render */
    }
    track("purchase", {
      transaction_id: orderNumber,
      value: total,
      shipping,
      items: items.map((i) => ({ item_id: i.id, item_name: i.title, price: i.price, quantity: i.quantity })),
    });
  }, [orderNumber, total, shipping, items]);
  return null;
}
