import { CartDrawer } from "@/components/commerce/CartDrawer";
import { repo } from "@/lib/data";
import { getSettings } from "@/lib/data/content-repo";
import { buildOrganizationJsonLd, buildWebSiteJsonLd } from "@/lib/seo/jsonld";
import { JsonLd } from "@/lib/seo/JsonLdScript";
import { Analytics } from "./Analytics";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { MobileTabBar } from "./MobileTabBar";
import { buildCategoryTree } from "./MegaMenu";
import { SettingsProvider } from "./SettingsProvider";

/**
 * Storefront chrome: skip link, sticky header, footer, phone bottom bar, cart drawer and site-wide JSON-LD.
 * Loads the editable store settings once and shares them with client components.
 */
export async function StoreShell({ children }: { children: React.ReactNode }) {
  const [categories, settings] = await Promise.all([repo.listCategories(), getSettings()]);
  const tree = buildCategoryTree(categories);
  return (
    <SettingsProvider settings={settings}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-toast focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:shadow-lg"
      >
        Skip to content
      </a>
      <Header tree={tree} settings={settings} />
      <main id="main">{children}</main>
      <Footer tree={tree} settings={settings} />
      {/* Room for the phone bottom bar so the footer's last links aren't hidden behind it. */}
      <div aria-hidden className="h-20 md:hidden" />
      <MobileTabBar />
      <CartDrawer />
      <JsonLd data={[buildOrganizationJsonLd(settings), buildWebSiteJsonLd()]} />
      <Analytics />
    </SettingsProvider>
  );
}
