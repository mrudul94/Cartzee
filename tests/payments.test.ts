import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { testProducts as seedProducts } from "./fixtures/catalogue";

const WEBHOOK_SECRET = "whsec_test_123";
const KEY_SECRET = "key_secret_test_456";
const address = {
  name: "Test Buyer",
  phone: "9876543210",
  email: "buyer@example.com",
  line1: "12 MG Road, Flat 4B",
  city: "Pune",
  state: "Maharashtra" as const,
  pincode: "411001",
};

/** Fresh module graph per test so config re-reads the stubbed env. */
async function load() {
  vi.resetModules();
  const [{ repo }, rzp, webhook, verify, checkout] = await Promise.all([
    import("@/lib/data"),
    import("@/lib/payments/razorpay"),
    import("@shop/app/api/razorpay/webhook/route"),
    import("@shop/app/api/checkout/verify/route"),
    import("@shop/app/api/checkout/route"),
  ]);
  return { repo, rzp, webhook: webhook.POST, verify: verify.POST, checkout: checkout.POST };
}

const json = (url: string, body: unknown, headers: Record<string, string> = {}) =>
  new Request(`http://test${url}`, { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: typeof body === "string" ? body : JSON.stringify(body) });

let logs: string[];
beforeEach(() => {
  vi.stubEnv("RAZORPAY_WEBHOOK_SECRET", WEBHOOK_SECRET);
  vi.stubEnv("RAZORPAY_KEY_SECRET", KEY_SECRET);
  vi.stubEnv("RAZORPAY_KEY_ID", "");
  logs = [];
  vi.spyOn(console, "info").mockImplementation((...a) => void logs.push(a.join(" ")));
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

async function pendingOrder(m: Awaited<ReturnType<typeof load>>, rzpId: string) {
  const order = await m.repo.createOrder({ address, items: [{ productId: seedProducts[0]!.id, quantity: 1 }], delivery: { freeAbove: 499, fee: 49 } });
  await m.repo.attachRazorpayOrder(order.id, rzpId);
  return order;
}

function capturedEvent(orderId: string, amount: number, paymentId = "pay_T1") {
  return JSON.stringify({ event: "payment.captured", payload: { payment: { entity: { id: paymentId, order_id: orderId, amount, status: "captured" } } } });
}

describe("razorpay signatures", () => {
  it("verifies checkout and webhook signatures and rejects tampering", async () => {
    const { rzp } = await load();
    const sig = await rzp.signForTest(KEY_SECRET, "order_A|pay_B");
    expect(await rzp.verifyPaymentSignature({ orderId: "order_A", paymentId: "pay_B", signature: sig })).toBe(true);
    expect(await rzp.verifyPaymentSignature({ orderId: "order_A", paymentId: "pay_X", signature: sig })).toBe(false);
    const body = '{"event":"x"}';
    expect(await rzp.verifyWebhookSignature(body, await rzp.signForTest(WEBHOOK_SECRET, body))).toBe(true);
    expect(await rzp.verifyWebhookSignature(body + " ", await rzp.signForTest(WEBHOOK_SECRET, body))).toBe(false);
    expect(await rzp.verifyWebhookSignature(body, null)).toBe(false);
  });
  it("converts rupees to paise without float drift", async () => {
    const { rzp } = await load();
    expect(rzp.toPaise(449.1)).toBe(44910);
    expect(rzp.toPaise(1097)).toBe(109700);
  });
});

describe("POST /api/razorpay/webhook", () => {
  it("marks the order paid once and notifies once, even when delivered twice", async () => {
    const m = await load();
    const order = await pendingOrder(m, "order_W1");
    const raw = capturedEvent("order_W1", order.total * 100);
    const sig = await m.rzp.signForTest(WEBHOOK_SECRET, raw);

    const first = await m.webhook(json("/api/razorpay/webhook", raw, { "x-razorpay-signature": sig }));
    expect(first.status).toBe(200);
    expect(await first.json()).toMatchObject({ ok: true, changed: true });
    const second = await m.webhook(json("/api/razorpay/webhook", raw, { "x-razorpay-signature": sig }));
    expect(await second.json()).toMatchObject({ ok: true, changed: false });

    const saved = await m.repo.getOrder(order.id);
    expect(saved?.status).toBe("paid");
    expect(saved?.razorpayPaymentId).toBe("pay_T1");
    expect(logs.filter((l) => l.includes("[email:mock]") && l.includes(order.number))).toHaveLength(1);
    expect(logs.filter((l) => l.includes("[telegram:mock]") && l.includes(order.number))).toHaveLength(1);
  });

  it("rejects a bad signature with 400 and leaves the order unpaid", async () => {
    const m = await load();
    const order = await pendingOrder(m, "order_W2");
    const raw = capturedEvent("order_W2", order.total * 100);
    const res = await m.webhook(json("/api/razorpay/webhook", raw, { "x-razorpay-signature": "deadbeef" }));
    expect(res.status).toBe(400);
    expect((await m.repo.getOrder(order.id))?.status).toBe("pending_payment");
  });

  it("refuses an amount mismatch without asking Razorpay to retry", async () => {
    const m = await load();
    const order = await pendingOrder(m, "order_W3");
    const raw = capturedEvent("order_W3", 100);
    const res = await m.webhook(json("/api/razorpay/webhook", raw, { "x-razorpay-signature": await m.rzp.signForTest(WEBHOOK_SECRET, raw) }));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: false });
    expect((await m.repo.getOrder(order.id))?.status).toBe("pending_payment");
  });

  it("acknowledges unknown orders and unrelated events", async () => {
    const m = await load();
    const raw1 = capturedEvent("order_UNKNOWN", 100);
    const r1 = await m.webhook(json("/x", raw1, { "x-razorpay-signature": await m.rzp.signForTest(WEBHOOK_SECRET, raw1) }));
    expect(await r1.json()).toMatchObject({ ok: true, ignored: "unknown order" });
    const raw2 = JSON.stringify({ event: "refund.created", payload: {} });
    const r2 = await m.webhook(json("/x", raw2, { "x-razorpay-signature": await m.rzp.signForTest(WEBHOOK_SECRET, raw2) }));
    expect(await r2.json()).toMatchObject({ ok: true, ignored: "refund.created" });
  });
});

