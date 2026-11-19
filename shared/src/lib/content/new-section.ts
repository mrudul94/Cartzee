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
      return { ...base, type, title: "New arrivals", subtitle: "", eyebrow: "", source: "newArrivals", categorySlug: "", productSlugs: [], limit: 8, layout: "grid", viewAllHref: "/new-arrivals", background: "background" };
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
  };
}

/** Inserts sections before the first trust/info section (or at the end). */
export function insertBeforeInfo(sections: HomeSection[], add: HomeSection[]): HomeSection[] {
  const at = sections.findIndex((s) => INFO_SECTION_TYPES.has(s.type));
  const i = at < 0 ? sections.length : at;
  return [...sections.slice(0, i), ...add, ...sections.slice(i)];
}
