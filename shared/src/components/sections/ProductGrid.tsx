import type { ReactNode } from "react";
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
   * "row" is one full row: 4 across on tablets, 6 on laptops, 7 on wide screens, 8 on very wide, sideways-scrolling on phones.
   */
  layout?: "grid" | "carousel" | "row";
  columns?: 3 | 4;
  background?: SectionProps["background"];
  spacing?: SectionProps["spacing"];
  /** White panel on the page (marketplace style). */
  panel?: boolean;
  /** Shown next to the title, e.g. a deals countdown. */
  aside?: ReactNode;
  /** Eager-load the first N images (above the fold). */
  priorityCount?: number;
};

const cols = { 3: "md:grid-cols-3", 4: "md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6" };

/** Row layout: hide cards that don't fit so each screen size shows exactly one full row. */
const rowItem = (i: number) => cn("w-40 shrink-0 snap-start sm:w-48 md:w-auto", i >= 4 && "md:hidden lg:block", i >= 6 && "lg:hidden xl:block", i >= 7 && "xl:hidden 2xl:block");

/** Just the product list for a layout (used by ProductGrid and by client rows such as "Recommended for you"). */
export function ProductList({ title, products, layout = "grid", columns = 4, priorityCount = 0 }: Pick<ProductGridProps, "title" | "products" | "layout" | "columns" | "priorityCount">) {
  if (layout === "row") {
    return (
      <ul aria-label={title} className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 py-2 md:mx-0 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:px-0 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8">
        {products.slice(0, 8).map((p, i) => (
          <li key={p.id} className={rowItem(i)}>
            <ProductCard product={p} priority={i < priorityCount} />
          </li>
        ))}
      </ul>
    );
  }
  if (layout === "carousel") {
    return (
      <ScrollRail label={title}>
        {products.map((p, i) => (
          <li key={p.id} className="w-40 shrink-0 snap-start sm:w-48 lg:w-48">
            <ProductCard product={p} priority={i < priorityCount} />
          </li>
        ))}
      </ScrollRail>
    );
  }
  return (
    <ul className={cn("grid grid-cols-2 gap-3 md:gap-4", cols[columns])}>
      {products.map((p, i) => (
        <li key={p.id}>
          <ProductCard product={p} priority={i < priorityCount} />
        </li>
      ))}
    </ul>
  );
}

/** Titled product section (Bestsellers, deals, category rows, related products, guide picks). */
export function ProductGrid({ title, subtitle, eyebrow, products, viewAllHref, layout = "grid", columns = 4, background, spacing, panel, aside, priorityCount = 0 }: ProductGridProps) {
  if (products.length === 0) return null;
  const id = `${slugify(title)}-heading`;
  return (
    <Section background={background} spacing={spacing} panel={panel} aria-labelledby={id}>
      <SectionHeader id={id} title={title} subtitle={subtitle} eyebrow={eyebrow} viewAllHref={viewAllHref} aside={aside} className={panel ? "mb-2 md:mb-3" : undefined} />
      <ProductList title={title} products={products} layout={layout} columns={columns} priorityCount={priorityCount} />
    </Section>
  );
}
