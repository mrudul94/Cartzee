import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Clock, Layers, Mail, MessageCircle, Phone, RotateCcw, ShieldCheck, Tag, Truck } from "lucide-react";
import { Section, type SectionProps } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Accordion } from "@/components/ui/Disclosure";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { buildFaqJsonLd } from "@/lib/seo/jsonld";
import { JsonLd } from "@/lib/seo/JsonLdScript";
import { site } from "@/lib/site";
import type { Faq } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { formatINR, slugify } from "@/lib/utils/format";
import { SHIPPING } from "@/lib/utils/delivery";
import { paths } from "@/lib/utils/paths";

/* ---------------------------------------------------------------- ValueProps */

export type ValueProp = { icon: LucideIcon; title: string; text: string };

export const DEFAULT_VALUE_PROPS: ValueProp[] = [
  { icon: Layers, title: "Wide range", text: "Kitchen, storage, cleaning, bath and décor in one place." },
  { icon: Tag, title: "Affordable pricing", text: "Honest prices with the MRP shown, no inflated discounts." },
  { icon: Truck, title: "Fast shipping", text: `Delivery across India. Free above ${formatINR(SHIPPING.freeAbove)}.` },
  { icon: RotateCcw, title: "Easy returns", text: `${site.returnWindowDays}-day returns on damaged or wrong items.` },
  { icon: ShieldCheck, title: "Secure prepaid payments", text: "UPI, cards and netbanking via Razorpay." },
];

export function ValueProps({
  title = "Why shop with us",
  items = DEFAULT_VALUE_PROPS,
  background = "surface",
  hideTitle = true,
}: { title?: string; items?: ValueProp[]; background?: SectionProps["background"]; hideTitle?: boolean }) {
  return (
    <Section background={background} spacing="sm" aria-label={title}>
      {!hideTitle && <SectionHeader title={title} />}
      <ul className="grid grid-cols-2 gap-6 md:grid-cols-5">
        {items.map(({ icon: Glyph, title: t, text }) => (
          <li key={t} className="flex flex-col items-center gap-2 text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-text">
              <Glyph aria-hidden className="h-6 w-6" />
            </span>
            <h3 className="text-base font-semibold">{t}</h3>
            <p className="text-sm text-text-muted">{text}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/* ---------------------------------------------------------------- CustomerCare */

export function CustomerCare({ background = "secondary" }: { background?: SectionProps["background"] }) {
  const items = [
    { icon: Phone, label: "Call us", value: site.care.phone, href: site.care.phoneHref },
    { icon: MessageCircle, label: "WhatsApp", value: "Chat with us", href: site.care.whatsapp },
    { icon: Mail, label: "Email", value: site.care.email, href: `mailto:${site.care.email}` },
    { icon: Clock, label: "Hours", value: site.care.hours },
  ];
  return (
    <Section background={background} spacing="md" aria-labelledby="care-heading">
      <div className="grid items-center gap-8 md:grid-cols-2">
        <div>
          <SectionHeader id="care-heading" title="We're here to help" subtitle="Questions about a product, delivery or return? Real people answer, usually within a few hours." className="mb-4" />
          <Button href={paths.track()} variant="secondary">
            Track your order
          </Button>
        </div>
        <ul className="grid grid-cols-2 gap-4">
          {items.map(({ icon: Glyph, label, value, href }) => (
            <li key={label} className="rounded-lg bg-surface p-4">
              <Glyph aria-hidden className="mb-2 h-5 w-5 text-text" />
              <p className="text-sm text-text-muted">{label}</p>
              {href ? (
                <a href={href} className="break-words font-semibold text-text hover:underline">
                  {value}
                </a>
              ) : (
                <p className="font-semibold text-text">{value}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

/* ---------------------------------------------------------------- BrandStory */

export type BrandBlurb = { title: string; text: string; href: string };

export function BrandStory({ title, paragraphs, blurbs, background = "background" }: { title: string; paragraphs: string[]; blurbs: BrandBlurb[]; background?: SectionProps["background"] }) {
  return (
    <Section background={background} spacing="md" aria-labelledby="story-heading">
      <div className="grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <SectionHeader id="story-heading" title={title} className="mb-4" />
          {paragraphs.map((p) => (
            <p key={p.slice(0, 24)} className="mb-4 text-base leading-relaxed text-text">
              {p}
            </p>
          ))}
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:col-span-3">
          {blurbs.map((b) => (
            <li key={b.href} className="rounded-lg border border-border bg-surface p-4">
              <h3 className="font-heading text-lg font-semibold">
                <Link href={b.href} className="hover:underline">
                  {b.title}
                </Link>
              </h3>
              <p className="mt-1 text-base text-text-muted">{b.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

/* ---------------------------------------------------------------- FAQSection */

export function FAQSection({
  title = "Frequently asked questions",
  faqs,
  withJsonLd = true,
  background = "background",
  spacing = "md",
  bare = false,
}: {
  title?: string;
  faqs: Faq[];
  withJsonLd?: boolean;
  background?: SectionProps["background"];
  spacing?: SectionProps["spacing"];
  /** Render without the Section wrapper (inside an existing layout column). */
  bare?: boolean;
}) {
  if (faqs.length === 0) return null;
  const id = `${slugify(title)}-heading`;
  const body = (
    <>
      <SectionHeader id={id} title={title} />
      <Accordion items={faqs.map((f, i) => ({ id: `faq-${i}`, title: f.q, content: <p>{f.a}</p> }))} headingLevel="h3" />
      {withJsonLd && <JsonLd data={buildFaqJsonLd(faqs)} />}
    </>
  );
  if (bare) return <section aria-labelledby={id}>{body}</section>;
  return (
    <Section background={background} spacing={spacing} containerWidth="narrow" aria-labelledby={id}>
      {body}
    </Section>
  );
}

/* ---------------------------------------------------------------- AnswerIntro */

/** Page H1 + 1–2 sentence direct answer (AEO) at the top of category/listing pages. */
export function AnswerIntro({ title, answer, meta, className }: { title: string; answer: string; meta?: string; className?: string }) {
  return (
    <header className={cn("flex max-w-prose flex-col gap-2 pb-6", className)}>
      <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
      <p className="text-lg text-text">{answer}</p>
      {meta && <p className="text-sm text-text-muted">{meta}</p>}
    </header>
  );
}
