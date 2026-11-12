import { NextResponse } from "next/server";
import { isMockMode, repo } from "@/lib/data";
import { checkoutSchema } from "@/lib/utils/validators";

/**
 * POST /api/checkout — validates the address + cart, re-prices from the catalogue,
 * creates a `pending_payment` order and returns what the client needs to collect payment.
 * Milestone B adds the Razorpay order creation branch.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check your details", issues: parsed.error.flatten() }, { status: 422 });
  }

  try {
    const order = await repo.createOrder(parsed.data);
    if (isMockMode) {
      return NextResponse.json({ mode: "mock", orderId: order.id, number: order.number, amount: order.total });
    }
    return NextResponse.json({ error: "Online payment is not configured yet" }, { status: 503 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Could not create order" }, { status: 409 });
  }
}
