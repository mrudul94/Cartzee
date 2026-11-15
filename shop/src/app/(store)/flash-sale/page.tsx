import { ListingTemplate } from "@/components/sections/ListingTemplate";
import { repo } from "@/lib/data";
import { buildMetadata } from "@/lib/seo/metadata";
import { paths } from "@/lib/utils/paths";
import { toCardProduct } from "@/lib/utils/product";

export const revalidate = 3600;

export const metadata = buildMetadata({
  title: "Flash Sale: Limited-Stock Home Deals",
  description: "City Seller flash sale: our deepest discounts on a few home essentials while stock lasts. Prepaid checkout, delivery across India.",
  path: paths.flashSale(),
});

export default async function FlashSalePage() {
  const products = await repo.listProducts({ flashSale: true });
  return (
    <ListingTemplate
      crumbs={[{ label: "Flash sale" }]}
      title="Flash sale"
      answer="The flash sale lists City Seller's deepest discounts on a few home essentials, available only while current stock lasts. Prices shown are final and include taxes."
      products={products.map(toCardProduct)}
    />
  );
}
