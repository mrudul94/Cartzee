import Image from "next/image";
import Link from "next/link";
import { Section, type SectionProps } from "@/components/layout/Container";
import { ScrollRail } from "@/components/ui/ScrollRail";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { HeroCarousel } from "./HeroCarousel";
import { cn } from "@/lib/utils/cn";
import { slugify } from "@/lib/utils/format";

export type Tile = { label: string; href: string; image?: string; caption?: string };

export type CategoryTilesProps = {
  title: string;
  subtitle?: string;
  items: Tile[];
  /**
   * circle: sideways row of round thumbs (categories) · collection: sideways row of wide photo cards with the name
   * over the image (Shop by collection) · slider: one big sliding card at a time, shown exactly like the homepage hero
   * (no panel or visible title) ·
   * card: image grid · price: text tiles (budget).
   */
  variant?: "circle" | "collection" | "slider" | "card" | "price";
  /** Optional link in the header, e.g. "All collections". */
  viewAllHref?: string;
  viewAllLabel?: string;
  background?: SectionProps["background"];
  spacing?: SectionProps["spacing"];
  /** White panel on the page (marketplace style). */
  panel?: boolean;
};

/** Navigational tiles reused for Shop by Category, Shop by collection and Shop by Budget. */
export function CategoryTiles({ title, subtitle, items, variant = "circle", background, spacing, panel, viewAllHref, viewAllLabel }: CategoryTilesProps) {
  const id = `${slugify(title)}-heading`;
  const header = <SectionHeader id={id} title={title} subtitle={subtitle} viewAllHref={viewAllHref} viewAllLabel={viewAllLabel} className={panel ? "mb-2 md:mb-3" : undefined} />;
  if (variant === "slider") {
    // Only categories with a picture make good slides.
    const slides = items
      .filter((t) => t.image)
      .map((t) => ({ id: t.href, image: { src: t.image!, alt: t.label }, href: t.href, caption: { title: t.label, subtitle: t.caption ?? "Browse" } }));
    if (slides.length === 0) return null;
    // Shown exactly like the homepage hero: full width, no panel or visible heading (the title names it for screen readers).
    return <HeroCarousel slides={slides} label={title} headingLevel="h2" priorityFirst={false} />;
  }
  if (variant === "collection") {
    return (
      <Section background={background} spacing={spacing} panel={panel} aria-labelledby={id}>
        {header}
        <ScrollRail label={title}>
          {items.map((t) => (
            <li key={t.href} className="w-64 shrink-0 snap-start sm:w-80 lg:w-96">
              <Link
                href={t.href}
                className="group relative block aspect-banner overflow-hidden rounded-xl bg-secondary ring-primary transition-shadow duration-base hover:shadow-md focus-visible:outline-none focus-visible:ring-2"
              >
                {t.image && (
                  <Image src={t.image} alt="" fill sizes="(min-width: 1024px) 384px, (min-width: 640px) 320px, 256px" className="object-cover transition-transform duration-slow group-hover:scale-105 motion-reduce:transition-none" />
                )}
                {/* Dark fade at the bottom keeps the white text readable on any photo. */}
                <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-overlay/80 via-overlay/20 to-overlay/0" />
                <span className="absolute inset-x-0 bottom-0 flex flex-col p-4 text-text-inverse">
                  <span className="text-lg font-semibold leading-tight md:text-xl">{t.label}</span>
                  <span className="text-sm text-text-inverse/80">{t.caption ?? "Browse"}</span>
                </span>
              </Link>
            </li>
          ))}
        </ScrollRail>
      </Section>
    );
  }
  if (variant === "circle") {
    return (
      <Section background={background} spacing={spacing} panel={panel} aria-labelledby={id}>
        {header}
        <ScrollRail label={title}>
          {items.map((t) => (
            <li key={t.href} className="w-20 shrink-0 snap-start md:w-28">
              <Link href={t.href} className="group flex flex-col items-center gap-2 text-center focus-visible:outline-none">
                <span className="relative block aspect-square w-full overflow-hidden rounded-full bg-secondary ring-primary transition-shadow duration-base group-hover:shadow-md group-focus-visible:ring-2">
                  {t.image && <Image src={t.image} alt="" fill sizes="(min-width: 768px) 112px, 80px" className="object-cover transition-transform duration-slow group-hover:scale-105" />}
                </span>
                <span className="line-clamp-2 text-sm font-medium leading-tight text-text group-hover:underline">{t.label}</span>
              </Link>
            </li>
          ))}
        </ScrollRail>
      </Section>
    );
  }
  return (
    <Section background={background} spacing={spacing} panel={panel} aria-labelledby={id}>
      {header}
      <ul
        className={cn(
          "grid gap-4",
          variant === "card" && "grid-cols-2 md:grid-cols-4",
          variant === "price" && "grid-cols-2 sm:grid-cols-3 md:grid-cols-5",
        )}
      >
        {items.map((t) => (
          <li key={t.href}>
            {variant === "price" ? (
              <Link
                href={t.href}
                className="flex h-full min-h-24 flex-col items-center justify-center rounded-lg border border-border bg-surface p-4 text-center transition-shadow duration-base hover:shadow-md focus-visible:outline-none focus-visible:shadow-focus"
              >
                <span className="text-sm text-text-muted">{t.caption ?? "Under"}</span>
                <span className="text-2xl font-semibold text-text">{t.label}</span>
              </Link>
            ) : (
              <Link href={t.href} className="group flex flex-col items-center gap-2 text-center focus-visible:outline-none">
                <span className="relative block aspect-tile w-full overflow-hidden rounded-lg bg-surface ring-primary transition-shadow duration-base group-hover:shadow-md group-focus-visible:ring-2">
                  {t.image && (
                    <Image src={t.image} alt="" fill sizes="(min-width: 768px) 16vw, 33vw" className="object-cover transition-transform duration-slow group-hover:scale-105" />
                  )}
                </span>
                <span className="text-base font-medium text-text group-hover:underline">{t.label}</span>
                {t.caption && variant === "card" && <span className="-mt-1 text-sm text-text-muted">{t.caption}</span>}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </Section>
  );
}
