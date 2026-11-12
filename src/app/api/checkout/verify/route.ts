import { NextResponse } from "next/server";
import { z } from "zod";
import { OrderError, repo } from "@/lib/data";
import { markOrderPaid } from "@/lib/orders/service";
import { verifyPaymentSignature } from "@/lib/payments/razorpay";

const schema = z.object({
  orderId: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

/**
 * POST /api/checkout/verify — called by the Checkout success handler. A valid signature proves
 * Razorpay processed the payment for this Razorpay order, so we confirm immediately for a fast
 * success page. The webhook confirms the same order independently; both paths are idempotent.
 */
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const p = parsed.data;

  const valid = await verifyPaymentSignature({ orderId: p.razorpay_order_id, paymentId: p.razorpay_payment_id, signature: p.razorpay_signature });
  if (!valid) return NextResponse.json({ error: "Payment could not be verified" }, { status: 400 });

  const order = await repo.getOrder(p.orderId);
  if (!order || order.razorpayOrderId !== p.razorpay_order_id) {
    return NextResponse.json({ error: "Payment does not match this order" }, { status: 400 });
  }

  try {
    const { order: paid } = await markOrderPaid(order.id, { razorpayOrderId: p.razorpay_order_id, razorpayPaymentId: p.razorpay_payment_id });
    return NextResponse.json({ ok: true, orderId: paid.id, number: paid.number, status: paid.status });
  } catch (e) {
    if (e instanceof OrderError) return NextResponse.json({ error: e.message }, { status: 409 });
    console.error("[verify] failed", e);
    return NextResponse.json({ error: "Could not confirm payment" }, { status: 500 });
  }
}
