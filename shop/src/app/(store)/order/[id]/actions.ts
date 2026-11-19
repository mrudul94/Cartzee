"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCustomer } from "@/lib/customer";
import { OrderError, repo } from "@/lib/data";
import { getSettings } from "@/lib/data/content-repo";
import { notifyAdmins } from "@/lib/notify";
import { changeOrderStatus, refundOrder } from "@/lib/orders/service";
import { CANCEL_REASONS, CANCEL_REQUEST_NOTE, customerOrderOptions, RETURN_REASONS } from "@/lib/orders/status";
import type { Order } from "@/lib/types";

export type SelfServiceState = { ok?: boolean; message?: string };

const input = (reasons: readonly string[]) =>
  z.object({
    orderId: z.string().min(1).max(64),
    reason: z.string().refine((r) => reasons.includes(r), "Choose a reason"),
    details: z.string().trim().max(500).default(""),
  });

/** Loads the order only if it belongs to the signed-in shopper. */
async function ownOrder(orderId: string): Promise<Order | null> {
  const customer = await getCustomer();
  if (!customer) return null;
  const order = await repo.getOrder(orderId);
  return order && order.customerUserId === customer.id ? order : null;
}

const describe = (reason: string, details: string) => [reason, details].filter(Boolean).join(": ");
const done = (orderId: string, message: string): SelfServiceState => {
  revalidatePath(`/order/${orderId}`);
  revalidatePath("/account");
  return { ok: true, message };
};
const alert = (text: string) => notifyAdmins(text).catch((e) => console.error("[orders] admin alert failed", e));

/** Not yet placed with the supplier: cancel now and refund in full. */
export async function cancelOrderAction(_prev: SelfServiceState, fd: FormData): Promise<SelfServiceState> {
  const parsed = input(CANCEL_REASONS).safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { message: "Choose a reason for cancelling." };
  const order = await ownOrder(parsed.data.orderId);
  if (!order) return { message: "Order not found." };
  const { delivery } = await getSettings();
  if (!customerOrderOptions(order, delivery.returnWindowDays).cancel) return { message: "This order can no longer be cancelled here. Please contact us." };

  const refund = await refundOrder(order);
  if (!refund.ok) {
    await alert(`⚠️ Order ${order.number}: customer tried to cancel but the automatic refund failed (${refund.message}). Please cancel and refund it manually.`);
    return { message: "We couldn't cancel this automatically. Our team has been told and will cancel and refund it for you shortly." };
  }
  await changeOrderStatus(order.id, "cancelled_refunded", {}, `Cancelled by customer (${describe(parsed.data.reason, parsed.data.details)}) · ${refund.note}`);
  await alert(`❌ Order ${order.number} cancelled by the customer before it was placed on Meesho. Refunded in full. Reason: ${describe(parsed.data.reason, parsed.data.details)}`);
  return done(order.id, "Your order is cancelled. The full amount is refunded to your original payment method within 5 to 7 working days.");
}

/** Already placed with the supplier: record the request and alert the team, who cancel it there first. */
export async function requestCancellationAction(_prev: SelfServiceState, fd: FormData): Promise<SelfServiceState> {
  const parsed = input(CANCEL_REASONS).safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { message: "Choose a reason for cancelling." };
  const order = await ownOrder(parsed.data.orderId);
  if (!order) return { message: "Order not found." };
  const { delivery } = await getSettings();
  if (!customerOrderOptions(order, delivery.returnWindowDays).requestCancel) return { message: "A cancellation can't be requested for this order now." };

  // Same status, new history entry: the admin sees the request on the order.
  await repo.updateOrderStatus(order.id, order.status, {}, `${CANCEL_REQUEST_NOTE}: ${describe(parsed.data.reason, parsed.data.details)}`);
  await alert(`🛑 Order ${order.number}: customer asked to CANCEL (already placed on Meesho). Reason: ${describe(parsed.data.reason, parsed.data.details)}. Cancel it on Meesho, then use Cancel & refund in the admin.`);
  return done(order.id, "Cancellation requested. If it hasn't shipped yet, we'll cancel it and refund you in full, and email you either way.");
}

/** Delivered and within the return window: open a return. */
export async function requestReturnAction(_prev: SelfServiceState, fd: FormData): Promise<SelfServiceState> {
  const parsed = input(RETURN_REASONS).safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { message: "Choose a reason for the return." };
  const order = await ownOrder(parsed.data.orderId);
  if (!order) return { message: "Order not found." };
  const { delivery } = await getSettings();
  if (!customerOrderOptions(order, delivery.returnWindowDays).requestReturn) return { message: "The return window for this order has closed. Please contact us if something is wrong." };

  await changeOrderStatus(order.id, "return_requested", {}, `Return requested by customer: ${describe(parsed.data.reason, parsed.data.details)}`);
  await alert(`↩️ Order ${order.number}: customer requested a RETURN. Reason: ${describe(parsed.data.reason, parsed.data.details)}`);
  return done(order.id, "Return requested. We'll contact you within 1 working day; keep the item and its packaging, and have photos ready.");
}

/* ------------------------------------------------------------------ reviews */

/** Orders that reached the shopper can be reviewed. */
const REVIEWABLE = new Set(["delivered", "return_requested", "returned_refunded"]);

const reviewInput = z.object({
  orderId: z.string().min(1).max(64),
  productId: z.string().min(1).max(64),
  rating: z.coerce.number().int().min(1, "Choose a star rating").max(5),
  title: z.string().trim().max(120).default(""),
  body: z.string().trim().min(10, "Tell other shoppers a little more (at least 10 characters)").max(2000),
});

export type ReviewState = { ok?: boolean; message?: string; errors?: Record<string, string> };

/** Verified-purchase review by the signed-in shopper who received this order. Held until an admin approves it. */
export async function submitReviewAction(_prev: ReviewState, fd: FormData): Promise<ReviewState> {
  const parsed = reviewInput.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { errors: Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])) };
  const customer = await getCustomer();
  const order = await ownOrder(parsed.data.orderId);
  if (!customer || !order) return { message: "Order not found." };
  if (!REVIEWABLE.has(order.status)) return { message: "You can review items once your order is delivered." };
  const item = order.items.find((i) => i.productId === parsed.data.productId);
  if (!item) return { message: "That item isn't in this order." };

  // Public name: first name + last initial (e.g. "Asha R."), and the delivery city.
  const parts = (customer.name || order.address.name).trim().split(/\s+/);
  const author = parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1]![0]!.toUpperCase()}.` : parts[0] || "Customer";
  try {
    await repo.submitReview({
      orderId: order.id,
      productId: item.productId,
      userId: customer.id,
      author: author.slice(0, 80),
      city: order.address.city.slice(0, 60),
      rating: parsed.data.rating,
      title: parsed.data.title,
      body: parsed.data.body,
    });
  } catch (e) {
    if (e instanceof OrderError) return { message: e.message };
    console.error("[review] submit failed", e);
    return { message: "Could not save your review. Please try again." };
  }
  await alert(`⭐ New ${parsed.data.rating}-star review for "${item.title}" (order ${order.number}). Approve it in Admin → Reviews.`);
  revalidatePath(`/order/${order.id}`);
  return { ok: true, message: "Thank you! Your review will appear on the product page after a quick check." };
}
