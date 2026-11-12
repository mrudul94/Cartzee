import type { Faq } from "@/lib/types";
import { site } from "@/lib/site";

/** Store-wide FAQs (homepage + /faq). Answers mirror the policy pages. */
export const storeFaqs: Faq[] = [
  {
    q: "Do you offer Cash on Delivery?",
    a: "No. City Seller accepts prepaid orders only, through UPI, credit or debit cards and netbanking via Razorpay. Prepaid keeps prices low and lets us dispatch faster. UPI payments get an extra 5% off.",
  },
  {
    q: "How long does delivery take?",
    a: "Most orders arrive in 4 to 8 days across India, and remote or North-East PIN codes can take up to 10 days. Enter your PIN code on any product page for an estimate.",
  },
  {
    q: "Is delivery free?",
    a: "Delivery is free on orders above ₹499. Below that, a flat ₹49 delivery fee applies and is shown before you pay.",
  },
  {
    q: "What is your return policy?",
    a: `If an item arrives damaged, defective or different from what you ordered, report it within ${site.returnWindowDays} days of delivery with an unboxing photo or video and we will arrange a replacement or full refund.`,
  },
  {
    q: "How do I track my order?",
    a: "Use the Track Order page with your order number and the mobile number used at checkout. No login is needed. We also email you when your order ships.",
  },
];
