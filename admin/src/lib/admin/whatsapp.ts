import { DEFAULT_SETTINGS } from "@/lib/content/defaults";
import { site } from "@/lib/site";
import type { Order } from "@/lib/types";
import { whatsappHref } from "@/lib/utils/contact";
import { formatINR } from "@/lib/utils/format";

/**
 * Prefilled WhatsApp click-to-chat message for the order's current status.
 * (No WhatsApp Business API yet: the admin taps the link and presses send.)
 * `returnWindowDays` comes from Admin → Settings.
 */
export function whatsappMessage(o: Order, returnWindowDays: number = DEFAULT_SETTINGS.delivery.returnWindowDays): string {
  const first = o.address.name.split(" ")[0] ?? o.address.name;
  const track = `${site.url}/track-order?order=${o.number}`;
  switch (o.status) {
    case "paid":
      return `Hi ${first}, thank you for shopping with ${site.name}! Your order ${o.number} (${formatINR(o.total)}) is confirmed and will be dispatched soon. Track: ${track}`;
    case "placed_on_meesho":
      return `Hi ${first}, your ${site.name} order ${o.number} is being packed and will ship shortly. Track: ${track}`;
    case "shipped":
      return `Hi ${first}, good news! Your ${site.name} order ${o.number} has shipped.${o.trackingUrl ? ` Courier tracking: ${o.trackingUrl}` : ""} Track: ${track}`;
    case "delivered":
      return `Hi ${first}, your ${site.name} order ${o.number} has been delivered. We hope you love it! If anything is wrong, just reply here within ${returnWindowDays} days.`;
    case "cancelled_refunded":
      return `Hi ${first}, your ${site.name} order ${o.number} has been cancelled and ${formatINR(o.total)} refunded to your original payment method (5 to 7 working days).`;
    case "return_requested":
      return `Hi ${first}, we've received your return request for order ${o.number}. Please share a photo or unboxing video of the issue so we can arrange the next step.`;
    case "returned_refunded":
      return `Hi ${first}, your return for order ${o.number} is complete and the refund has been issued to your original payment method (5 to 7 working days).`;
    default:
      return `Hi ${first}, this is ${site.name} about your order ${o.number}.`;
  }
}

export function whatsappLink(o: Order, returnWindowDays?: number): string {
  return whatsappHref(`91${o.address.phone}`, whatsappMessage(o, returnWindowDays));
}
