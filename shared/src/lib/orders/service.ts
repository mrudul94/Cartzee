import "server-only";
import { repo, type PaymentConfirmation } from "@/lib/data";
import { notifyAdmins, sendEmail } from "@/lib/notify";
import type { Settings } from "@/lib/content/schema";
import { getSettings } from "@/lib/data/content-repo";
import { site } from "@/lib/site";
import type { Order, OrderStatus } from "@/lib/types";

type Care = Settings["care"];
import { formatINR } from "@/lib/utils/format";
import { canTransition, STATUS_LABEL } from "./status";

/** Escapes text for safe interpolation into email HTML. */
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function itemsText(o: Order) {
  return o.items.map((i) => `${i.quantity} x ${i.title} @ ${formatINR(i.unitPrice)}`).join("\n");
}

const layout = (inner: string, care: Care) =>
  `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#2B2A28;line-height:1.5">${inner}<hr style="border:none;border-top:1px solid #DDD3C5;margin:24px 0"/><p style="font-size:13px;color:#6B6660">${site.name} · ${esc(care.phone)} · ${esc(care.email)} · ${esc(care.hours)}</p></div>`;

/** Contact details in emails come from Admin → Settings. */
export function confirmationEmail(o: Order, care: Care) {
  const trackUrl = `${site.url}/track-order?order=${o.number}`;
  const rows = o.items
    .map((i) => `<tr><td style="padding:6px 0">${i.quantity} × ${esc(i.title)}</td><td style="padding:6px 0;text-align:right">${formatINR(i.unitPrice * i.quantity)}</td></tr>`)
    .join("");
  const html = layout(
    `<h1 style="font-size:22px">Thank you, ${esc(o.address.name)}!</h1><p>Your order <strong>${o.number}</strong> is confirmed and payment of <strong>${formatINR(o.total)}</strong> was received.</p><table style="width:100%;border-collapse:collapse">${rows}<tr><td style="padding:6px 0">Delivery</td><td style="padding:6px 0;text-align:right">${o.shipping ? formatINR(o.shipping) : "Free"}</td></tr><tr><td style="padding:6px 0"><strong>Total</strong></td><td style="padding:6px 0;text-align:right"><strong>${formatINR(o.total)}</strong></td></tr></table><p>Delivering to: ${esc(o.address.line1)}, ${esc(o.address.city)} ${esc(o.address.pincode)}</p><p>We will email you when it ships. <a href="${trackUrl}">Track your order</a>.</p>`,
    care,
  );
  const text = `Hi ${o.address.name},\n\nThank you for your order ${o.number}. Payment of ${formatINR(o.total)} is confirmed.\n\n${itemsText(o)}\n\nWe will email you when it ships. Track anytime: ${trackUrl}\n\n${site.name} · ${care.phone} · ${care.email}`;
  return { to: o.address.email, subject: `Order ${o.number} confirmed – ${site.name}`, text, html };
}

export function statusEmail(o: Order, care: Care) {
  const label = STATUS_LABEL[o.status];
  const trackUrl = `${site.url}/track-order?order=${o.number}`;
  const courier = o.status === "shipped" && o.trackingUrl ? o.trackingUrl : null;
  const text = `Hi ${o.address.name},\n\nYour order ${o.number} is now: ${label}.${courier ? `\nCourier tracking: ${courier}` : ""}\n\nTrack: ${trackUrl}\n\n${site.name}`;
  const html = layout(
    `<p>Hi ${esc(o.address.name)},</p><p>Your order <strong>${o.number}</strong> is now: <strong>${label}</strong>.</p>${
      courier ? `<p><a href="${esc(courier)}">Track your parcel with the courier</a></p>` : ""
    }<p><a href="${trackUrl}">View order status</a></p>`,
    care,
  );
  return { to: o.address.email, subject: `Order ${o.number}: ${label}`, text, html };
}

function adminAlert(o: Order) {
  const margin = o.items.reduce((m, i) => m + (i.unitPrice - i.meeshoPrice) * i.quantity, 0);
  return `🛒 New paid order ${o.number}\n${formatINR(o.total)} · est. margin ${formatINR(margin)}\n${itemsText(o)}\n${o.address.name}, ${o.address.city} ${o.address.pincode}`;
}

/**
 * Single entry point for "payment succeeded" (webhook, client verify, mock pay).
 * The repo transition is atomic + idempotent; notifications go out only once.
 */
export async function markOrderPaid(orderId: string, payment: PaymentConfirmation) {
  const { order, changed } = await repo.markOrderPaid(orderId, payment);
  if (changed) {
    const { care } = await getSettings();
    const results = await Promise.allSettled([sendEmail(confirmationEmail(order, care)), notifyAdmins(adminAlert(order))]);
    results.forEach((r) => r.status === "rejected" && console.error("[orders] notification failed", r.reason));
  }
  return { order, changed };
}

/** Admin status change: validates the transition, logs the event, emails the customer. */
export async function changeOrderStatus(orderId: string, to: OrderStatus, patch: Partial<Order> = {}, note?: string) {
  const order = await repo.getOrder(orderId);
  if (!order) throw new Error("Order not found");
  if (!canTransition(order.status, to)) throw new Error(`Cannot move order from ${order.status} to ${to}`);
  const updated = await repo.updateOrderStatus(orderId, to, patch, note);
  if (updated && to !== "placed_on_meesho") await sendEmail(statusEmail(updated, (await getSettings()).care));
  return updated;
}
