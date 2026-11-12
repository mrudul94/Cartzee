import { NextResponse } from "next/server";
import { z } from "zod";
import { allowMockPayments } from "@/lib/config";
import { OrderError } from "@/lib/data";
import { markOrderPaid } from "@/lib/orders/service";

/**
 * POST /api/checkout/mock-pay — DEVELOPMENT ONLY. Simulates a successful payment through the
 * same `markOrderPaid` path the webhook uses. Disabled whenever Razorpay keys exist and in
 * production builds (unless ALLOW_MOCK_PAYMENTS=true on a staging deploy).
 */
export async function POST(req: Request) {
  if (!allowMockPayments) return NextResponse.json({ error: "Not available" }, { status: 404 });
  const parsed = z.object({ orderId: z.string().min(1) }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  try {
    const { order } = await markOrderPaid(parsed.data.orderId, { razorpayPaymentId: `pay_mock_${Date.now()}` });
    return NextResponse.json({ ok: true, orderId: order.id, number: order.number });
  } catch (e) {
    if (e instanceof OrderError) return NextResponse.json({ error: e.message }, { status: 404 });
    throw e;
  }
}
