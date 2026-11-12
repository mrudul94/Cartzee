import { describe, expect, it } from "vitest";
import { canTransition, TRANSITIONS } from "@/lib/orders/status";
import { BUDGET_TIERS, getBudgetTier, inBudget } from "@/lib/utils/budget";
import { estimateDelivery, shippingFor } from "@/lib/utils/delivery";
import { calcDiscount, formatINR, slugify } from "@/lib/utils/format";
import { phoneSchema, pincodeSchema } from "@/lib/utils/validators";

describe("validators", () => {
  it("normalises Indian mobile numbers", () => {
    expect(phoneSchema.parse("+91 98765 43210")).toBe("9876543210");
    expect(phoneSchema.parse("09876543210")).toBe("9876543210");
    expect(phoneSchema.safeParse("5876543210").success).toBe(false);
    expect(phoneSchema.safeParse("98765").success).toBe(false);
  });
  it("validates PIN codes", () => {
    expect(pincodeSchema.safeParse("411001").success).toBe(true);
    expect(pincodeSchema.safeParse("011001").success).toBe(false);
    expect(pincodeSchema.safeParse("41100").success).toBe(false);
  });
});

describe("money and formatting", () => {
  it("formats rupees with Indian grouping", () => {
    expect(formatINR(129999)).toBe("₹1,29,999");
  });
  it("computes discounts", () => {
    expect(calcDiscount(899, 449)).toBe(50);
    expect(calcDiscount(100, 120)).toBe(0);
  });
  it("applies the free-shipping threshold", () => {
    expect(shippingFor(0)).toBe(0);
    expect(shippingFor(498)).toBe(49);
    expect(shippingFor(499)).toBe(0);
  });
  it("slugifies titles", () => {
    expect(slugify("Airtight Jar Set (6 pc)")).toBe("airtight-jar-set-6-pc");
  });
});

describe("delivery and budget", () => {
  it("estimates delivery by PIN zone", () => {
    const e = estimateDelivery("781001", new Date("2026-11-12T06:00:00Z"));
    expect(e?.region).toMatch(/North-East/);
    expect(estimateDelivery("000000")).toBeNull();
  });
  it("matches budget tiers", () => {
    expect(BUDGET_TIERS).toHaveLength(5);
    expect(inBudget(299, getBudgetTier("under-299")!)).toBe(true);
    expect(inBudget(300, getBudgetTier("under-299")!)).toBe(false);
    expect(inBudget(2199, getBudgetTier("above-1999")!)).toBe(true);
  });
});

describe("order status machine", () => {
  it("follows the documented flow", () => {
    expect(canTransition("pending_payment", "paid")).toBe(true);
    expect(canTransition("paid", "placed_on_meesho")).toBe(true);
    expect(canTransition("placed_on_meesho", "shipped")).toBe(true);
    expect(canTransition("shipped", "delivered")).toBe(true);
    expect(canTransition("delivered", "return_requested")).toBe(true);
    expect(canTransition("return_requested", "returned_refunded")).toBe(true);
    expect(canTransition("pending_payment", "shipped")).toBe(false);
    expect(TRANSITIONS.cancelled_refunded).toEqual([]);
  });
});
