/**
 * Honest delivery estimate by PIN zone. Orders ship from supplier hubs; the first PIN digit
 * maps to the postal region. Days include 1 working day for us to place the order.
 */
const ZONES: Record<string, { region: string; min: number; max: number }> = {
  "1": { region: "North India", min: 5, max: 8 },
  "2": { region: "North India", min: 5, max: 8 },
  "3": { region: "West India", min: 4, max: 7 },
  "4": { region: "West & Central India", min: 4, max: 7 },
  "5": { region: "South India", min: 5, max: 8 },
  "6": { region: "South India", min: 5, max: 8 },
  "7": { region: "East & North-East India", min: 6, max: 10 },
  "8": { region: "East India", min: 6, max: 9 },
  "9": { region: "Army Post Office", min: 8, max: 14 },
};

export type DeliveryEstimate = { region: string; minDays: number; maxDays: number; from: string; to: string };

const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86_400_000);
const fmt = (d: Date) =>
  d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Kolkata" });

export function estimateDelivery(pincode: string, now = new Date()): DeliveryEstimate | null {
  if (!/^[1-9][0-9]{5}$/.test(pincode)) return null;
  const zone = ZONES[pincode.charAt(0)];
  if (!zone) return null;
  return {
    region: zone.region,
    minDays: zone.min,
    maxDays: zone.max,
    from: fmt(addDays(now, zone.min)),
    to: fmt(addDays(now, zone.max)),
  };
}

/** Flat shipping policy shared by cart, checkout and server-side order creation. */
export const SHIPPING = { freeAbove: 499, fee: 49 } as const;

export function shippingFor(subtotal: number): number {
  return subtotal === 0 || subtotal >= SHIPPING.freeAbove ? 0 : SHIPPING.fee;
}
