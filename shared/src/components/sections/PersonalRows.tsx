"use client";

import { useEffect, useState } from "react";
import { Section } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { topCategories, useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useHydrated } from "@/hooks/useHydrated";
import { slugify } from "@/lib/utils/format";
import type { CardProduct } from "@/lib/utils/product";
import { ProductList, type ProductGridProps } from "./ProductGrid";

type RowProps = { title: string; subtitle?: string; layout?: ProductGridProps["layout"]; panel?: boolean; exclude?: string };

async function fetchCards(query: string): Promise<CardProduct[]> {
  try {
    const res = await fetch(`/api/products?${query}`);
    if (!res.ok) return [];
    return ((await res.json()) as { products: CardProduct[] }).products;
  } catch {
    return [];
  }
}

function Row({ title, subtitle, layout = "row", panel = true, products }: RowProps & { products: CardProduct[] }) {
  if (products.length === 0) return null;
  const id = `${slugify(title)}-heading`;
  return (
    <Section panel={panel} aria-labelledby={id}>
      <SectionHeader id={id} title={title} subtitle={subtitle} className={panel ? "mb-2 md:mb-3" : undefined} />
      <ProductList title={title} products={products} layout={layout} />
    </Section>
  );
}

/**
 * "Recommended for you": products from the categories this shopper viewed on this device
 * (store-wide trending for first-time visitors). Loads after the page, so it never slows the page down.
 */
export function RecommendedRow(props: RowProps) {
  const hydrated = useHydrated();
  const items = useRecentlyViewed((s) => s.items);
  const [products, setProducts] = useState<CardProduct[]>([]);
  const cats = topCategories(items).join(",");
  const seen = [props.exclude, ...items.slice(0, 20).map((i) => i.slug)].filter(Boolean).join(",");
  useEffect(() => {
    if (!hydrated) return;
    let live = true;
    fetchCards(`recommend=${encodeURIComponent(cats)}&exclude=${encodeURIComponent(seen)}&limit=14`).then((p) => live && setProducts(p));
    return () => {
      live = false;
    };
  }, [hydrated, cats, seen]);
  return <Row {...props} products={products} />;
}

/** "Recently viewed" on this device (hidden until the shopper has viewed something). */
export function RecentlyViewedRow(props: RowProps) {
  const hydrated = useHydrated();
  const slugs = useRecentlyViewed((s) => s.items)
    .map((i) => i.slug)
    .filter((s) => s !== props.exclude)
    .slice(0, 14)
    .join(",");
  const [products, setProducts] = useState<CardProduct[]>([]);
  useEffect(() => {
    if (!hydrated || !slugs) return setProducts([]);
    let live = true;
    fetchCards(`slugs=${encodeURIComponent(slugs)}`).then((p) => live && setProducts(p));
    return () => {
      live = false;
    };
  }, [hydrated, slugs]);
  return <Row {...props} layout={props.layout ?? "carousel"} products={products} />;
}

/** Records a product view (for "Recently viewed" and recommendations). Renders nothing. */
export function RecordView({ slug, category }: { slug: string; category: string }) {
  const record = useRecentlyViewed((s) => s.record);
  useEffect(() => record({ slug, category }), [slug, category, record]);
  return null;
}
