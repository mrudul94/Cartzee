import type { HomeSection, SectionType } from "./schema";

const uid = (p: string) => `${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
const sched = { startsAt: "", endsAt: "" };

export const newBanner = () => ({
  id: uid("banner"),
  eyebrow: "",
  title: "New offer",
  text: "",
  image: "",
  cta: { label: "Shop now", href: "/" },
  tone: "sand" as const,
  ...sched,
});

export const newHeroSlide = () => ({
  id: uid("slide"),
  eyebrow: "",
  title: "New slide title",
  text: "",
  image: { src: "", alt: "" },
  style: "text" as const,
  primaryCta: { label: "Shop now", href: "/bestsellers" },
  secondaryCta: null,
  highlights: [],
  enabled: true,
  slideType: "category" as const,
  clickable: false,
  link: "",
  ...sched,
});

/** A sensible starting point for each section type added from Admin → Homepage. */
export function newSection(type: SectionType): HomeSection {
  const base = { id: uid(type), enabled: true, ...sched };
  switch (type) {
    case "hero":
      return { ...base, type, slides: [newHeroSlide()] };
    case "productRow":
      return { ...base, type, title: "New arrivals", subtitle: "", eyebrow: "", source: "newArrivals", categorySlug: "", productSlugs: [], limit: 8, layout: "row", viewAllHref: "/new-arrivals", background: "background", countdown: false };
    case "offerBanner":
      return { ...base, type, heading: "", headingEyebrow: "", headingSubtitle: "", viewAllHref: "", banner: newBanner() };
    case "bannerGrid":
      return { ...base, type, label: "Offers", banners: [newBanner(), newBanner()] };
    case "categoryTiles":
      return { ...base, type, title: "Shop by category", subtitle: "", variant: "circle", source: "top", categorySlugs: [], background: "background" };
    case "budgetTiles":
      return { ...base, type, title: "Shop by budget", subtitle: "" };
    case "valueProps":
      return { ...base, type, items: [{ icon: "truck", title: "Fast shipping", text: "" }] };
    case "customerCare":
      return { ...base, type, title: "We're here to help", subtitle: "" };
    case "brandStory":
      return { ...base, type, title: "Our story", paragraphs: ["Write a few lines about your store."], showCategoryBlurbs: true };
    case "guides":
      return { ...base, type, title: "Buying guides", limit: 3, background: "background" };
    case "faq":
      return { ...base, type, title: "Frequently asked questions" };
    case "recommended":
      return { ...base, type, title: "Recommended for you", subtitle: "" };
    case "recentlyViewed":
      return { ...base, type, title: "Recently viewed" };
  }
}

/** Main-category types that come after the shop rows (trust/info). Category rows are placed before the first of these. */
export const INFO_SECTION_TYPES: ReadonlySet<SectionType> = new Set(["valueProps", "customerCare", "brandStory", "guides", "faq"]);

/** The homepage row for one category: its products, 7 across on wide screens, "View all" to the category. */
export function categoryRowSection(c: { slug: string; name: string; parentSlug: string | null }): HomeSection {
  return {
    id: `cat-${c.slug}`.slice(0, 40),
    type: "productRow",
    enabled: true,
    ...sched,
    title: c.name.slice(0, 60),
    subtitle: "",
    eyebrow: "",
    source: "category",
    categorySlug: c.slug,
    productSlugs: [],
    limit: 7,
    layout: "row",
    viewAllHref: c.parentSlug ? `/${c.parentSlug}/${c.slug}` : `/${c.slug}`,
    background: "background",
    countdown: false,
  };
}

/** Inserts sections before the first trust/info section (or at the end). */
export function insertBeforeInfo(sections: HomeSection[], add: HomeSection[]): HomeSection[] {
  const at = sections.findIndex((s) => INFO_SECTION_TYPES.has(s.type));
  const i = at < 0 ? sections.length : at;
  return [...sections.slice(0, i), ...add, ...sections.slice(i)];
}

const deals = (): HomeSection => ({
  id: "deals", type: "productRow", enabled: true, ...sched, title: "Deals of the day", subtitle: "", eyebrow: "", source: "flashSale",
  categorySlug: "", productSlugs: [], limit: 12, layout: "carousel", viewAllHref: "/flash-sale", background: "background", countdown: true,
});
const trending = (): HomeSection => ({
  id: "trending", type: "productRow", enabled: true, ...sched, title: "Trending now", subtitle: "Most ordered by shoppers right now", eyebrow: "",
  source: "trending", categorySlug: "", productSlugs: [], limit: 7, layout: "row", viewAllHref: "/bestsellers", background: "background", countdown: false,
});

const collections = (): HomeSection => ({
  id: "collections", type: "categoryTiles", enabled: true, ...sched, title: "Shop by collection", subtitle: "", variant: "collection", source: "top", categorySlugs: [], background: "background",
});

/** Marketplace sections a saved homepage doesn't have yet: deals with countdown, recommended, trending, collections, recently viewed. */
export function missingMarketplaceSections(sections: HomeSection[]): string[] {
  const has = (f: (s: HomeSection) => boolean) => sections.some(f);
  return [
    !has((s) => s.type === "productRow" && s.countdown) && "Deals of the day",
    !has((s) => s.type === "recommended") && "Recommended for you",
    !has((s) => s.type === "productRow" && s.source === "trending") && "Trending now",
    !has((s) => s.type === "categoryTiles" && s.variant === "collection") && "Shop by collection",
    !has((s) => s.type === "recentlyViewed") && "Recently viewed",
  ].filter((x): x is string => Boolean(x));
}

/**
 * Adds the missing marketplace sections in the standard places: deals, recommended and trending right after the
 * category circles (or the hero), recently viewed before the trust/info sections. Ids are made unique.
 */
export function addMarketplaceSections(sections: HomeSection[]): HomeSection[] {
  const missing = new Set(missingMarketplaceSections(sections));
  const ids = new Set(sections.map((s) => s.id));
  const unique = (s: HomeSection): HomeSection => (ids.has(s.id) ? { ...s, id: uid(s.type) } : s);
  const top = [
    missing.has("Deals of the day") && deals(),
    missing.has("Recommended for you") && newSection("recommended"),
    missing.has("Trending now") && trending(),
    missing.has("Shop by collection") && collections(),
  ].filter((s): s is HomeSection => Boolean(s)).map(unique);
  const anchor = Math.max(sections.findIndex((s) => s.type === "categoryTiles"), sections.findIndex((s) => s.type === "hero"));
  const at = anchor < 0 ? 0 : anchor + 1;
  let out = [...sections.slice(0, at), ...top, ...sections.slice(at)];
  if (missing.has("Recently viewed")) out = insertBeforeInfo(out, [unique(newSection("recentlyViewed"))]);
  return out;
}

/** A copy of a section with fresh ids (including its slides and banners), for "Copy" in Admin → Homepage. */
export function duplicateSection(s: HomeSection): HomeSection {
  const copy = structuredClone(s);
  copy.id = uid(s.type);
  if (copy.type === "hero") copy.slides = copy.slides.map((sl) => ({ ...sl, id: uid("slide") }));
  if (copy.type === "offerBanner") copy.banner = { ...copy.banner, id: uid("banner") };
  if (copy.type === "bannerGrid") copy.banners = copy.banners.map((b) => ({ ...b, id: uid("banner") }));
  return copy;
}
