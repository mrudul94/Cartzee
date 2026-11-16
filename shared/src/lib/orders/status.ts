import type { OrderStatus } from "@/lib/types";

/**
 * Order state machine. Admin buttons only offer transitions listed here,
 * and every transition is logged as an order_event (see lib/orders/service.ts).
 */
export const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ["paid", "cancelled_refunded"],
  paid: ["placed_on_meesho", "cancelled_refunded"],
  placed_on_meesho: ["shipped", "cancelled_refunded"],
  shipped: ["delivered", "return_requested"],
  delivered: ["return_requested"],
  return_requested: ["returned_refunded", "delivered"],
  cancelled_refunded: [],
  returned_refunded: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

/** Customer-facing labels (tracking page, emails). */
export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: "Awaiting payment",
  paid: "Order confirmed",
  placed_on_meesho: "Being packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled_refunded: "Cancelled and refunded",
  return_requested: "Return requested",
  returned_refunded: "Returned and refunded",
};

/** Internal labels for the admin queue (what the team needs to do next). */
export const ADMIN_STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: "Awaiting payment",
  paid: "Paid: place on Meesho",
  placed_on_meesho: "Placed on Meesho",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled_refunded: "Cancelled & refunded",
  return_requested: "Return requested",
  returned_refunded: "Returned & refunded",
};

/** Admin button text for moving an order INTO each status. `paid` is only set by payment confirmation. */
export const ACTION_LABEL: Partial<Record<OrderStatus, string>> = {
  placed_on_meesho: "Mark placed on Meesho",
  shipped: "Mark shipped",
  delivered: "Mark delivered",
  cancelled_refunded: "Cancel order",
  return_requested: "Log return request",
  returned_refunded: "Return received: refund",
};

/** Transitions an admin may trigger from the panel (everything except payment confirmation). */
export const adminTransitions = (from: OrderStatus): OrderStatus[] => TRANSITIONS[from].filter((s) => s !== "paid");

/** Happy-path steps shown as a progress timeline on the tracking page. */
export const TRACKING_STEPS: OrderStatus[] = ["paid", "placed_on_meesho", "shipped", "delivered"];

/* ------------------------------------------------------------------ shopper self-service */

/** Order-event note prefix used when a shopper asks to cancel an order already placed with the supplier. */
export const CANCEL_REQUEST_NOTE = "Customer requested cancellation";

export const CANCEL_REASONS = ["Ordered by mistake", "Found a better price elsewhere", "Delivery is taking too long", "Changed my mind", "Other"] as const;
/** Returns are accepted for damaged, wrong or defective items (see the returns policy). */
export const RETURN_REASONS = ["Item arrived damaged", "Received the wrong item", "Item is defective or not working", "Parts missing from the package", "Other"] as const;

type SelfServiceOrder = { status: OrderStatus; events: { status: OrderStatus; note?: string | null; at: string }[] };

/** What a shopper may do with their own order right now. */
export function customerOrderOptions(order: SelfServiceOrder, returnWindowDays: number, now = Date.now()) {
  const cancelRequested = order.status === "placed_on_meesho" && order.events.some((e) => e.note?.startsWith(CANCEL_REQUEST_NOTE));
  const deliveredAt = [...order.events].reverse().find((e) => e.status === "delivered")?.at;
  const returnUntil = deliveredAt ? Date.parse(deliveredAt) + returnWindowDays * 86_400_000 : 0;
  return {
    /** Not yet placed with the supplier: cancels at once with a full refund. */
    cancel: order.status === "paid",
    /** Already placed with the supplier: the team has to cancel it there first. */
    requestCancel: order.status === "placed_on_meesho" && !cancelRequested,
    cancelRequested,
    requestReturn: order.status === "delivered" && now <= returnUntil,
    returnUntil: returnUntil ? new Date(returnUntil).toISOString() : null,
  };
}
