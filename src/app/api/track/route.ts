import { NextResponse } from "next/server";
import { repo } from "@/lib/data";
import { STATUS_LABEL } from "@/lib/orders/status";
import { trackOrderSchema } from "@/lib/utils/validators";

/**
 * POST /api/track — order number + phone, no login. Returns only non-sensitive fields
 * (no address or email). Rate limiting is added at the Cloudflare edge in Milestone D.
 */
export async function POST(req: Request) {
  const parsed = trackOrderSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid order number and phone" }, { status: 422 });
  const order = await repo.findOrderForTracking(parsed.data.orderNumber, parsed.data.phone);
  if (!order) {
    return NextResponse.json({ error: "We could not find an order with that number and phone." }, { status: 404 });
  }
  return NextResponse.json({
    number: order.number,
    status: order.status,
    statusLabel: STATUS_LABEL[order.status],
    createdAt: order.createdAt,
    total: order.total,
    trackingUrl: order.trackingUrl ?? null,
    items: order.items.map((i) => ({ title: i.title, quantity: i.quantity, image: i.image, path: i.path })),
    events: order.events.map((e) => ({ status: e.status, label: STATUS_LABEL[e.status], at: e.at })),
  });
}
