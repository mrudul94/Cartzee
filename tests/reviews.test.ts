import { beforeEach, describe, expect, it, vi } from "vitest";
import { testProducts } from "./fixtures/catalogue";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn(), unstable_cache: (fn: unknown) => fn }));
const session = vi.hoisted(() => ({ userId: "buyer-1" as string | null }));
vi.mock("@shop/lib/customer", async (orig) => ({
  ...(await orig<typeof import("@shop/lib/customer")>()),
  getCustomer: async () => (session.userId ? { id: session.userId, email: "b@example.com", name: "Asha Rao", phone: "" } : null),
}));

const address = { name: "Asha Rao", phone: "9876501234", email: "b@example.com", line1: "4 Lake View Road", city: "Bengaluru", state: "Karnataka", pincode: "560001" };
const fd = (o: Record<string, string>) => {
  const f = new FormData();
  Object.entries(o).forEach(([k, v]) => f.set(k, v));
  return f;
};

beforeEach(() => {
  session.userId = "buyer-1";
  vi.spyOn(console, "info").mockImplementation(() => {});
});

describe("bought label", () => {
  it("rounds down honestly and hides small numbers", async () => {
    const { formatBought } = await import("@/lib/utils/format");
    expect(formatBought(0)).toBeNull();
    expect(formatBought(9)).toBeNull();
    expect(formatBought(10)).toBe("10+ bought");
    expect(formatBought(37)).toBe("30+ bought");
    expect(formatBought(250)).toBe("200+ bought");
    expect(formatBought(1000)).toBe("1k+ bought");
    expect(formatBought(1560)).toBe("1.5k+ bought");
  });
});

describe("customer reviews (mock mode)", () => {
  it("only the buyer can review, only after delivery, once per item; held for approval", async () => {
    const { repo } = await import("@/lib/data");
    const { markOrderPaid } = await import("@/lib/orders/service");
    const { submitReviewAction } = await import("@shop/app/(store)/order/[id]/actions");
    const product = testProducts[1]!;
    const order = await repo.createOrder({ address, items: [{ productId: product.id, quantity: 1 }], delivery: { freeAbove: 499, fee: 49 }, userId: "buyer-1" });
    await markOrderPaid(order.id, { razorpayPaymentId: "pay_rev_1" });
    const review = { orderId: order.id, productId: product.id, rating: "5", title: "Great mop", body: "Cleans the floor quickly and dries well." };

    expect((await submitReviewAction({}, fd(review))).message).toMatch(/once your order is delivered/);
    for (const s of ["placed_on_meesho", "shipped", "delivered"] as const) await repo.updateOrderStatus(order.id, s, {}, s);

    session.userId = "someone-else";
    expect((await submitReviewAction({}, fd(review))).message).toMatch(/not found/);
    session.userId = "buyer-1";
    expect((await submitReviewAction({}, fd({ ...review, rating: "0" }))).errors?.rating).toBeDefined();
    expect((await submitReviewAction({}, fd({ ...review, body: "ok" }))).errors?.body).toBeDefined();
    expect((await submitReviewAction({}, fd({ ...review, productId: testProducts[0]!.id }))).message).toMatch(/isn't in this order/);

    expect((await submitReviewAction({}, fd(review))).ok).toBe(true);
    expect(await repo.reviewedProductIds(order.id)).toEqual([product.id]);
    // Not public until approved.
    expect((await repo.listReviews(product.id)).some((r) => r.title === "Great mop")).toBe(false);
    expect((await submitReviewAction({}, fd(review))).message).toMatch(/already reviewed/);

    const { store } = await import("@/lib/data/seed-store");
    const saved = store.reviews.find((r) => r.orderId === order.id)!;
    expect(saved).toMatchObject({ author: "Asha R.", city: "Bengaluru", verified: true, isApproved: false, rating: 5 });
  });
});

describe("clothing sizes (mock mode + cart)", () => {
  it("cart keeps sizes apart and orders validate them", async () => {
    const { lineKey } = await import("@/hooks/useCart");
    expect(lineKey({ productId: "p1" })).toBe("p1");
    expect(lineKey({ productId: "p1", size: "M" })).not.toBe(lineKey({ productId: "p1", size: "L" }));

    const { repo } = await import("@/lib/data");
    const { store } = await import("@/lib/data/seed-store");
    const p = store.products.find((x) => x.id === testProducts[3]!.id)!;
    p.sizes = ["2-3Y", "4-5Y"];
    const order = (items: { productId: string; quantity: number; size?: string }[]) =>
      repo.createOrder({ address, items, delivery: { freeAbove: 499, fee: 49 }, userId: "buyer-1" });
    await expect(order([{ productId: p.id, quantity: 1 }])).rejects.toThrow(/Choose a size/);
    await expect(order([{ productId: p.id, quantity: 1, size: "9Y" }])).rejects.toThrow(/not available/);
    const ok = await order([{ productId: p.id, quantity: 1, size: "2-3Y" }, { productId: p.id, quantity: 1, size: "4-5Y" }]);
    expect(ok.items.map((i) => i.size).sort()).toEqual(["2-3Y", "4-5Y"]);
    p.sizes = [];
  });
});
