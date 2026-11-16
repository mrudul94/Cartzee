"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCustomer } from "@/lib/customer";
import { repo } from "@/lib/data";
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
