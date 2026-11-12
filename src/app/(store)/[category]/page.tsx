import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingTemplate } from "@/components/sections/ListingTemplate";
import { repo } from "@/lib/data";
import { buildMetadata } from "@/lib/seo/metadata";
import { paths } from "@/lib/utils/paths";
import { toCardProduct } from "@/lib/utils/product";

export const revalidate = 3600;
// New catalogue rows render on first request (ISR); unknown slugs 404 via notFound().

type Props = { params: Promise<{ category: string }> };

export async function generateStaticParams() {
  return (await repo.listCategories()).filter((c) => !c.parentSlug).map((c) => ({ category: c.slug }));
}

async function load(slug: string) {
  const category = await repo.getCategory(slug);
  if (!category || category.parentSlug) return null;
  return category;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await load((await params).category);
  if (!category) return {};
  return buildMetadata({
    title: `${category.name}: Buy Online at Best Prices`,
    description: category.intro,
    path: paths.category(category),
    image: category.image,
    seoTitle: category.seoTitle,
    seoDescription: category.seoDescription,
  });
}

export default async function CategoryPage({ params }: Props) {
  const category = await load((await params).category);
  if (!category) notFound();
  const [all, products] = await Promise.all([repo.listCategories(), repo.listProducts({ category: category.slug })]);
  const subs = all.filter((c) => c.parentSlug === category.slug);

  return (
    <ListingTemplate
      crumbs={[{ label: category.name }]}
      title={category.name}
      answer={category.intro}
      products={products.map(toCardProduct)}
      chips={[{ label: "All", href: paths.category(category), active: true }, ...subs.map((s) => ({ label: s.name, href: paths.category(s) }))]}
      faqs={category.faqs}
    />
  );
}
