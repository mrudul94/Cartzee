import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container, sectionVariants } from "@/components/layout/Container";
import { cn } from "@/lib/utils/cn";
import type { VariantProps } from "class-variance-authority";

export type HeroBannerProps = {
  eyebrow?: string;
  title: string;
  text: string;
  image: { src: string; alt: string };
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  highlights?: string[];
  background?: VariantProps<typeof sectionVariants>["background"];
  /** Use h1 when the hero is the page's main heading (homepage). */
  as?: "h1" | "h2";
  /** Load the image eagerly (LCP). Only the first visible hero should be priority. */
  priority?: boolean;
  /** When set, the whole slide is a link (e.g. to the category with this offer); buttons still work. */
  href?: string;
};

/** Offer hero: copy + CTAs on the left, art on the right; image is the LCP element (priority). */
export function HeroBanner({ eyebrow, title, text, image, primaryCta, secondaryCta, highlights, background = "secondary", as: H = "h1", priority = true, href }: HeroBannerProps) {
  return (
    <section className={cn(sectionVariants({ background, spacing: "none" }), "relative overflow-hidden")}>
      {href && <Link href={href} aria-label={`${title}: view offer`} className="absolute inset-0 z-base focus-visible:outline-none focus-visible:shadow-focus" />}
      <Container className={cn("grid items-center gap-6 py-8 md:grid-cols-2 md:py-12", href && "pointer-events-none relative z-raised [&_a]:pointer-events-auto")}>
        <div className="flex flex-col gap-4">
          {eyebrow && <p className="text-sm font-semibold uppercase tracking-wider text-primary">{eyebrow}</p>}
          <H className="font-heading text-4xl font-semibold tracking-tight text-text md:text-5xl">{title}</H>
          {text && <p className="max-w-prose text-lg text-text">{text}</p>}
          {highlights && highlights.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {highlights.map((h) => (
                <li key={h} className="rounded-full bg-surface px-3 py-1 text-sm font-medium text-text">
                  {h}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-2 flex flex-wrap gap-3">
            <Button href={primaryCta.href} variant="secondary" size="lg">
              {primaryCta.label}
            </Button>
            {secondaryCta && (
              <Button href={secondaryCta.href} variant="outline" size="lg">
                {secondaryCta.label}
              </Button>
            )}
          </div>
        </div>
        <div className="relative aspect-banner w-full overflow-hidden rounded-xl">
          <Image src={image.src} alt={image.alt} fill priority={priority} sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        </div>
      </Container>
    </section>
  );
}
