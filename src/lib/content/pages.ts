import { site } from "@/lib/site";
import { SHIPPING } from "@/lib/utils/delivery";
import type { Faq } from "@/lib/types";

/** Static page copy (policies, about). Kept as data so pages share one template and llms.txt can reuse it. */
export type ContentBlock = { type: "h2"; text: string } | { type: "p"; text: string } | { type: "ul"; items: string[] };
export type ContentPage = { slug: string; title: string; answer: string; description: string; updated: string; blocks: ContentBlock[]; faqs?: Faq[] };

export const policies: Record<"shipping" | "returns" | "privacy" | "terms", ContentPage> = {
  shipping: {
    slug: "shipping",
    title: "Shipping policy",
    answer: `${site.name} ships prepaid orders across India. Most orders arrive in 4 to 8 days, and delivery is free on orders above ₹${SHIPPING.freeAbove}.`,
    description: "Delivery times, charges and coverage for City Seller orders across India.",
    updated: "2026-11-01",
    blocks: [
      { type: "h2", text: "Delivery times" },
      { type: "ul", items: ["Metro and tier-1 cities: 4 to 7 days", "Other cities and towns: 5 to 8 days", "North-East, J&K, Andaman and Lakshadweep: 6 to 10 days"] },
      { type: "p", text: "We place your order with our fulfilment partner within 1 working day of payment. Estimates on product pages are calculated from your PIN code." },
      { type: "h2", text: "Delivery charges" },
      { type: "p", text: `Delivery is free on orders of ₹${SHIPPING.freeAbove} or more. Below that, a flat ₹${SHIPPING.fee} fee is shown in your cart before you pay.` },
      { type: "h2", text: "Tracking" },
      { type: "p", text: "You will receive an email with a courier tracking link when your order ships. You can also check status anytime on the Track Order page with your order number and phone." },
      { type: "h2", text: "Payment" },
      { type: "p", text: "All orders are prepaid via UPI, cards or netbanking through Razorpay. We do not offer Cash on Delivery." },
    ],
  },
  returns: {
    slug: "returns",
    title: "Returns and refunds",
    answer: `If your item arrives damaged, defective or different from what you ordered, tell us within ${site.returnWindowDays} days of delivery and we will replace it or refund you in full.`,
    description: "How to report a damaged or wrong item and get a replacement or refund from City Seller.",
    updated: "2026-11-01",
    blocks: [
      { type: "h2", text: "What can be returned" },
      { type: "ul", items: ["Items damaged in transit", "Defective items", "Wrong item, colour or size delivered", "Items missing from the package"] },
      { type: "p", text: "Change-of-mind returns are not accepted on hygiene products (bathroom accessories in contact with the body, cleaning cloths once used)." },
      { type: "h2", text: "How to request a return" },
      { type: "ul", items: [`Email ${site.care.email} or WhatsApp us within ${site.returnWindowDays} days of delivery.`, "Share your order number and a clear photo or unboxing video of the issue.", "We confirm within 2 working days and arrange a pickup or replacement."] },
      { type: "h2", text: "Refunds" },
      { type: "p", text: "Approved refunds go back to your original payment method (UPI, card or bank) within 5 to 7 working days of approval." },
    ],
  },
  privacy: {
    slug: "privacy",
    title: "Privacy policy",
    answer: `${site.name} collects only the details needed to deliver your order (name, phone, email and address) and never sells your data.`,
    description: "What personal data City Seller collects, why, and how it is protected.",
    updated: "2026-11-01",
    blocks: [
      { type: "h2", text: "What we collect" },
      { type: "ul", items: ["Contact details: name, mobile number and email", "Delivery address", "Order history", "Basic analytics about how pages are used (no card details)"] },
      { type: "h2", text: "How we use it" },
      { type: "p", text: "To process and deliver orders, send order updates, handle returns and improve the store. Your address and phone are shared with our fulfilment and courier partners only to deliver your order." },
      { type: "h2", text: "Payments" },
      { type: "p", text: "Payments are processed by Razorpay. We never see or store your card number, UPI PIN or banking passwords." },
      { type: "h2", text: "Your choices" },
      { type: "p", text: `To access, correct or delete your data, email ${site.care.email}.` },
    ],
  },
  terms: {
    slug: "terms",
    title: "Terms of service",
    answer: `These terms cover buying from ${site.name}: prepaid orders, pricing in rupees inclusive of taxes, delivery within India and our return policy.`,
    description: "Terms and conditions for shopping at City Seller.",
    updated: "2026-11-01",
    blocks: [
      { type: "h2", text: "Orders" },
      { type: "p", text: "An order is confirmed once payment succeeds. We may cancel and fully refund an order if an item becomes unavailable or a pricing error occurs." },
      { type: "h2", text: "Pricing" },
      { type: "p", text: "Prices are in Indian Rupees and include applicable taxes. MRP is shown for comparison." },
      { type: "h2", text: "Delivery" },
      { type: "p", text: "We deliver within India only. Delivery estimates are indicative and can be affected by courier delays, weather or holidays." },
      { type: "h2", text: "Contact" },
      { type: "p", text: `${site.legalName} · ${site.care.email} · ${site.care.phone}` },
    ],
  },
};

export const aboutPage: ContentPage = {
  slug: "about",
  title: `About ${site.name}`,
  answer: `${site.name} is an Indian online store for practical home needs: storage, kitchen, cleaning, bathroom and décor products at honest prices, with prepaid checkout and delivery across India.`,
  description: "Who we are and how City Seller picks, prices and delivers home essentials.",
  updated: "2026-11-01",
  blocks: [
    { type: "h2", text: "What we do" },
    { type: "p", text: "We choose useful, affordable products for everyday home problems, such as a messy pantry, a crowded almirah or a slippery bathroom floor, and describe them clearly with real dimensions, materials and care instructions." },
    { type: "h2", text: "How we work" },
    { type: "ul", items: ["A small team reviews every order before it is dispatched.", "Products ship from trusted supplier hubs through reliable courier partners.", "Prepaid-only checkout keeps prices low and avoids failed deliveries."] },
    { type: "h2", text: "Our promise" },
    { type: "p", text: `If something arrives damaged or wrong, we replace it or refund you. Reach us at ${site.care.email} or ${site.care.phone}.` },
  ],
};
