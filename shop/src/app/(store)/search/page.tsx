import type { Metadata } from "next";
import { ListingTemplate } from "@/components/sections/ListingTemplate";
import { repo } from "@/lib/data";
import { buildMetadata } from "@/lib/seo/metadata";
import { paths } from "@/lib/utils/paths";
import { toCardProduct } from "@/lib/utils/product";

type Props = { searchParams: Promise<{ q?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = (await searchParams).q?.trim();
  return buildMetadata({
    title: q ? `Search results for "${q}"` : "Search",
    description: "Search Cartzee for kitchen, storage, cleaning, bathroom and décor products.",
    path: paths.search(),
    noindex: true,
  });
}

export default async function SearchPage({ searchParams }: Props) {
  const q = (await searchParams).q?.trim().slice(0, 80) ?? "";
  const products = q ? await repo.listProducts({ q }) : await repo.listProducts({ bestseller: true });
  return (
    <ListingTemplate
      crumbs={[{ label: "Search" }]}
      title={q ? `Results for "${q}"` : "Search our store"}
      answer={
        q
          ? products.length > 0
            ? `We found ${products.length} ${products.length === 1 ? "product" : "products"} matching "${q}".`
            : `Nothing matched "${q}". Try a simpler word like "jar", "mop" or "shelf", or browse our bestsellers below.`
          : "Type what you need in the search box above, or start with our bestsellers."
      }
      products={products.map(toCardProduct)}
      emptyMessage="Try removing a filter or searching for a simpler term."
    />
  );
}
