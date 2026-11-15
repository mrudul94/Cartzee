import { z } from "zod";
import { DEFAULT_SETTINGS } from "./defaults";
import { aboutPage, policies } from "./pages";
import { defaultStoreFaqs } from "@/lib/seed/faqs";

/* ==================================================================== shared field rules */

/** Links: a site path ("/kitchen") or an https URL. Blocks javascript:, data:, protocol-relative etc. */
export const linkSchema = z
  .string()
  .trim()
  .max(300)
  .refine((v) => (v.startsWith("/") && !v.startsWith("//")) || /^https:\/\/[^\s]+$/i.test(v), "Use a site path like /kitchen or a full https:// link");
const optionalLink = z.union([z.literal(""), linkSchema]).default("");
/** Image sources: a site path (/placeholders/…) or an https URL (Supabase Storage). */
export const imageSrcSchema = linkSchema;
const text = (max: number) => z.string().trim().max(max).default("");
const reqText = (max: number, label: string) => z.string().trim().min(1, `${label} is required`).max(max);
/** ISO date-time or "" (no limit). */
const when = z.union([z.literal(""), z.string().datetime({ offset: true })]).default("");

export const imageSchema = z.object({ src: imageSrcSchema, alt: z.string().trim().min(3, "Describe the image (alt text)").max(160) });
export const ctaSchema = z.object({ label: reqText(40, "Button text"), href: linkSchema });
const scheduled = { startsAt: when, endsAt: when };
const backgroundSchema = z.enum(["background", "surface", "secondary", "soft"]).default("background");

/* ==================================================================== settings */

const socialUrl = z.union([z.literal(""), z.string().trim().url().refine((v) => v.startsWith("https://"), "Use an https:// link")]).default("");

export const settingsSchema = z.object({
  promo: z.object({ enabled: z.boolean().default(true), text: text(90), secondary: text(90) }),
  care: z.object({
    phone: reqText(30, "Phone"),
    whatsapp: z.string().trim().regex(/^\d{10,15}$/, "Digits only with country code, e.g. 919876543210"),
    email: z.string().trim().email("Enter a valid email"),
    hours: reqText(80, "Hours"),
  }),
  social: z.object({ instagram: socialUrl, facebook: socialUrl, youtube: socialUrl }),
  delivery: z.object({
    freeAbove: z.coerce.number().int().min(0).max(100_000),
    fee: z.coerce.number().int().min(0).max(1_000),
    returnWindowDays: z.coerce.number().int().min(0).max(60),
  }),
  upiDiscountPercent: z.coerce.number().min(0).max(50),
  whatsappButton: z.object({ enabled: z.boolean().default(true), message: text(200) }),
});
export type Settings = z.infer<typeof settingsSchema>;

/* ==================================================================== homepage sections */

const base = { id: z.string().min(1).max(40), enabled: z.boolean().default(true), ...scheduled };

export const heroSlideSchema = z.object({
  id: z.string().min(1).max(40),
  eyebrow: text(60),
  title: reqText(90, "Title"),
  text: text(240),
  image: imageSchema,
  primaryCta: ctaSchema,
  secondaryCta: ctaSchema.nullable().default(null),
  highlights: z.array(z.string().trim().min(1).max(50)).max(4).default([]),
  /** Slide on/off (independent of the schedule). */
  enabled: z.boolean().default(true),
  /** When on, the whole slide links to `link` (e.g. a category with this offer). */
  clickable: z.boolean().default(false),
  link: optionalLink,
  ...scheduled,
}).refine((sl) => !sl.clickable || sl.link, { message: "Choose where the slide opens", path: ["link"] });

export const bannerSchema = z.object({
  id: z.string().min(1).max(40),
  eyebrow: text(40),
  title: reqText(80, "Title"),
  text: text(160),
  image: z.union([z.literal(""), imageSrcSchema]).default(""),
  cta: ctaSchema,
  tone: z.enum(["sand", "soft", "ink"]).default("sand"),
  ...scheduled,
});

export const VALUE_PROP_ICONS = ["layers", "tag", "truck", "rotate", "shield", "clock", "phone", "heart", "star", "gift", "package", "sparkles"] as const;

