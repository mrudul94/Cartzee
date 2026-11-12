const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

/** 1299 → "₹1,299" (Indian digit grouping, no paise). */
export function formatINR(amount: number): string {
  return inr.format(Math.round(amount));
}

/** Whole-number discount percentage between MRP and sale price (0 if none). */
export function calcDiscount(mrp: number, price: number): number {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

/** ISO date → "12 Nov 2026". */
export function formatDate(iso: string | Date): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/** "Airtight Jar Set (6 pc)" → "airtight-jar-set-6-pc". */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}
