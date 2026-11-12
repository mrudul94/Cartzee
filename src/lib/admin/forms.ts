import { z } from "zod";
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
