import { z } from "zod";
import { faqItemSchema, linkSchema } from "@/lib/content/schema";
import type { Faq, Spec } from "@/lib/types";
import { ORDER_STATUSES } from "@/lib/types";
import { slugify } from "@/lib/utils/format";

/* ------------------------------------------------------------------ text <-> structured fields */

/** "Material: Steel" lines ↔ specs. */
export const specsToText = (specs: Spec[]) => specs.map((s) => `${s.label}: ${s.value}`).join("\n");
export function textToSpecs(text: string): Spec[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const i = l.indexOf(":");
      return i > 0 ? { label: l.slice(0, i).trim(), value: l.slice(i + 1).trim() } : { label: l, value: "" };
    })
    .filter((s) => s.label && s.value);
}

/** "Q: …" / "A: …" blocks separated by blank lines ↔ FAQs. */
export const faqsToText = (faqs: Faq[]) => faqs.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n\n");
export function textToFaqs(text: string): Faq[] {
  return text
    .split(/\r?\n\s*\r?\n/)
    .map((block) => {
      const q = block.match(/^\s*Q:\s*(.+)$/im)?.[1]?.trim();
      const a = block.match(/^\s*A:\s*([\s\S]+)$/im)?.[1]?.trim();
      return q && a ? { q, a } : null;
    })
    .filter((f): f is Faq => f !== null);
}

export const linesToList = (text: string) => text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

/* ------------------------------------------------------------------ product form */

const money = z.coerce.number({ message: "Enter an amount" }).min(0, "Must be 0 or more").max(1_000_000);
const checkbox = z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean());

export const productFormSchema = z
  .object({
    id: z.string().optional().transform((v) => v || undefined),
    title: z.string().trim().min(5, "Title is too short").max(120),
    slug: z.string().trim().max(80).optional().default(""),
    categorySlug: z.string().min(1, "Choose a category"),
    subcategorySlug: z.string().min(1, "Choose a subcategory"),
    summary: z.string().trim().min(20, "Write a one-line summary (at least 20 characters)").max(240),
    description: z.string().trim().min(40, "Description is too short").max(5000),
    howToUse: z.string().optional().default("").transform(linesToList),
    specs: z.string().optional().default("").transform(textToSpecs),
    faqs: z.string().optional().default("").transform(textToFaqs),
    material: z.string().trim().max(60).default(""),
    colour: z.string().trim().max(60).default(""),
    price: money.refine((v) => v > 0, "Price must be more than 0"),
    mrp: money,
    meeshoUrl: z.union([z.literal(""), z.string().trim().url("Enter the full Meesho product link")]).default(""),
    meeshoPrice: money,
    priceChecked: checkbox,
    stock: z.coerce.number().int("Whole number").min(0).max(100_000),
    isBestseller: checkbox,
    isFlashSale: checkbox,
    isActive: checkbox,
    /** "auto" (first 30 days) | "on" | "off" → null | true | false */
    isNew: z
      .enum(["auto", "on", "off"])
      .default("auto")
      .transform((v) => (v === "auto" ? null : v === "on")),
    seoTitle: z.string().trim().max(70).optional().transform((v) => v || undefined),
    seoDescription: z.string().trim().max(170).optional().transform((v) => v || undefined),
    images: z
      .string()
      .default("[]")
      .transform((s, ctx) => {
        try {
          return z.array(z.object({ src: z.string().min(1), alt: z.string().trim().min(3, "Every image needs alt text") })).parse(JSON.parse(s));
        } catch {
          ctx.addIssue({ code: "custom", message: "Every image needs a source and alt text (at least 3 characters)" });
          return z.NEVER;
        }
      }),
  })
  .transform((v) => ({ ...v, slug: slugify(v.slug || v.title) }))
  .superRefine((v, ctx) => {
    if (v.mrp < v.price) ctx.addIssue({ code: "custom", path: ["mrp"], message: "MRP must be at least the selling price" });
    if (v.images.length === 0) ctx.addIssue({ code: "custom", path: ["images"], message: "Add at least one image" });
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(v.slug)) ctx.addIssue({ code: "custom", path: ["slug"], message: "Use lowercase letters, numbers and hyphens" });
  });

/** FormData → plain object for zod (single values only). */
export const formObject = (fd: FormData) => Object.fromEntries([...fd.entries()].filter(([, v]) => typeof v === "string"));

