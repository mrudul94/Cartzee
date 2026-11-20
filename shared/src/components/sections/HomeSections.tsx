import { Section } from "@/components/layout/Container";
import { buildCategoryTree } from "@/components/layout/MegaMenu";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { isScheduledLive, type HomeSection, type Settings, orderHeroSlides } from "@/lib/content/schema";
import { categoryRowSection, insertBeforeInfo } from "@/lib/content/new-section";
import { repo } from "@/lib/data";
import type { Category, Faq, Post } from "@/lib/types";
import { BUDGET_TIERS } from "@/lib/utils/budget";
import { paths } from "@/lib/utils/paths";
import { toCardProduct } from "@/lib/utils/product";
import { CategoryTiles } from "./CategoryTiles";
import { GuideCards } from "./GuideCards";
import { HeroCarousel } from "./HeroCarousel";
import { BrandStory, CustomerCare, FAQSection, ValueProps } from "./InfoSections";
import { ProductGrid } from "./ProductGrid";
import { RecentlyViewedRow, RecommendedRow } from "./PersonalRows";
import { DealCountdown } from "@/components/commerce/DealCountdown";
import { SaleBanner } from "./SaleBanner";

export type HomeContext = {
  categories: Category[];
  posts: Post[];
  faqs: Faq[];
  settings: Settings;
  now?: Date;
};

const firstSentence = (s: string) => s.split(".")[0] ?? s;

async function productsFor(row: Extract<HomeSection, { type: "productRow" }>, categories: Category[]) {
  // A full row shows up to 8 cards on very wide screens, so fetch at least 8 for that layout.
  const s = row.layout === "row" ? { ...row, limit: Math.max(row.limit, 8) } : row;
  switch (s.source) {
    case "bestsellers":
      return repo.listProducts({ bestseller: true, limit: s.limit });
    case "flashSale":
      return repo.listProducts({ flashSale: true, limit: s.limit });
    case "newArrivals":
      return repo.listProducts({ newArrivals: true, limit: s.limit });
    case "trending":
      return repo.listProducts({ sort: "trending", limit: s.limit });
    case "category": {
      const c = categories.find((x) => x.slug === s.categorySlug);
      if (!c) return [];
      return repo.listProducts(c.parentSlug ? { subcategory: c.slug, limit: s.limit } : { category: c.slug, limit: s.limit });
    }
    case "manual":
      return s.productSlugs.length ? repo.listProducts({ slugs: s.productSlugs }) : [];
  }
}

/**
 * Renders the homepage from Admin → Homepage: sections in their saved order, skipping hidden
 * or out-of-schedule sections, slides and banners. Every section maps to an existing component.
 */
/**
 * `autoCategoryRows`: older saved homepages (before category rows were editable) get one row per main
 * category added automatically, before the trust/info sections. Newer ones list those rows as sections.
 */
