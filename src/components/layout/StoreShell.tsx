import { CartDrawer } from "@/components/commerce/CartDrawer";
import { repo } from "@/lib/data";
import { buildOrganizationJsonLd, buildWebSiteJsonLd } from "@/lib/seo/jsonld";
import { JsonLd } from "@/lib/seo/JsonLdScript";
import { Analytics } from "./Analytics";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { buildCategoryTree } from "./MegaMenu";
import { TopBar } from "./TopBar";

/** Storefront chrome: skip link, top bar, sticky header, footer, cart drawer and site-wide JSON-LD. */
export async function StoreShell({ children }: { children: React.ReactNode }) {
  const tree = buildCategoryTree(await repo.listCategories());
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-toast focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:shadow-lg"
      >
        Skip to content
      </a>
      <TopBar />
      <Header tree={tree} />
      <main id="main">{children}</main>
      <Footer tree={tree} />
      <CartDrawer />
      <JsonLd data={[buildOrganizationJsonLd(), buildWebSiteJsonLd()]} />
      <Analytics />
    </>
  );
}
