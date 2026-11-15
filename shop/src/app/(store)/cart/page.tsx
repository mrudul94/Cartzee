import { CartView } from "@/components/commerce/CartView";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { buildMetadata } from "@/lib/seo/metadata";
import { paths } from "@/lib/utils/paths";

export const metadata = buildMetadata({ title: "Your cart", description: "Review the items in your cart.", path: paths.cart(), noindex: true });

export default function CartPage() {
  return (
    <Container className="pb-16">
      <Breadcrumbs items={[{ label: "Cart" }]} withJsonLd={false} />
      <h1 className="mb-6 font-heading text-3xl font-semibold">Your cart</h1>
      <CartView />
    </Container>
  );
}
