import type { Metadata } from "next";
import { ListingTemplate } from "@/components/sections/ListingTemplate";
import { repo } from "@/lib/data";
import { buildMetadata } from "@/lib/seo/metadata";
import { paths } from "@/lib/utils/paths";
import { toCardProduct } from "@/lib/utils/product";
import ProductPage, { generateMetadata as productMetadata } from "./[product]/page";

export const revalidate = 3600;
// New catalogue rows render on first request (ISR); unknown slugs 404 via notFound().

type Props = { params: Promise<{ category: string; sub: string }> };

export async function generateStaticParams() {
  const [cats, products] = await Promise.all([repo.listCategories(), repo.listProducts()]);
  return [
    ...cats.filter((c) => c.parentSlug).map((c) => ({ category: c.parentSlug!, sub: c.slug })),
    // Products without a subcategory live at /<category>/<product>.
    ...products.filter((p) => !p.subcategorySlug).map((p) => ({ category: p.categorySlug, sub: p.slug })),
  ];
}

/** /<category>/<slug> is a product (without a subcategory) when <slug> isn't a subcategory. */
const asProduct = (category: string, slug: string) => ({ params: Promise.resolve({ category, sub: "", product: slug }) });

async function load(categorySlug: string, subSlug: string) {
  const [parent, sub] = await Promise.all([repo.getCategory(categorySlug), repo.getCategory(subSlug)]);
  if (!parent || !sub || sub.parentSlug !== parent.slug) return null;
  return { parent, sub };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, sub } = await params;
  const data = await load(category, sub);
  if (!data) return productMetadata(asProduct(category, sub));
  return buildMetadata({
    title: `${data.sub.name}: ${data.parent.name} Online`,
    description: `${data.sub.intro} Shop ${data.sub.name.toLowerCase()} at Cartzee with prepaid checkout and delivery across India.`,
    path: paths.category(data.sub),
    image: data.parent.image || undefined, // subcategories have no image; share the main category's
    seoTitle: data.sub.seoTitle,
    seoDescription: data.sub.seoDescription,
  });
}

export default async function SubcategoryPage({ params }: Props) {
  const { category, sub } = await params;
  const data = await load(category, sub);
  if (!data) return <ProductPage {...asProduct(category, sub)} />;
  const { parent, sub: subcategory } = data;
  const [all, products] = await Promise.all([repo.listCategories(), repo.listProducts({ category: parent.slug, subcategory: subcategory.slug })]);
  const siblings = all.filter((c) => c.parentSlug === parent.slug);

  return (
    <ListingTemplate
      crumbs={[{ label: parent.name, href: paths.category(parent) }, { label: subcategory.name }]}
      title={subcategory.name}
      answer={`${subcategory.intro} Every product lists its material, size and care, and ships prepaid across India.`}
      products={products.map(toCardProduct)}
      chips={[
        { label: `All ${parent.name}`, href: paths.category(parent) },
        ...siblings.map((s) => ({ label: s.name, href: paths.category(s), active: s.slug === subcategory.slug })),
      ]}
      faqs={subcategory.faqs.length ? subcategory.faqs : parent.faqs}
    />
  );
}
