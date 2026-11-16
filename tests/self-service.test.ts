import { beforeEach, describe, expect, it, vi } from "vitest";
import { testProducts } from "./fixtures/catalogue";

// Server actions need a Next request context for these.
vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn(), unstable_cache: (fn: unknown) => fn }));

// Pretend a shopper is signed in (mock mode has no Supabase accounts).
const session = vi.hoisted(() => ({ userId: "user-a" as string | null }));
vi.mock("@shop/lib/customer", async (orig) => ({
  ...(await orig<typeof import("@shop/lib/customer")>()),
  getCustomer: async () => (session.userId ? { id: session.userId, email: "a@example.com", name: "Asha", phone: "" } : null),
}));

const address = { name: "Asha Rao", phone: "9876501234", email: "a@example.com", line1: "4 Lake View Road", city: "Bengaluru", state: "Karnataka", pincode: "560001" };
const fd = (o: Record<string, string>) => {
  const f = new FormData();
  Object.entries(o).forEach(([k, v]) => f.set(k, v));
  return f;
};

async function paidOrder(userId = "user-a") {
  const { repo } = await import("@/lib/data");
  const { markOrderPaid } = await import("@/lib/orders/service");
  const order = await repo.createOrder({ address, items: [{ productId: testProducts[0]!.id, quantity: 1 }], delivery: { freeAbove: 499, fee: 49 }, userId });
  await markOrderPaid(order.id, { razorpayPaymentId: `pay_${order.id.slice(-6)}` });
  return order.id;
}

beforeEach(() => {
  session.userId = "user-a";
  vi.spyOn(console, "info").mockImplementation(() => {});
});

describe("what a shopper may do with an order", () => {
  it("depends on the stage and the return window", async () => {
    const { customerOrderOptions, CANCEL_REQUEST_NOTE } = await import("@/lib/orders/status");
    const at = (daysAgo: number) => new Date(Date.now() - daysAgo * 86_400_000).toISOString();
    expect(customerOrderOptions({ status: "paid", events: [] }, 7)).toMatchObject({ cancel: true, requestCancel: false, requestReturn: false });
    expect(customerOrderOptions({ status: "placed_on_meesho", events: [] }, 7)).toMatchObject({ cancel: false, requestCancel: true });
    expect(customerOrderOptions({ status: "placed_on_meesho", events: [{ status: "placed_on_meesho", note: `${CANCEL_REQUEST_NOTE}: x`, at: at(0) }] }, 7)).toMatchObject({ requestCancel: false, cancelRequested: true });
    expect(customerOrderOptions({ status: "shipped", events: [] }, 7)).toMatchObject({ cancel: false, requestCancel: false, requestReturn: false });
    expect(customerOrderOptions({ status: "delivered", events: [{ status: "delivered", at: at(2) }] }, 7).requestReturn).toBe(true);
    expect(customerOrderOptions({ status: "delivered", events: [{ status: "delivered", at: at(9) }] }, 7).requestReturn).toBe(false);
  });
});

describe("shopper order actions (mock mode)", () => {
  it("cancels and refunds a paid order, but only for its owner", async () => {
    const { repo } = await import("@/lib/data");
    const { cancelOrderAction } = await import("@shop/app/(store)/order/[id]/actions");
    const id = await paidOrder();

    session.userId = "someone-else";
    expect((await cancelOrderAction({}, fd({ orderId: id, reason: "Changed my mind" }))).message).toMatch(/not found/);
    session.userId = null;
    expect((await cancelOrderAction({}, fd({ orderId: id, reason: "Changed my mind" }))).message).toMatch(/not found/);

    session.userId = "user-a";
    expect((await cancelOrderAction({}, fd({ orderId: id, reason: "not a listed reason" }))).ok).toBeFalsy();
    expect((await cancelOrderAction({}, fd({ orderId: id, reason: "Changed my mind", details: "Bought locally" }))).ok).toBe(true);
    const o = await repo.getOrder(id);
    expect(o?.status).toBe("cancelled_refunded");
    expect(o?.events.at(-1)?.note).toMatch(/Cancelled by customer \(Changed my mind: Bought locally\).*Refund simulated/);
    // Can't cancel twice.
    expect((await cancelOrderAction({}, fd({ orderId: id, reason: "Changed my mind" }))).ok).toBeFalsy();
  });

  it("records a cancellation request once the order is with the supplier", async () => {
    const { repo } = await import("@/lib/data");
    const { requestCancellationAction, cancelOrderAction } = await import("@shop/app/(store)/order/[id]/actions");
    const id = await paidOrder();
    await repo.updateOrderStatus(id, "placed_on_meesho", { meeshoOrderId: "MS-1", meeshoCost: 200 }, "placed");

    expect((await cancelOrderAction({}, fd({ orderId: id, reason: "Changed my mind" }))).ok).toBeFalsy();
    expect((await requestCancellationAction({}, fd({ orderId: id, reason: "Ordered by mistake" }))).ok).toBe(true);
    const o = await repo.getOrder(id);
    expect(o?.status).toBe("placed_on_meesho");
    expect(o?.events.at(-1)?.note).toMatch(/^Customer requested cancellation: Ordered by mistake/);
    expect((await requestCancellationAction({}, fd({ orderId: id, reason: "Ordered by mistake" }))).ok).toBeFalsy();
  });

  it("opens a return after delivery", async () => {
    const { repo } = await import("@/lib/data");
    const { requestReturnAction } = await import("@shop/app/(store)/order/[id]/actions");
    const id = await paidOrder();
    expect((await requestReturnAction({}, fd({ orderId: id, reason: "Item arrived damaged" }))).ok).toBeFalsy();
    for (const s of ["placed_on_meesho", "shipped", "delivered"] as const) await repo.updateOrderStatus(id, s, {}, s);
    expect((await requestReturnAction({}, fd({ orderId: id, reason: "Item arrived damaged", details: "Lid cracked" }))).ok).toBe(true);
    expect((await repo.getOrder(id))?.status).toBe("return_requested");
  });
});
