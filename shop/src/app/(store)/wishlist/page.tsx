import { WishlistView } from "@/components/commerce/WishlistView";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({ title: "Your wishlist", description: "Products you saved for later.", path: "/wishlist", noindex: true });

export default function WishlistPage() {
  return (
    <Container className="pb-16">
      <Breadcrumbs items={[{ label: "Wishlist" }]} withJsonLd={false} />
      <h1 className="mb-4 text-2xl font-semibold tracking-tight md:text-3xl">Your wishlist</h1>
      <WishlistView />
    </Container>
  );
}
