import { CategoryBrowser, type BrowserCategory } from "@/components/commerce/CategoryBrowser";
import { buildCategoryTree } from "@/components/layout/MegaMenu";
import { repo } from "@/lib/data";
import { buildMetadata } from "@/lib/seo/metadata";
import { paths } from "@/lib/utils/paths";

export const revalidate = 3600;
export const metadata = buildMetadata({
  title: "All categories",
  description: "Browse every City Seller category: kitchen, cleaning, storage, bathroom, home décor and more.",
  path: "/categories",
});

/** Products shown per category on this page (the rest are on the category page). */
const PER_CATEGORY = 60;

/** All categories (the phone bottom bar's "Categories"): category list + compact tiles of subcategories and products. */
export default async function CategoriesPage() {
  const [categories, products] = await Promise.all([repo.listCategories(), repo.listProducts()]);
  const tree = buildCategoryTree(categories);
  const data: BrowserCategory[] = tree.map((c) => ({
    slug: c.slug,
    name: c.name,
    href: paths.category(c),
    image: c.image || undefined,
    subcategories: c.children.map((s) => ({ href: paths.category(s), label: s.name, image: s.image || undefined })),
    products: products
      .filter((p) => p.categorySlug === c.slug)
      .slice(0, PER_CATEGORY)
      .map((p) => ({ href: paths.product(p), label: p.title, image: p.images[0]?.src, price: p.price })),
  }));
  return (
    <>
      <h1 className="sr-only">All categories</h1>
      <CategoryBrowser categories={data} />
    </>
  );
}