describe("POST /api/checkout/verify", () => {
  it("confirms a correctly signed payment, and then the webhook is a no-op", async () => {
    const m = await load();
    const order = await pendingOrder(m, "order_V1");
    const signature = await m.rzp.signForTest(KEY_SECRET, "order_V1|pay_V1");
    const res = await m.verify(json("/api/checkout/verify", { orderId: order.id, razorpay_order_id: "order_V1", razorpay_payment_id: "pay_V1", razorpay_signature: signature }));
    expect(res.status).toBe(200);
    expect((await m.repo.getOrder(order.id))?.status).toBe("paid");

    const raw = capturedEvent("order_V1", order.total * 100, "pay_V1");
    const hook = await m.webhook(json("/x", raw, { "x-razorpay-signature": await m.rzp.signForTest(WEBHOOK_SECRET, raw) }));
    expect(await hook.json()).toMatchObject({ changed: false });
    expect(logs.filter((l) => l.includes("[email:mock]") && l.includes(order.number))).toHaveLength(1);
  });

  it("rejects forged signatures and payments for a different order", async () => {
    const m = await load();
    const order = await pendingOrder(m, "order_V2");
    const forged = await m.verify(json("/v", { orderId: order.id, razorpay_order_id: "order_V2", razorpay_payment_id: "pay_V2", razorpay_signature: "00" }));
    expect(forged.status).toBe(400);
    const otherSig = await m.rzp.signForTest(KEY_SECRET, "order_OTHER|pay_V2");
    const mismatch = await m.verify(json("/v", { orderId: order.id, razorpay_order_id: "order_OTHER", razorpay_payment_id: "pay_V2", razorpay_signature: otherSig }));
    expect(mismatch.status).toBe(400);
    expect((await m.repo.getOrder(order.id))?.status).toBe("pending_payment");
  });
});

describe("POST /api/checkout", () => {
  const body = { address, items: [{ productId: seedProducts[0]!.id, quantity: 2 }] };

  it("returns mock mode in development without Razorpay keys", async () => {
    const m = await load();
    const res = await m.checkout(json("/api/checkout", body));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ mode: "mock", amount: seedProducts[0]!.price * 2 });
  });

  it("refuses to take orders in production without Razorpay keys", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const m = await load();
    const res = await m.checkout(json("/api/checkout", body));
    expect(res.status).toBe(503);
  });

  it("validates Indian phone and PIN codes", async () => {
    const m = await load();
    const res = await m.checkout(json("/api/checkout", { ...body, address: { ...address, phone: "12345", pincode: "011001" } }));
    expect(res.status).toBe(422);
  });

  it("disables mock payments in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.resetModules();
    const { POST } = await import("@shop/app/api/checkout/mock-pay/route");
    const res = await POST(json("/api/checkout/mock-pay", { orderId: "anything" }));
    expect(res.status).toBe(404);
  });
});
