import { Suspense } from "react";
import { CategoryListing } from "@/components/commerce/CategoryListing";
import { ProductCard } from "@/components/commerce/ProductCard";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { ChipNav, type Chip } from "@/components/ui/ChipNav";
import { buildItemListJsonLd, type Crumb } from "@/lib/seo/jsonld";
import { JsonLd } from "@/lib/seo/JsonLdScript";
import type { Faq } from "@/lib/types";
import type { CardProduct } from "@/lib/utils/product";

export type ListingTemplateProps = {
  crumbs: Crumb[];
  title: string;
  /** Intro sentence. Not shown on the page (kept for the page's meta description, set by each page). */
  answer?: string;
  products: CardProduct[];
  /** Sub-navigation chips (subcategories or sibling tiers). */
  chips?: Chip[];
  /** Not shown on listing pages (kept so pages can pass category FAQs without changes). */
  faqs?: Faq[];
  hideBudget?: boolean;
  emptyMessage?: string;
};

/**
 * Shared listing page body for category, subcategory, budget, flash-sale, bestsellers and search:
 * breadcrumb, title, filters and products only (no intro text or FAQ block on the page).
 * The static HTML contains the first 12 products (crawlable); filters hydrate on the client.
 */
export function ListingTemplate({ crumbs, title, products, chips, hideBudget, emptyMessage }: ListingTemplateProps) {
  return (
    <>
      <Container>
        <Breadcrumbs items={crumbs} />
        <h1 className="mb-3 text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
        {/* A lone "All" chip adds nothing, so chips show only when there is something to choose. */}
        {chips && chips.length > 1 && <ChipNav chips={chips} label="Refine" className="mb-4" />}
        <Suspense
          fallback={
            <div className="flex gap-6">
              <div aria-hidden className="hidden w-48 shrink-0 lg:block" />
              <ul className="grid min-w-0 flex-1 grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-5 2xl:grid-cols-6">
                {products.slice(0, 12).map((p, i) => (
                  <li key={p.id}>
                    <ProductCard product={p} priority={i < 2} headingLevel="h2" />
                  </li>
                ))}
              </ul>
            </div>
          }
        >
          <CategoryListing products={products} hideBudget={hideBudget} emptyMessage={emptyMessage} />
        </Suspense>
      </Container>
      <JsonLd data={buildItemListJsonLd(title, products.slice(0, 20).map((p) => ({ name: p.title, url: p.path })))} />
    </>
  );
}
