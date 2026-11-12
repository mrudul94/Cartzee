import { ProductCard } from "@/components/commerce/ProductCard";
import { Section, type SectionProps } from "@/components/layout/Container";
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
  /** "grid" wraps; "carousel" scrolls horizontally with snap on small screens. */
  layout?: "grid" | "carousel";
  columns?: 3 | 4;
  background?: SectionProps["background"];
  spacing?: SectionProps["spacing"];
  /** Eager-load the first N images (above the fold). */
  priorityCount?: number;
};

const cols = { 3: "md:grid-cols-3", 4: "md:grid-cols-3 lg:grid-cols-4" };

/** Titled product section (Bestsellers, Flash sale, Related products, guide picks). */
export function ProductGrid({ title, subtitle, eyebrow, products, viewAllHref, layout = "grid", columns = 4, background, spacing, priorityCount = 0 }: ProductGridProps) {
  if (products.length === 0) return null;
  const id = `${slugify(title)}-heading`;
  return (
    <Section background={background} spacing={spacing} aria-labelledby={id}>
      <SectionHeader id={id} title={title} subtitle={subtitle} eyebrow={eyebrow} viewAllHref={viewAllHref} />
      <ul
        className={cn(
          layout === "carousel"
            ? "-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:gap-6 md:overflow-visible md:px-0"
            : "grid grid-cols-2 gap-3 md:gap-6",
          cols[columns],
        )}
      >
        {products.map((p, i) => (
          <li key={p.id} className={cn(layout === "carousel" && "w-64 shrink-0 snap-start md:w-auto")}>
            <ProductCard product={p} priority={i < priorityCount} />
          </li>
        ))}
      </ul>
    </Section>
  );
}
