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