export const sectionSchema = z.discriminatedUnion("type", [
  z.object({ ...base, type: z.literal("hero"), slides: z.array(heroSlideSchema).min(1, "Add at least one slide").max(5) }),
  z.object({
    ...base,
    type: z.literal("productRow"),
    title: reqText(60, "Title"),
    subtitle: text(160),
    eyebrow: text(40),
    source: z.enum(["bestsellers", "flashSale", "newArrivals", "category", "manual"]).default("bestsellers"),
    categorySlug: text(80),
    productSlugs: z.array(z.string().max(100)).max(24).default([]),
    limit: z.coerce.number().int().min(2).max(12).default(8),
    layout: z.enum(["grid", "carousel"]).default("grid"),
    viewAllHref: optionalLink,
    background: backgroundSchema,
  }),
  z.object({
    ...base,
    type: z.literal("offerBanner"),
    heading: text(60),
    headingEyebrow: text(40),
    headingSubtitle: text(160),
    viewAllHref: optionalLink,
    banner: bannerSchema,
  }),
  z.object({ ...base, type: z.literal("bannerGrid"), label: text(60), banners: z.array(bannerSchema).min(1).max(6) }),
  z.object({
    ...base,
    type: z.literal("categoryTiles"),
    title: reqText(60, "Title"),
    subtitle: text(160),
    variant: z.enum(["circle", "card"]).default("circle"),
    source: z.enum(["top", "manual"]).default("top"),
    categorySlugs: z.array(z.string().max(80)).max(12).default([]),
    background: backgroundSchema,
  }),
  z.object({ ...base, type: z.literal("budgetTiles"), title: reqText(60, "Title"), subtitle: text(160) }),
  z.object({
    ...base,
    type: z.literal("valueProps"),
    items: z.array(z.object({ icon: z.enum(VALUE_PROP_ICONS), title: reqText(40, "Title"), text: text(120) })).min(1).max(6),
  }),
  z.object({ ...base, type: z.literal("customerCare"), title: reqText(60, "Title"), subtitle: text(200) }),
  z.object({
    ...base,
    type: z.literal("brandStory"),
    title: reqText(80, "Title"),
    paragraphs: z.array(z.string().trim().min(1).max(800)).min(1).max(4),
    showCategoryBlurbs: z.boolean().default(true),
  }),
  z.object({ ...base, type: z.literal("guides"), title: reqText(60, "Title"), limit: z.coerce.number().int().min(1).max(6).default(3), background: backgroundSchema }),
  z.object({ ...base, type: z.literal("faq"), title: reqText(80, "Title") }),
]);
export type HomeSection = z.infer<typeof sectionSchema>;
export type SectionType = HomeSection["type"];

export const homeSchema = z.object({ sections: z.array(sectionSchema).max(30) }).superRefine((h, ctx) => {
  const ids = new Set<string>();
  h.sections.forEach((s, i) => {
    if (ids.has(s.id)) ctx.addIssue({ code: "custom", path: ["sections", i, "id"], message: "Duplicate section id" });
    ids.add(s.id);
  });
});
export type HomeContent = z.infer<typeof homeSchema>;

export const SECTION_LABELS: Record<SectionType, string> = {
  hero: "Hero (slides)",
  productRow: "Product row",
  offerBanner: "Offer banner",
  bannerGrid: "Banner grid",
  categoryTiles: "Category tiles",
  budgetTiles: "Shop by budget",
  valueProps: "Why shop with us",
  customerCare: "Customer care",
  brandStory: "Brand story",
  guides: "Buying guides",
  faq: "FAQ",
};

/* ==================================================================== pages & FAQs */

export const contentBlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("h2"), text: reqText(120, "Heading") }),
  z.object({ type: z.literal("p"), text: reqText(2000, "Paragraph") }),
  z.object({ type: z.literal("ul"), items: z.array(z.string().trim().min(1).max(300)).min(1).max(20) }),
]);
export const faqItemSchema = z.object({ q: reqText(200, "Question"), a: reqText(1000, "Answer") });

export const pageSchema = z.object({
  slug: z.string(),
  title: reqText(80, "Title"),
  answer: reqText(400, "Summary"),
  description: reqText(170, "Meta description"),
  updated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  blocks: z.array(contentBlockSchema).min(1).max(60),
});
export type PageContent = z.infer<typeof pageSchema>;

export const faqsSchema = z.object({ items: z.array(faqItemSchema).min(1).max(30) });

