import "server-only";
import { repo } from "@/lib/data";
import { notifyAdmins, sendEmail } from "@/lib/notify";
import { site } from "@/lib/site";
import type { Order, OrderStatus } from "@/lib/types";
import { formatINR } from "@/lib/utils/format";
import { canTransition, STATUS_LABEL } from "./status";

/** Escapes text for safe interpolation into email HTML. */
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function itemsText(o: Order) {
  return o.items.map((i) => `${i.quantity} x ${i.title} @ ${formatINR(i.unitPrice)}`).join("\n");
}

function confirmationEmail(o: Order) {
  const trackUrl = `${site.url}/track-order?order=${o.number}`;
  const text = `Hi ${o.address.name},\n\nThank you for your order ${o.number}. Payment of ${formatINR(o.total)} is confirmed.\n\n${itemsText(o)}\n\nWe will email you when it ships. Track anytime: ${trackUrl}\n\n${site.name} · ${site.care.phone} · ${site.care.email}`;
  const html = `<p>Hi ${esc(o.address.name)},</p><p>Thank you for your order <strong>${o.number}</strong>. Payment of <strong>${formatINR(o.total)}</strong> is confirmed.</p><ul>${o.items
    .map((i) => `<li>${i.quantity} × ${esc(i.title)} (${formatINR(i.unitPrice)})</li>`)
    .join("")}</ul><p>We will email you when it ships. <a href="${trackUrl}">Track your order</a>.</p><p>${site.name} · ${site.care.phone} · ${site.care.email}</p>`;
  return { to: o.address.email, subject: `Order ${o.number} confirmed – ${site.name}`, text, html };
}

function statusEmail(o: Order) {
  const label = STATUS_LABEL[o.status];
  const extra = o.status === "shipped" && o.trackingUrl ? `\nCourier tracking: ${o.trackingUrl}` : "";
  const text = `Hi ${o.address.name},\n\nYour order ${o.number} is now: ${label}.${extra}\n\nTrack: ${site.url}/track-order?order=${o.number}\n\n${site.name}`;
  const html = `<p>Hi ${esc(o.address.name)},</p><p>Your order <strong>${o.number}</strong> is now: <strong>${label}</strong>.</p>${
    extra ? `<p><a href="${esc(o.trackingUrl!)}">Track your parcel</a></p>` : ""
  }<p><a href="${site.url}/track-order?order=${o.number}">View order status</a></p>`;
  return { to: o.address.email, subject: `Order ${o.number}: ${label}`, text, html };
}

/** Called by the payment webhook (and mock payment). Idempotent: a paid order is returned unchanged. */
export async function markOrderPaid(orderId: string, payment: { razorpayPaymentId?: string; razorpayOrderId?: string }) {
  const order = await repo.getOrder(orderId);
  if (!order) return null;
  if (order.status !== "pending_payment") return order;
  const paid = await repo.updateOrderStatus(orderId, "paid", payment, "Payment captured");
  if (!paid) return null;
  const margin = paid.items.reduce((m, i) => m + (i.unitPrice - i.meeshoPrice) * i.quantity, 0);
  await Promise.allSettled([
    sendEmail(confirmationEmail(paid)),
    notifyAdmins(
      `🛒 New paid order ${paid.number}\n${formatINR(paid.total)} · est. margin ${formatINR(margin)}\n${itemsText(paid)}\n${paid.address.name}, ${paid.address.city} ${paid.address.pincode}`,
    ),
  ]);
  return paid;
}

/** Admin status change: validates the transition, logs the event, emails the customer. */
export async function changeOrderStatus(orderId: string, to: OrderStatus, patch: Partial<Order> = {}, note?: string) {
  const order = await repo.getOrder(orderId);
  if (!order) throw new Error("Order not found");
  if (!canTransition(order.status, to)) throw new Error(`Cannot move order from ${order.status} to ${to}`);
  const updated = await repo.updateOrderStatus(orderId, to, patch, note);
  if (updated && to !== "placed_on_meesho") await sendEmail(statusEmail(updated));
  return updated;
}
