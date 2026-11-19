import { ProductCard } from "@/components/commerce/ProductCard";
import { Section, type SectionProps } from "@/components/layout/Container";
import { ScrollRail } from "@/components/ui/ScrollRail";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/utils/cn";
import type { CardProduct } from "@/lib/utils/product";
import { slugify } from "@/lib/utils/format";

export type ProductGridProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  products: CardProduct[];
  viewAllHref?: string;
  /**
   * "grid" wraps into a dense grid; "carousel" is a sideways-scrolling row (arrows on larger screens);
   * "row" is one row of up to 7: sideways-scrolling below 1280px, all 7 side by side on wide screens.
   */
  layout?: "grid" | "carousel" | "row";
  columns?: 3 | 4;
  background?: SectionProps["background"];
  spacing?: SectionProps["spacing"];
  /** Eager-load the first N images (above the fold). */
  priorityCount?: number;
};

const cols = { 3: "md:grid-cols-3", 4: "md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" };

/** Titled product section (Bestsellers, Flash sale, Related products, guide picks). */
export function ProductGrid({ title, subtitle, eyebrow, products, viewAllHref, layout = "grid", columns = 4, background, spacing, priorityCount = 0 }: ProductGridProps) {
  if (products.length === 0) return null;
  const id = `${slugify(title)}-heading`;
  return (
    <Section background={background} spacing={spacing} aria-labelledby={id}>
      <SectionHeader id={id} title={title} subtitle={subtitle} eyebrow={eyebrow} viewAllHref={viewAllHref} />
      {layout === "row" ? (
        <ul aria-label={title} className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 py-3 xl:mx-0 xl:grid xl:grid-cols-7 xl:overflow-visible xl:px-0">
          {products.slice(0, 7).map((p, i) => (
            <li key={p.id} className="w-40 shrink-0 snap-start sm:w-48 xl:w-auto">
              <ProductCard product={p} priority={i < priorityCount} />
            </li>
          ))}
        </ul>
      ) : layout === "carousel" ? (
        <ScrollRail label={title}>
          {products.map((p, i) => (
            <li key={p.id} className="w-40 shrink-0 snap-start sm:w-48 lg:w-52">
              <ProductCard product={p} priority={i < priorityCount} />
            </li>
          ))}
        </ScrollRail>
      ) : (
        <ul className={cn("grid grid-cols-2 gap-3 md:gap-4", cols[columns])}>
          {products.map((p, i) => (
            <li key={p.id}>
              <ProductCard product={p} priority={i < priorityCount} />
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