export const PAGE_SLUGS = ["about", "shipping", "returns", "privacy", "terms"] as const;
export type PageSlug = (typeof PAGE_SLUGS)[number];

/* ==================================================================== defaults (= the site before the CMS) */

export const DEFAULT_HOME: HomeContent = {
  sections: [
    {
      id: "hero",
      type: "hero",
      enabled: true,
      startsAt: "",
      endsAt: "",
      slides: [
        {
          id: "hero-1",
          eyebrow: "New season essentials",
          title: "Everyday home needs, honestly priced",
          text: "Storage, kitchen, cleaning and décor picks that make small homes work harder, delivered anywhere in India.",
          image: { src: "/placeholders/banners/hero.svg", alt: "Ceramic vases and airtight storage jars on a sand-coloured shelf" },
          primaryCta: { label: "Shop bestsellers", href: "/bestsellers" },
          secondaryCta: { label: "Flash sale", href: "/flash-sale" },
          highlights: [DEFAULT_SETTINGS.promo.text, DEFAULT_SETTINGS.promo.secondary, "Prepaid, secure checkout"],
          enabled: true,
          clickable: false,
          link: "",
          startsAt: "",
          endsAt: "",
        },
      ],
    },
    {
      id: "bestsellers", type: "productRow", enabled: true, startsAt: "", endsAt: "",
      title: "Bestsellers", subtitle: "What homes across India are buying this month.", eyebrow: "",
      source: "bestsellers", categorySlug: "", productSlugs: [], limit: 8, layout: "grid", viewAllHref: "/bestsellers", background: "background",
    },
    {
      id: "featured-collections", type: "categoryTiles", enabled: true, startsAt: "", endsAt: "",
      title: "Featured collections", subtitle: "", variant: "card", source: "manual",
      categorySlugs: ["storage-containers", "wardrobe-organisers", "mops-brooms", "bath-storage"], background: "surface",
    },
    {
      id: "flash-banner", type: "offerBanner", enabled: true, startsAt: "", endsAt: "",
      heading: "Flash sale", headingEyebrow: "Limited stock", headingSubtitle: "Deep discounts on a few favourites while stock lasts.", viewAllHref: "/flash-sale",
      banner: {
        id: "flash-banner-1", eyebrow: "This week only", title: "Racks, mats and tawas at their lowest prices", text: "",
        image: "/placeholders/banners/flash-sale.svg", cta: { label: "Shop the flash sale", href: "/flash-sale" }, tone: "soft", startsAt: "", endsAt: "",
      },
    },
    {
      id: "flash-picks", type: "productRow", enabled: true, startsAt: "", endsAt: "",
      title: "Flash sale picks", subtitle: "", eyebrow: "", source: "flashSale", categorySlug: "", productSlugs: [], limit: 4, layout: "carousel", viewAllHref: "", background: "background",
    },
    { id: "categories", type: "categoryTiles", enabled: true, startsAt: "", endsAt: "", title: "Shop by category", subtitle: "", variant: "circle", source: "top", categorySlugs: [], background: "surface" },
    { id: "budget", type: "budgetTiles", enabled: true, startsAt: "", endsAt: "", title: "Shop by budget", subtitle: "" },
    {
      id: "category-offers", type: "bannerGrid", enabled: true, startsAt: "", endsAt: "", label: "Category offers",
      banners: [
        { id: "b-kitchen", eyebrow: "Kitchen sale", title: "Up to 50% off pantry storage", text: "Airtight jars and spice racks for a tidy kitchen.", image: "/placeholders/banners/kitchen.svg", cta: { label: "Shop Kitchen & Dining", href: "/kitchen" }, tone: "sand", startsAt: "", endsAt: "" },
        { id: "b-cleaning", eyebrow: "Cleaning week", title: "Faster pocha, less effort", text: "Spin mops, brooms and microfibre from ₹199.", image: "/placeholders/banners/cleaning.svg", cta: { label: "Shop Cleaning", href: "/cleaning" }, tone: "sand", startsAt: "", endsAt: "" },
        { id: "b-bathroom", eyebrow: "Bath refresh", title: "No-drill bathroom upgrades", text: "Shelves, hooks and dispensers that install in minutes.", image: "/placeholders/banners/bathroom.svg", cta: { label: "Shop Bathroom", href: "/bathroom" }, tone: "sand", startsAt: "", endsAt: "" },
        { id: "b-decor", eyebrow: "Décor edit", title: "Warm up your walls", text: "Handmade macramé, vases and fairy lights.", image: "/placeholders/banners/home-decor.svg", cta: { label: "Shop Home Décor", href: "/home-decor" }, tone: "sand", startsAt: "", endsAt: "" },
      ],
    },
    {
      id: "value-props", type: "valueProps", enabled: true, startsAt: "", endsAt: "",
      items: [
        { icon: "layers", title: "Wide range", text: "Kitchen, storage, cleaning, bath and décor in one place." },
        { icon: "tag", title: "Affordable pricing", text: "Honest prices with the MRP shown, no inflated discounts." },
        { icon: "truck", title: "Fast shipping", text: `Delivery across India. Free above ₹${DEFAULT_SETTINGS.delivery.freeAbove}.` },
        { icon: "rotate", title: "Easy returns", text: `${DEFAULT_SETTINGS.delivery.returnWindowDays}-day returns on damaged or wrong items.` },
        { icon: "shield", title: "Secure prepaid payments", text: "UPI, cards and netbanking via Razorpay." },
      ],
    },
    { id: "care", type: "customerCare", enabled: true, startsAt: "", endsAt: "", title: "We're here to help", subtitle: "Questions about a product, delivery or return? Real people answer, usually within a few hours." },
    {
      id: "story", type: "brandStory", enabled: true, startsAt: "", endsAt: "", title: "Why choose City Seller?", showCategoryBlurbs: true,
      paragraphs: [
        "City Seller is an online store for the small things that make a home run smoothly. We pick practical products for real Indian homes, from rented one-BHKs to joint-family kitchens, and list them with clear specs, real dimensions and the full MRP so you can compare honestly.",
        "Every order is prepaid and handled by a small team that checks each one before it ships. If something arrives damaged or wrong, we make it right.",
      ],
    },
    { id: "guides", type: "guides", enabled: true, startsAt: "", endsAt: "", title: "Buying guides", limit: 3, background: "surface" },
    { id: "faq", type: "faq", enabled: true, startsAt: "", endsAt: "", title: "Frequently asked questions" },
  ],
};