/** Zod issues → { field: message } for inline form errors. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of error.issues) {
    const key = String(i.path[0] ?? "form");
    out[key] ??= i.message;
  }
  return out;
}

/* ------------------------------------------------------------------ order update form */

export const orderUpdateSchema = z
  .object({
    orderId: z.string().min(1),
    to: z.enum(ORDER_STATUSES),
    meeshoOrderId: z.string().trim().max(60).optional().transform((v) => v || undefined),
    meeshoCost: z
      .string()
      .optional()
      .transform((v) => (v ? Number(v) : undefined))
      .refine((v) => v === undefined || (Number.isFinite(v) && v >= 0), "Enter the amount paid on Meesho"),
    trackingUrl: z.union([z.literal(""), z.string().trim().url("Enter the full tracking link")]).optional().transform((v) => v || undefined),
    note: z.string().trim().max(500).optional().transform((v) => v || undefined),
    refund: checkbox,
  })
  .superRefine((v, ctx) => {
    if (v.to === "placed_on_meesho") {
      if (!v.meeshoOrderId) ctx.addIssue({ code: "custom", path: ["meeshoOrderId"], message: "Paste the Meesho order ID first" });
      if (v.meeshoCost === undefined) ctx.addIssue({ code: "custom", path: ["meeshoCost"], message: "Enter what you paid on Meesho" });
    }
    if (v.to === "shipped" && !v.trackingUrl) ctx.addIssue({ code: "custom", path: ["trackingUrl"], message: "Paste the courier tracking link first" });
  });

export type ActionState = { ok?: boolean; message?: string; errors?: Record<string, string> };

/* ------------------------------------------------------------------ category form */


const slugRule = z
  .string()
  .trim()
  .max(80)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens");
const jsonList = <T extends z.ZodType>(item: T, max: number) =>
  z
    .string()
    .default("[]")
    .transform((s, ctx) => {
      try {
        return JSON.parse(s) as unknown;
      } catch {
        ctx.addIssue({ code: "custom", message: "Invalid list" });
        return z.NEVER;
      }
    })
    .pipe(z.array(item).max(max));

export const categoryFormSchema = z.object({
  id: z.string().optional().transform((v) => v || undefined),
  name: z.string().trim().min(2, "Name is required").max(60),
  slug: z.string().trim().max(80).optional().default(""),
  parentSlug: z.string().optional().transform((v) => v || null),
  intro: z.string().trim().min(20, "Write a 1–2 sentence answer (at least 20 characters)").max(400),
  blurb: z.string().trim().max(200).default(""),
  image: z.union([z.literal(""), linkSchema]).default(""),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
  isActive: checkbox,
  seoTitle: z.string().trim().max(70).optional().transform((v) => v || undefined),
  seoDescription: z.string().trim().max(170).optional().transform((v) => v || undefined),
  faqs: jsonList(faqItemSchema, 10),
}).transform((v, ctx) => {
  const slug = slugify(v.slug || v.name);
  if (!slugRule.safeParse(slug).success) ctx.addIssue({ code: "custom", path: ["slug"], message: "Use lowercase letters, numbers and hyphens" });
  return { ...v, slug };
});

/* ------------------------------------------------------------------ guide (blog post) form */

export const postBlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("h2"), text: z.string().trim().min(1, "Heading is empty").max(120) }),
  z.object({ type: z.literal("p"), text: z.string().trim().min(1, "Paragraph is empty").max(3000) }),
  z.object({ type: z.literal("products"), slugs: z.array(z.string().max(100)).min(1, "Pick at least one product").max(6) }),
]);

export const postFormSchema = z.object({
  originalSlug: z.string().optional().transform((v) => v || undefined),
  title: z.string().trim().min(10, "Title is too short").max(110),
  slug: z.string().trim().max(90).optional().default(""),
  excerpt: z.string().trim().min(20, "Write a short summary (at least 20 characters)").max(240),
  cover: linkSchema,
  author: z.string().trim().min(2).max(60).default("City Seller Team"),
  isPublished: checkbox,
  body: jsonList(postBlockSchema, 80).refine((b) => b.length > 0, "Add at least one paragraph"),
  faqs: jsonList(faqItemSchema, 10),
}).transform((v, ctx) => {
  const slug = slugify(v.slug || v.title);
  if (!slugRule.safeParse(slug).success) ctx.addIssue({ code: "custom", path: ["slug"], message: "Use lowercase letters, numbers and hyphens" });
  return { ...v, slug };
});
