import Link from "next/link";
import { CheckCircle2, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import type { Settings } from "@/lib/content/schema";
import { formatINR } from "@/lib/utils/format";
import { paths } from "@/lib/utils/paths";

type Delivery = Settings["delivery"];

/** "You save ₹757 on this order" under the price (hidden when there's no discount). */
export function YouSave({ price, mrp }: { price: number; mrp: number }) {
  const save = Math.round(mrp - price);
  if (save <= 0) return null;
  return <p className="self-start rounded-md bg-success-soft px-2 py-1 text-sm font-semibold text-success">You save {formatINR(save)} on this item</p>;
}

/** "Available offers" checklist from Settings: delivery, UPI discount, secure payment, returns. */
export function ProductOffers({ price, delivery, upiDiscountPercent }: { price: number; delivery: Delivery; upiDiscountPercent: number }) {
  const offers = [
    price >= delivery.freeAbove ? (
      <>
        <strong>Free delivery</strong> on this item
      </>
    ) : (
      <>
        <strong>Free delivery</strong> on orders above {formatINR(delivery.freeAbove)}
      </>
    ),
    upiDiscountPercent > 0 ? (
      <>
        <strong>Extra {upiDiscountPercent}% off</strong> when you pay by UPI
      </>
    ) : null,
    <>
      <strong>Secure payment</strong> by UPI, cards or netbanking
    </>,
    <>
      <strong>{delivery.returnWindowDays}-day returns</strong> if it arrives damaged or wrong
    </>,
  ].filter(Boolean);
  return (
    <section aria-labelledby="offers-heading" className="rounded-lg border border-border bg-surface p-4">
      <h2 id="offers-heading" className="mb-2 font-semibold">
        Available offers
      </h2>
      <ul className="flex flex-col gap-2 text-sm">
        {offers.map((o, i) => (
          <li key={i} className="flex items-start gap-2">
            <CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            <span>{o}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Delivery, returns and payment promises as three cards (all values from Settings). */
export function DeliveryReturns({ delivery }: { delivery: Delivery }) {
  const cards = [
    {
      icon: Truck,
      title: "Delivery in 4 to 10 days",
      text: delivery.fee > 0 ? `Free above ${formatINR(delivery.freeAbove)}, otherwise ${formatINR(delivery.fee)}. Tracking link by email once it ships.` : "Free delivery across India. Tracking link by email once it ships.",
      href: paths.policy("shipping"),
    },
    {
      icon: RotateCcw,
      title: `${delivery.returnWindowDays}-day returns on damage`,
      text: "Damaged or wrong item? Tell us within the return window with a photo and we'll replace or refund it.",
      href: paths.policy("returns"),
    },
    {
      icon: ShieldCheck,
      title: "Prepaid, secure checkout",
      text: "Pay by UPI, card or netbanking through Razorpay. No cash on delivery.",
      href: paths.faq(),
    },
  ];
  return (
    <section aria-labelledby="delivery-returns-heading">
      <h2 id="delivery-returns-heading" className="mb-3 text-xl font-semibold md:text-2xl">
        Delivery &amp; returns
      </h2>
      <ul className="grid gap-3 md:grid-cols-3">
        {cards.map(({ icon: Icon, title, text, href }) => (
          <li key={title} className="flex gap-3 rounded-lg border border-border bg-surface p-4">
            <Icon aria-hidden className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
            <div className="text-sm">
              <p className="font-semibold">{title}</p>
              <p className="mt-1 text-text-muted">{text}</p>
              <Link href={href} className="mt-1 inline-block font-medium text-primary underline-offset-4 hover:underline">
                Read more
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