export const DEFAULT_PAGES: Record<PageSlug, PageContent> = {
  about: { ...aboutPage, slug: "about" },
  shipping: policies.shipping,
  returns: policies.returns,
  privacy: policies.privacy,
  terms: policies.terms,
};

/* ==================================================================== registry of content keys */

export type ContentKey = "settings" | "home" | "faqs" | `page:${PageSlug}`;

export function schemaFor(key: ContentKey): z.ZodType {
  if (key === "settings") return settingsSchema;
  if (key === "home") return homeSchema;
  if (key === "faqs") return faqsSchema;
  return pageSchema;
}

export function defaultFor(key: ContentKey): unknown {
  if (key === "settings") return DEFAULT_SETTINGS;
  if (key === "home") return DEFAULT_HOME;
  if (key === "faqs") return { items: defaultStoreFaqs };
  return DEFAULT_PAGES[key.slice(5) as PageSlug];
}

export const isContentKey = (k: string): k is ContentKey =>
  k === "settings" || k === "home" || k === "faqs" || (k.startsWith("page:") && (PAGE_SLUGS as readonly string[]).includes(k.slice(5)));

/* ==================================================================== scheduling */

/**
 * Whether something with optional startsAt/endsAt is live at `now`. Dates are stored as ISO
 * strings with an offset (the admin form saves IST, +05:30), so comparison is timezone-safe.
 */
export function isScheduledLive(item: { startsAt?: string; endsAt?: string }, now = new Date()): boolean {
  const t = now.getTime();
  if (item.startsAt && t < new Date(item.startsAt).getTime()) return false;
  if (item.endsAt && t >= new Date(item.endsAt).getTime()) return false;
  return true;
}

export type ScheduleState = "live" | "scheduled" | "ended";
export function scheduleState(item: { startsAt?: string; endsAt?: string }, now = new Date()): ScheduleState {
  if (item.startsAt && now.getTime() < new Date(item.startsAt).getTime()) return "scheduled";
  if (item.endsAt && now.getTime() >= new Date(item.endsAt).getTime()) return "ended";
  return "live";
}
