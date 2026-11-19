import { ListingTemplate } from "@/components/sections/ListingTemplate";
import { repo } from "@/lib/data";
import { buildMetadata } from "@/lib/seo/metadata";
import { paths } from "@/lib/utils/paths";
import { NEW_BADGE_DAYS, toCardProduct } from "@/lib/utils/product";

export const revalidate = 3600;

export const metadata = buildMetadata({
  title: "New Arrivals: Latest Home Essentials",
  description: "The newest kitchen, storage, cleaning, bathroom and décor products at Cartzee, with prepaid checkout and delivery across India.",
  path: paths.newArrivals(),
});

/** Products with the "New" badge: added in the last 30 days, or marked New in the admin. */
export default async function NewArrivalsPage() {
  const products = await repo.listProducts({ newArrivals: true });
  return (
    <ListingTemplate
      crumbs={[{ label: "New arrivals" }]}
      title="New arrivals"
      answer={`New arrivals are the latest products added to Cartzee in the last ${NEW_BADGE_DAYS} days, plus a few new picks our team wants you to see first.`}
      products={products.map(toCardProduct)}
      emptyMessage="No new arrivals right now. Check back soon, or browse our bestsellers."
    />
  );
}
