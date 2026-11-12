/** "Shop by Budget" tiers (₹). `max` is inclusive; the last tier is open-ended. */
export const BUDGET_TIERS = [
  { slug: "under-299", label: "Under ₹299", short: "₹299", min: 0, max: 299 },
  { slug: "under-599", label: "Under ₹599", short: "₹599", min: 0, max: 599 },
  { slug: "under-999", label: "Under ₹999", short: "₹999", min: 0, max: 999 },
  { slug: "under-1999", label: "Under ₹1,999", short: "₹1,999", min: 0, max: 1999 },
  { slug: "above-1999", label: "₹1,999 & above", short: "₹1,999+", min: 1999, max: Number.POSITIVE_INFINITY },
] as const;

export type BudgetTier = (typeof BUDGET_TIERS)[number];

export function getBudgetTier(slug: string): BudgetTier | undefined {
  return BUDGET_TIERS.find((t) => t.slug === slug);
}

export function inBudget(price: number, tier: BudgetTier): boolean {
  return price >= tier.min && price <= tier.max;
}
