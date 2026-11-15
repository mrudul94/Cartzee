import { NextResponse } from "next/server";
import { allowMockPayments, config, isRazorpayConfigured } from "@/lib/config";
import { OrderError, repo } from "@/lib/data";
import { getSettings } from "@/lib/data/content-repo";
import { customerAuthEnabled, getCustomer } from "@/lib/customer";
import { createRazorpayOrder, toPaise } from "@/lib/payments/razorpay";
import { site } from "@/lib/site";
import { checkoutSchema } from "@/lib/utils/validators";

/**
 * POST /api/checkout — validates address + cart, creates a `pending_payment` order priced
 * from the catalogue, then a Razorpay order for the same amount. Returns Checkout options.
 * Without Razorpay keys (dev only) it returns mode "mock" for the simulated payment flow.
 */
export async function POST(req: Request) {
  const parsed = checkoutSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check your details", issues: parsed.error.flatten() }, { status: 422 });
  }
  if (!isRazorpayConfigured && !allowMockPayments) {
    console.error("[checkout] Razorpay keys missing in production");
    return NextResponse.json({ error: "Online payment is temporarily unavailable. Please try again shortly." }, { status: 503 });
  }

  // Placing an order needs a signed-in shopper account (browsing doesn't).
  const customer = await getCustomer();
  if (customerAuthEnabled && !customer) {
    return NextResponse.json({ error: "Please sign in to place your order.", login: true }, { status: 401 });
  }

  let order;
  try {
    const { delivery } = await getSettings();
    order = await repo.createOrder({ ...parsed.data, delivery, userId: customer?.id });
  } catch (e) {
    if (e instanceof OrderError) return NextResponse.json({ error: e.message }, { status: 409 });
    console.error("[checkout] create order failed", e);
    return NextResponse.json({ error: "Could not create your order. Please try again." }, { status: 500 });
  }

  if (!isRazorpayConfigured) {
    return NextResponse.json({ mode: "mock", orderId: order.id, number: order.number, amount: order.total });
  }

  try {
    const rzp = await createRazorpayOrder({
      amountPaise: toPaise(order.total),
      receipt: order.number,
      notes: { orderId: order.id, orderNumber: order.number },
    });
    await repo.attachRazorpayOrder(order.id, rzp.id);
    const { address } = parsed.data;
    return NextResponse.json({
      mode: "razorpay",
      orderId: order.id,
      number: order.number,
      checkout: {
        key: config.razorpay.keyId,
        order_id: rzp.id,
        amount: rzp.amount,
        currency: rzp.currency,
        name: site.name,
        description: `Order ${order.number}`,
        prefill: { name: address.name, email: address.email, contact: `+91${address.phone}` },
        notes: { orderNumber: order.number },
        readonly: { contact: true, email: true },
      },
    });
  } catch (e) {
    console.error("[checkout] razorpay order failed", e);
    return NextResponse.json({ error: "Could not start payment. You have not been charged; please try again." }, { status: 502 });
  }
}
