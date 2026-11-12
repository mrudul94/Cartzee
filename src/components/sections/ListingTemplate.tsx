import Link from "next/link";
import { Suspense } from "react";
import { CategoryListing } from "@/components/commerce/CategoryListing";
import { ProductCard } from "@/components/commerce/ProductCard";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { buildItemListJsonLd, type Crumb } from "@/lib/seo/jsonld";
import { JsonLd } from "@/lib/seo/JsonLdScript";
import type { Faq } from "@/lib/types";
import type { CardProduct } from "@/lib/utils/product";
import { AnswerIntro, FAQSection } from "./InfoSections";

export type ListingTemplateProps = {
  crumbs: Crumb[];
  title: string;
  /** Direct 1–2 sentence answer shown under the H1 (AEO). */
  answer: string;
  products: CardProduct[];
  /** Sub-navigation chips (subcategories or sibling tiers). */
  chips?: { label: string; href: string; active?: boolean }[];
  faqs?: Faq[];
  hideBudget?: boolean;
  emptyMessage?: string;
};

/**
 * Shared listing page body for category, subcategory, budget, flash-sale, bestsellers and search.
 * The static HTML contains the first 12 products (crawlable); filters hydrate on the client.
 */
export function ListingTemplate({ crumbs, title, answer, products, chips, faqs = [], hideBudget, emptyMessage }: ListingTemplateProps) {
  return (
    <>
      <Container>
        <Breadcrumbs items={crumbs} />
        <AnswerIntro title={title} answer={answer} meta={`${products.length} products · Prices in ₹, inclusive of taxes`} />
        {chips && chips.length > 0 && (
          <nav aria-label="Refine" className="-mx-4 mb-6 overflow-x-auto px-4">
            <ul className="flex gap-2">
              {chips.map((c) => (
                <li key={c.href} className="shrink-0">
                  <Link
                    href={c.href}
                    aria-current={c.active ? "page" : undefined}
                    className={
                      c.active
                        ? "inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm font-medium text-text-inverse"
                        : "inline-flex min-h-11 items-center rounded-full border border-border-strong bg-surface px-4 text-sm font-medium text-text hover:bg-secondary/60"
                    }
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <Suspense
          fallback={
            <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 lg:ml-auto lg:w-3/4">
              {products.slice(0, 12).map((p, i) => (
                <li key={p.id}>
                  <ProductCard product={p} priority={i < 2} headingLevel="h2" />
                </li>
              ))}
            </ul>
          }
        >
          <CategoryListing products={products} hideBudget={hideBudget} emptyMessage={emptyMessage} />
        </Suspense>
      </Container>
      <FAQSection title={`${title}: FAQs`} faqs={faqs} />
      <JsonLd data={buildItemListJsonLd(title, products.slice(0, 20).map((p) => ({ name: p.title, url: p.path })))} />
    </>
  );
}
