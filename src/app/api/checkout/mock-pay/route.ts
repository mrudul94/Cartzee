import { NextResponse } from "next/server";
import { z } from "zod";
import { isMockMode } from "@/lib/data";
import { markOrderPaid } from "@/lib/orders/service";

/**
 * POST /api/checkout/mock-pay — DEVELOPMENT ONLY. Simulates a successful Razorpay payment
 * by running the same `markOrderPaid` path the webhook uses. Disabled once Razorpay keys exist.
 */
export async function POST(req: Request) {
  if (!isMockMode) return NextResponse.json({ error: "Not available" }, { status: 404 });
  const parsed = z.object({ orderId: z.string().min(1) }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const order = await markOrderPaid(parsed.data.orderId, { razorpayPaymentId: `pay_mock_${Date.now()}` });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json({ ok: true, orderId: order.id, number: order.number });
}