export async function HomeSections({ sections: saved, ctx, autoCategoryRows = false }: { sections: HomeSection[]; ctx: HomeContext; autoCategoryRows?: boolean }) {
  const now = ctx.now ?? new Date();
  const tops = ctx.categories.filter((c) => !c.parentSlug);
  const sections = autoCategoryRows ? insertBeforeInfo(saved, tops.map(categoryRowSection)) : saved;
  const live = sections.filter((s) => s.enabled && isScheduledLive(s, now));
  const tree = buildCategoryTree(ctx.categories);
  const bySlug = new Map(ctx.categories.map((c) => [c.slug, c]));
  let h1Used = false;

  const rendered = await Promise.all(
    live.map(async (s, i) => {
      switch (s.type) {
        case "hero": {
          const live = s.slides.filter((sl) => sl.enabled && isScheduledLive(sl, now));
          const slides = orderHeroSlides(live);
          if (slides.length === 0) return null;
          const props = slides.map((sl) => ({
            id: sl.id,
            image: sl.image,
            href: sl.clickable && sl.link ? sl.link : undefined,
            overlay:
              sl.style === "text"
                ? { eyebrow: sl.eyebrow || undefined, title: sl.title, text: sl.text || undefined, cta: sl.primaryCta.label && sl.primaryCta.href ? sl.primaryCta : undefined }
                : undefined,
          }));
          h1Used = true;
          return <HeroCarousel key={s.id} slides={props} />;
        }
        case "productRow": {
          const products = await productsFor(s, ctx.categories);
          if (products.length === 0) return null; // e.g. a category with no products yet
          return (
            <ProductGrid
              key={s.id}
              title={s.title}
              subtitle={s.subtitle || undefined}
              eyebrow={s.eyebrow || undefined}
              // No hover photo on homepage rows: it doubles the images in an already long page (Worker CPU limit).
              products={products.map((p) => ({ ...toCardProduct(p), hoverImage: undefined }))}
              viewAllHref={s.viewAllHref || undefined}
              layout={s.layout}
              background={s.background}
              panel
              aside={s.countdown ? <DealCountdown /> : undefined}
              priorityCount={i <= 1 ? 2 : 0}
            />
          );
        }
        case "offerBanner": {
          if (!isScheduledLive(s.banner, now)) return null;
          const b = s.banner;
          const headingId = `${s.id}-heading`;
          return (
            <Section key={s.id} aria-labelledby={s.heading ? headingId : undefined} aria-label={s.heading ? undefined : b.title}>
              {s.heading && (
                <SectionHeader
                  id={headingId}
                  eyebrow={s.headingEyebrow || undefined}
                  title={s.heading}
                  subtitle={s.headingSubtitle || undefined}
                  viewAllHref={s.viewAllHref || undefined}
                />
              )}
              <SaleBanner tone={b.tone} eyebrow={b.eyebrow || undefined} title={b.title} text={b.text || undefined} cta={b.cta} image={b.image || undefined} className="mb-6" headingLevel={s.heading ? "h3" : "h2"} />
            </Section>
          );
        }
        case "bannerGrid": {
          const banners = s.banners.filter((b) => isScheduledLive(b, now));
          if (banners.length === 0) return null;
          return (
            <Section key={s.id} aria-label={s.label || "Offers"} spacing="sm">
              <ul className="grid gap-4 md:grid-cols-2">
                {banners.map((b) => (
                  <li key={b.id} className="flex">
                    <SaleBanner tone={b.tone} eyebrow={b.eyebrow || undefined} title={b.title} text={b.text || undefined} image={b.image || undefined} cta={b.cta} className="w-full" />
                  </li>
                ))}
              </ul>
            </Section>
          );
        }
        case "categoryTiles": {
          const cats = s.source === "top" ? tree : s.categorySlugs.map((slug) => bySlug.get(slug)).filter((c) => c !== undefined);
          if (cats.length === 0) return null;
          return (
            <CategoryTiles
              key={s.id}
              title={s.title}
              subtitle={s.subtitle || undefined}
              variant={s.variant}
              background={s.background}
              panel
              viewAllHref={s.variant === "collection" || s.variant === "slider" ? "/categories" : undefined}
              viewAllLabel={s.variant === "collection" || s.variant === "slider" ? "All collections" : undefined}
              items={cats.map((c) => ({ label: c.name, href: paths.category(c), image: c.image, caption: s.variant === "card" ? firstSentence(c.intro) : undefined }))}
            />
          );
        }
        case "budgetTiles":
          return (
            <CategoryTiles
              key={s.id}
              title={s.title}
              subtitle={s.subtitle || undefined}
              variant="price"
              panel
              items={BUDGET_TIERS.map((t) => ({ label: t.short, caption: t.slug.startsWith("above") ? "Premium" : "Under", href: paths.budget(t.slug) }))}
            />
          );
        case "valueProps":
          return <ValueProps key={s.id} items={s.items} />;
        case "customerCare":
          return <CustomerCare key={s.id} care={ctx.settings.care} title={s.title} subtitle={s.subtitle} />;
        case "brandStory":
          return (
            <BrandStory
              key={s.id}
              title={s.title}
              paragraphs={s.paragraphs}
              blurbs={s.showCategoryBlurbs ? tree.map((c) => ({ title: c.name, text: c.blurb, href: paths.category(c) })) : []}
            />
          );
        case "guides":
          return <GuideCards key={s.id} title={s.title} posts={ctx.posts.slice(0, s.limit)} viewAllHref={paths.guides()} background={s.background} />;
        case "faq":
          return <FAQSection key={s.id} title={s.title} faqs={ctx.faqs} />;
        case "recommended":
          return <RecommendedRow key={s.id} title={s.title} subtitle={s.subtitle || undefined} />;
        case "recentlyViewed":
          return <RecentlyViewedRow key={s.id} title={s.title} />;
      }
    }),
  );

  return (
    <>
      {!h1Used && <h1 className="sr-only">Cartzee: everyday home needs, honestly priced</h1>}
      {rendered}
    </>
  );
}
