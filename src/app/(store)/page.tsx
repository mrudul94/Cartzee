import { Section } from "@/components/layout/Container";
import { buildCategoryTree } from "@/components/layout/MegaMenu";
import { CategoryTiles } from "@/components/sections/CategoryTiles";
import { GuideCards } from "@/components/sections/GuideCards";
import { HeroBanner } from "@/components/sections/HeroBanner";
import { BrandStory, CustomerCare, FAQSection, ValueProps } from "@/components/sections/InfoSections";
import { ProductGrid } from "@/components/sections/ProductGrid";
import { SaleBanner } from "@/components/sections/SaleBanner";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { repo } from "@/lib/data";
import { storeFaqs } from "@/lib/seed/faqs";
import { buildMetadata } from "@/lib/seo/metadata";
import { site } from "@/lib/site";
import { BUDGET_TIERS } from "@/lib/utils/budget";
import { paths } from "@/lib/utils/paths";
import { toCardProduct } from "@/lib/utils/product";

export const revalidate = 3600;

export const metadata = buildMetadata({
  title: "Kitchen, Storage & Cleaning Essentials Online",
  description: site.description,
  path: "/",
});

const FEATURED_COLLECTIONS = ["storage-containers", "wardrobe-organisers", "mops-brooms", "bath-storage"];
const SALE_BANNERS = [
  { slug: "kitchen", eyebrow: "Kitchen sale", title: "Up to 50% off pantry storage", text: "Airtight jars and spice racks for a tidy kitchen." },
  { slug: "cleaning", eyebrow: "Cleaning week", title: "Faster pocha, less effort", text: "Spin mops, brooms and microfibre from ₹199." },
  { slug: "bathroom", eyebrow: "Bath refresh", title: "No-drill bathroom upgrades", text: "Shelves, hooks and dispensers that install in minutes." },
  { slug: "home-decor", eyebrow: "Décor edit", title: "Warm up your walls", text: "Handmade macramé, vases and fairy lights." },
];

export default async function HomePage() {
  const [categories, bestsellers, flash, posts] = await Promise.all([
    repo.listCategories(),
    repo.listProducts({ bestseller: true, limit: 8 }),
    repo.listProducts({ flashSale: true, limit: 4 }),
    repo.listPosts(),
  ]);
  const tree = buildCategoryTree(categories);
  const bySlug = new Map(categories.map((c) => [c.slug, c]));

  return (
    <>
      <HeroBanner
        eyebrow="New season essentials"
        title="Everyday home needs, honestly priced"
        text="Storage, kitchen, cleaning and décor picks that make small homes work harder, delivered anywhere in India."
        image={{ src: "/placeholders/banners/hero.svg", alt: "Ceramic vases and airtight storage jars on a sand-coloured shelf" }}
        primaryCta={{ label: "Shop bestsellers", href: paths.bestsellers() }}
        secondaryCta={{ label: "Flash sale", href: paths.flashSale() }}
        highlights={[site.promo, site.promoSecondary, "Prepaid, secure checkout"]}
      />

      <ProductGrid title="Bestsellers" subtitle="What homes across India are buying this month." products={bestsellers.map(toCardProduct)} viewAllHref={paths.bestsellers()} />

      <CategoryTiles
        title="Featured collections"
        variant="card"
        background="surface"
        items={FEATURED_COLLECTIONS.flatMap((slug) => {
          const c = bySlug.get(slug);
          return c ? [{ label: c.name, href: paths.category(c), image: c.image, caption: c.intro.split(".")[0] }] : [];
        })}
      />

      <Section aria-labelledby="flash-heading">
        <SectionHeader id="flash-heading" eyebrow="Limited stock" title="Flash sale" subtitle="Deep discounts on a few favourites while stock lasts." viewAllHref={paths.flashSale()} />
        <SaleBanner
          tone="soft"
          eyebrow="This week only"
          title="Racks, mats and tawas at their lowest prices"
          cta={{ label: "Shop the flash sale", href: paths.flashSale() }}
          image="/placeholders/banners/flash-sale.svg"
          className="mb-6"
        />
      </Section>
      <ProductGrid title="Flash sale picks" products={flash.map(toCardProduct)} layout="carousel" spacing="sm" />

      <CategoryTiles
        title="Shop by category"
        items={tree.map((c) => ({ label: c.name, href: paths.category(c), image: c.image }))}
        background="surface"
      />

      <CategoryTiles
        title="Shop by budget"
        variant="price"
        spacing="sm"
        items={BUDGET_TIERS.map((t) => ({ label: t.short, caption: t.slug.startsWith("above") ? "Premium" : "Under", href: paths.budget(t.slug) }))}
      />

      <Section aria-label="Category offers" spacing="sm">
        <ul className="grid gap-4 md:grid-cols-2">
          {SALE_BANNERS.map((b) => (
            <li key={b.slug}>
              <SaleBanner
                eyebrow={b.eyebrow}
                title={b.title}
                text={b.text}
                image={`/placeholders/banners/${b.slug}.svg`}
                cta={{ label: `Shop ${bySlug.get(b.slug)?.name ?? "now"}`, href: `/${b.slug}` }}
              />
            </li>
          ))}
        </ul>
      </Section>

      <ValueProps />
      <CustomerCare />

      <BrandStory
        title={`Why choose ${site.name}?`}
        paragraphs={[
          `${site.name} is an online store for the small things that make a home run smoothly. We pick practical products for real Indian homes, from rented one-BHKs to joint-family kitchens, and list them with clear specs, real dimensions and the full MRP so you can compare honestly.`,
          "Every order is prepaid and handled by a small team that checks each one before it ships. If something arrives damaged or wrong, we make it right.",
        ]}
        blurbs={tree.map((c) => ({ title: c.name, text: c.blurb, href: paths.category(c) }))}
      />

      <GuideCards posts={posts.slice(0, 3)} viewAllHref={paths.guides()} background="surface" />
      <FAQSection faqs={storeFaqs} />
    </>
  );
}
