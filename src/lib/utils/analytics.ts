/**
 * Thin GA4 event helper. No-op unless the GA script loaded (NEXT_PUBLIC_GA_ID set), so it is safe
 * to call anywhere on the client. Uses GA4's recommended ecommerce event names and item shape.
 */
type GtagItem = { item_id: string; item_name: string; price: number; quantity: number };
type EventParams = { currency?: "INR"; value?: number; transaction_id?: string; shipping?: number; items?: GtagItem[] };

declare global {
  interface Window {
    gtag?: (command: "event", name: string, params?: Record<string, unknown>) => void;
  }
}

export function track(event: "add_to_cart" | "begin_checkout" | "purchase" | "view_item", params: EventParams = {}): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", event, { currency: "INR", ...params });
}
