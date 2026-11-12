import Image from "next/image";
import Link from "next/link";
import { Section, type SectionProps } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/utils/cn";
import { slugify } from "@/lib/utils/format";

export type Tile = { label: string; href: string; image?: string; caption?: string };

export type CategoryTilesProps = {
  title: string;
  subtitle?: string;
  items: Tile[];
  /** circle: round thumbs (categories) · card: image cards (collections) · price: text tiles (budget). */
  variant?: "circle" | "card" | "price";
  background?: SectionProps["background"];
  spacing?: SectionProps["spacing"];
};

/** Navigational tile grid reused for Shop by Category, Featured Collections and Shop by Budget. */
export function CategoryTiles({ title, subtitle, items, variant = "circle", background, spacing }: CategoryTilesProps) {
  const id = `${slugify(title)}-heading`;
  return (
    <Section background={background} spacing={spacing} aria-labelledby={id}>
      <SectionHeader id={id} title={title} subtitle={subtitle} />
      <ul
        className={cn(
          "grid gap-4",
          variant === "circle" && "grid-cols-3 md:grid-cols-6",
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
                <span className="font-heading text-2xl font-semibold text-text">{t.label}</span>
              </Link>
            ) : (
              <Link href={t.href} className="group flex flex-col items-center gap-2 text-center focus-visible:outline-none">
                <span
                  className={cn(
                    "relative block w-full overflow-hidden bg-surface ring-primary transition-shadow duration-base group-hover:shadow-md group-focus-visible:ring-2",
                    variant === "circle" ? "aspect-square rounded-full" : "aspect-tile rounded-lg",
                  )}
                >
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
