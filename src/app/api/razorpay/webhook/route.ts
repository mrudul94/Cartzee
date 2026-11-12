import { NextResponse } from "next/server";
import { OrderError, repo } from "@/lib/data";
import { markOrderPaid } from "@/lib/orders/service";
import { verifyWebhookSignature } from "@/lib/payments/razorpay";

type PaymentEntity = { id: string; order_id: string | null; amount: number; status: string; error_description?: string };
type WebhookBody = {
  event: string;
  payload: { payment?: { entity: PaymentEntity }; order?: { entity: { id: string; amount_paid: number } } };
};

/**
 * POST /api/razorpay/webhook — the authoritative "payment captured" signal.
 * Configure in Razorpay Dashboard → Webhooks with events `payment.captured` and `order.paid`
 * and the same secret as RAZORPAY_WEBHOOK_SECRET.
 *
 * Responds 2xx for anything we have handled or intentionally ignore (so Razorpay stops retrying),
 * 400 for bad signatures, and 5xx only for transient failures worth retrying.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  if (!(await verifyWebhookSignature(raw, req.headers.get("x-razorpay-signature")))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let body: WebhookBody;
  try {
    body = JSON.parse(raw) as WebhookBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.event !== "payment.captured" && body.event !== "order.paid") {
    return NextResponse.json({ ok: true, ignored: body.event });
  }

  const payment = body.payload.payment?.entity;
  const razorpayOrderId = payment?.order_id ?? body.payload.order?.entity.id;
  if (!payment || !razorpayOrderId) return NextResponse.json({ ok: true, ignored: "no payment entity" });

  try {
    const order = await repo.findOrderByRazorpayOrderId(razorpayOrderId);
    if (!order) {
      console.warn(`[webhook] no order for ${razorpayOrderId}`);
      return NextResponse.json({ ok: true, ignored: "unknown order" });
    }
    const { changed } = await markOrderPaid(order.id, {
      razorpayOrderId,
      razorpayPaymentId: payment.id,
      amountPaise: payment.amount,
    });
    return NextResponse.json({ ok: true, order: order.number, changed });
  } catch (e) {
    if (e instanceof OrderError) {
      // Amount/order mismatch: do not retry, but flag loudly for manual review.
      console.error(`[webhook] rejected payment ${payment.id} for ${razorpayOrderId}: ${e.message}`);
      return NextResponse.json({ ok: false, error: e.message }, { status: 200 });
    }
    console.error("[webhook] failed", e);
    return NextResponse.json({ error: "Temporary failure" }, { status: 500 });
  }
}
