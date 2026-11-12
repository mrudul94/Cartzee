import { ListingTemplate } from "@/components/sections/ListingTemplate";
import { repo } from "@/lib/data";
import { buildMetadata } from "@/lib/seo/metadata";
import { paths } from "@/lib/utils/paths";
import { toCardProduct } from "@/lib/utils/product";

export const revalidate = 3600;

export const metadata = buildMetadata({
  title: "Bestsellers: Most Loved Home Essentials",
  description: "City Seller bestsellers: the storage, kitchen, cleaning and bathroom products customers across India buy most.",
  path: paths.bestsellers(),
});

export default async function BestsellersPage() {
  const products = await repo.listProducts({ bestseller: true });
  return (
    <ListingTemplate
      crumbs={[{ label: "Bestsellers" }]}
      title="Bestsellers"
      answer="City Seller's bestsellers are the home essentials customers order most, from airtight jars and choppers to spin mops and no-drill bathroom shelves."
      products={products.map(toCardProduct)}
    />
  );
}
