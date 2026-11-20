"use client";

import { keepFormValues } from "@/hooks/useKeepFormValues";
import { useActionState, useState, type ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { FormField } from "@/components/ui/FormField";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { specsToText, type ActionState } from "@/lib/admin/forms";
import type { Faq, Spec } from "@/lib/types";
import { calcDiscount, calcMargin, daysSince, formatINR, slugify } from "@/lib/utils/format";
import { NEW_BADGE_DAYS } from "@/lib/utils/product";
import { ImageManager, type ManagedImage } from "./ImageManager";
import { ListEditor, TextField } from "./EditorKit";
import { cn } from "@/lib/utils/cn";

export type ProductFormValues = {
  id?: string;
  title: string;
  slug: string;
  categorySlug: string;
  subcategorySlug: string;
  summary: string;
  description: string;
  howToUse: string[];
  specs: Spec[];
  faqs: Faq[];
  material: string;
  sizes: string;
  colour: string;
  countryOfOrigin: string;
  qualityCertified: boolean;
  price: number;
  mrp: number;
  meeshoUrl: string;
  meeshoPrice: number;
  priceCheckedAt?: string;
  stock: number;
  isBestseller: boolean;
  isFlashSale: boolean;
  isActive: boolean;
  /** null = automatic */
  isNew: boolean | null;
  /** Shop order (lower first); null = automatic. */
  position: number | null;
  seoTitle?: string;
  seoDescription?: string;
  images: ManagedImage[];
  /** Storefront URL when the product already exists. */
  path?: string;
};

export type CategoryOption = { slug: string; name: string; hasSizes?: boolean; children: { slug: string; name: string; hasSizes?: boolean }[] };

/** Quick-pick sizes for clothing products. */
const SIZE_PRESETS = [
  { label: "Adult", sizes: ["XS", "S", "M", "L", "XL", "XXL"] },
  { label: "Kids (age)", sizes: ["0-6M", "6-12M", "1-2Y", "2-3Y", "3-4Y", "4-5Y", "5-6Y", "6-7Y", "7-8Y", "8-9Y", "9-10Y"] },
];
const splitSizes = (v: string) => v.split(",").map((s) => s.trim()).filter(Boolean);

export type ProductFormProps = {
  values: ProductFormValues;
  categories: CategoryOption[];
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  upload: (fd: FormData) => Promise<{ src?: string; error?: string }>;
  notice?: string;
};

function Section({ title, children, description }: { title: string; description?: string; children: ReactNode }) {
  return (
    <Card as="fieldset" padding="md" className="flex flex-col gap-4">
      <legend className="sr-only">{title}</legend>
      <div>
        <h2 className="font-heading text-xl font-semibold">{title}</h2>
        {description && <p className="text-sm text-text-muted">{description}</p>}
      </div>
      {children}
    </Card>
  );
}

/** Create/edit product: details, pricing with live margin, Meesho link, photos, content, visibility and SEO. */
export function ProductForm({ values: v, categories, action, upload, notice }: ProductFormProps) {
  const [state, formAction, pending] = useActionState(action, notice ? { ok: true, message: notice } : {});
  const e = state.errors ?? {};
  const [title, setTitle] = useState(v.title);
  const [slug, setSlug] = useState(v.slug);
  const [category, setCategory] = useState(v.categorySlug);
  const [sub, setSub] = useState(v.subcategorySlug);
  const [sizes, setSizes] = useState(v.sizes);
  const [faqs, setFaqs] = useState<Faq[]>(v.faqs);
  const [price, setPrice] = useState(String(v.price || ""));
  const [mrp, setMrp] = useState(String(v.mrp || ""));
  const [cost, setCost] = useState(String(v.meeshoPrice || ""));
  const [images, setImages] = useState<ManagedImage[]>(v.images);
  const [seoTitle, setSeoTitle] = useState(v.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(v.seoDescription ?? "");

  const cat = categories.find((c) => c.slug === category);
  const subs = cat?.children ?? [];
  // Clothing (category or subcategory marked "products come in sizes"): sizes are required.
  const needsSizes = Boolean(cat?.hasSizes || subs.find((s) => s.slug === sub)?.hasSizes);
  const chosenSizes = splitSizes(sizes);
  const toggleSize = (s: string) => setSizes((chosenSizes.includes(s) ? chosenSizes.filter((x) => x !== s) : [...chosenSizes, s]).join(", "));
  const margin = calcMargin(Number(price) || 0, Number(cost) || 0);
  const stale = v.priceCheckedAt ? daysSince(v.priceCheckedAt) : null;
  const field = (name: string) => ({ id: `p-${name}`, name, invalid: Boolean(e[name]) });

  return (
    <form action={formAction} onSubmit={keepFormValues(formAction)} className="flex flex-col gap-6" noValidate>
      {v.id && <input type="hidden" name="id" value={v.id} />}
      <input type="hidden" name="images" value={JSON.stringify(images)} />

      {state.message && (
        <p role={state.ok ? "status" : "alert"} className={state.ok ? "rounded-md bg-success-soft p-4 text-success" : "rounded-md bg-error-soft p-4 text-error"}>
          {state.message}
        </p>
      )}

      <Section title="Basics">
        <FormField id="p-title" label="Product title" error={e.title} hint="Short and clear, e.g. “Airtight Storage Jar Set, 6 pc (1.2 L)”" required>
          <Input {...field("title")} value={title} onChange={(ev) => setTitle(ev.target.value)} />
        </FormField>
        <FormField id="p-slug" label="URL slug" error={e.slug} hint={`Leave empty to use “${slugify(title) || "…"}”. Changing it changes the product URL.`}>
          <Input {...field("slug")} value={slug} onChange={(ev) => setSlug(ev.target.value)} placeholder={slugify(title)} />
        </FormField>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField id="p-categorySlug" label="Category" error={e.categorySlug} required>
            <Select
              {...field("categorySlug")}
              value={category}
              onChange={(ev) => {
                setCategory(ev.target.value);
                setSub("");
              }}
              placeholder="Choose category" options={categories.map((c) => ({ value: c.slug, label: c.name }))} />
          </FormField>
          <FormField id="p-subcategorySlug" label="Subcategory (optional)" error={e.subcategorySlug} hint={subs.length ? undefined : "This category has no subcategories."}>
            <Select
              {...field("subcategorySlug")}
              value={subs.some((s) => s.slug === sub) ? sub : ""}
              onChange={(ev) => setSub(ev.target.value)}
              options={[{ value: "", label: "None" }, ...subs.map((s) => ({ value: s.slug, label: s.name }))]}
            />
          </FormField>
        </div>
        <FormField id="p-summary" label="One-line answer (what it is, who it's for)" error={e.summary} hint="Shown under the title and used by search/AI engines." required>
          <Textarea {...field("summary")} rows={2} defaultValue={v.summary} />
        </FormField>
      </Section>

      <Section title="Pricing & supplier" description="Customers see the price and MRP. The Meesho link and cost are private.">
        <div className="grid gap-4 md:grid-cols-3">
          <FormField id="p-price" label="Selling price (₹)" error={e.price} required>
            <Input {...field("price")} inputMode="decimal" value={price} onChange={(ev) => setPrice(ev.target.value)} />
          </FormField>
          <FormField id="p-mrp" label="MRP (₹)" error={e.mrp} hint={Number(mrp) > 0 ? `${calcDiscount(Number(mrp), Number(price))}% off shown` : undefined} required>
            <Input {...field("mrp")} inputMode="decimal" value={mrp} onChange={(ev) => setMrp(ev.target.value)} />
          </FormField>
          <FormField id="p-stock" label="Stock" error={e.stock} hint="0 shows “Sold out”" required>
            <Input {...field("stock")} inputMode="numeric" defaultValue={v.stock} />
          </FormField>
          <FormField id="p-meeshoUrl" label="Meesho product link" error={e.meeshoUrl} className="md:col-span-2">
            <Input {...field("meeshoUrl")} type="url" defaultValue={v.meeshoUrl} placeholder="https://www.meesho.com/…" />
          </FormField>
          <FormField id="p-meeshoPrice" label="Meesho price (₹)" error={e.meeshoPrice} required>
            <Input {...field("meeshoPrice")} inputMode="decimal" value={cost} onChange={(ev) => setCost(ev.target.value)} />
          </FormField>
        </div>
        <p aria-live="polite" className="rounded-md bg-background p-3">
          Margin per unit:{" "}
          <strong className={margin.amount < 0 ? "text-error" : margin.percent >= 25 ? "text-success" : "text-warning"}>
            {formatINR(margin.amount)} ({margin.percent}%)
          </strong>
        </p>
        <div>
          <Checkbox id="p-priceChecked" name="priceChecked" defaultChecked={!v.id} label="I checked the Meesho price today" />
          {stale !== null && (
            <p className={stale > 7 ? "text-sm text-warning" : "text-sm text-text-muted"}>
              Last checked {stale === 0 ? "today" : `${stale} day${stale === 1 ? "" : "s"} ago`}
              {stale > 7 && ": please re-check the Meesho price"}.
            </p>
          )}
        </div>
      </Section>

      <Section title="Photos" description="5 to 8 photos on a light, uniform background. The first photo is used on cards and in search results.">
        <ImageManager images={images} onChange={setImages} upload={upload} slug={slug || slugify(title)} defaultAlt={title || "Product"} error={e.images} />
      </Section>

      <Section title="Details">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField id="p-material" label="Material" error={e.material}>
            <Input {...field("material")} defaultValue={v.material} placeholder="e.g. Steel" />
          </FormField>
          <FormField id="p-colour" label="Colour" error={e.colour}>
            <Input {...field("colour")} defaultValue={v.colour} placeholder="e.g. Grey" />
          </FormField>
          <FormField id="p-countryOfOrigin" label="Country of origin" error={e.countryOfOrigin} hint="Shown on the product page. “India” also adds a “Made in India” label on cards. Check it on the supplier listing.">
            <Input {...field("countryOfOrigin")} defaultValue={v.countryOfOrigin} placeholder="e.g. India" />
          </FormField>
          <div className="flex items-end">
            <Checkbox id="p-qualityCertified" name="qualityCertified" defaultChecked={v.qualityCertified} label="Quality certified (e.g. ISI/BIS mark; tick only if true)" />
          </div>
        </div>
        {needsSizes || chosenSizes.length > 0 ? (
          <FormField
            id="p-sizes"
            label="Sizes"
            error={e.sizes}
            required={needsSizes}
            hint={
              needsSizes
                ? "Clothing: tap the sizes this item comes in (or type them, comma separated). Shoppers must pick one, and the size shows on the order."
                : "This category isn't marked as clothing. Clear the sizes if the product doesn't come in sizes."
            }
          >
            <div className="flex flex-col gap-3">
              <Input {...field("sizes")} value={sizes} onChange={(ev) => setSizes(ev.target.value)} placeholder="e.g. S, M, L, XL" />
              {SIZE_PRESETS.map((group) => (
                <div key={group.label} className="flex flex-wrap items-center gap-2">
                  <span className="w-20 text-sm text-text-muted">{group.label}</span>
                  {group.sizes.map((s) => {
                    const on = chosenSizes.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggleSize(s)}
                        className={cn(
                          "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border px-3 text-sm font-semibold transition-colors duration-fast focus-visible:outline-none focus-visible:shadow-focus",
                          on ? "border-ink bg-ink text-text-inverse" : "border-border-strong bg-surface text-text hover:border-ink",
                        )}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </FormField>
        ) : (
          <input type="hidden" name="sizes" value="" />
        )}
        <FormField id="p-description" label="Description" error={e.description} hint="Separate paragraphs with a blank line." required>
          <Textarea {...field("description")} rows={6} defaultValue={v.description} />
        </FormField>
        <FormField id="p-howToUse" label="How to use / care" error={e.howToUse} hint="One step per line.">
          <Textarea {...field("howToUse")} rows={4} defaultValue={v.howToUse.join("\n")} />
        </FormField>
        <FormField id="p-specs" label="Specifications" error={e.specs} hint="One per line as “Label: Value”, e.g. “Capacity: 1.2 L”.">
          <Textarea {...field("specs")} rows={6} defaultValue={specsToText(v.specs)} />
        </FormField>
        <div className="flex flex-col gap-2">
          <p className="font-medium">FAQs</p>
          <p className="text-sm text-text-muted">3 to 5 questions shoppers ask (shown on the product page). Both a question and an answer are needed.</p>
          <input type="hidden" name="faqs" value={JSON.stringify(faqs.filter((x) => x.q.trim() || x.a.trim()))} />
          <ListEditor
            items={faqs}
            onChange={setFaqs}
            max={10}
            addLabel="Add question"
            newItem={() => ({ q: "", a: "" })}
            itemLabel={(x, i) => `Q${i + 1}: ${x.q || "New question"}`}
            renderItem={(x, update, i) => (
              <>
                <TextField id={`p-faq-q-${i}`} label="Question" value={x.q} onChange={(q) => update({ q })} maxLength={200} />
                <TextField id={`p-faq-a-${i}`} label="Answer" value={x.a} onChange={(a) => update({ a })} multiline maxLength={1000} />
              </>
            )}
          />
          {e.faqs && <p className="text-sm text-error">FAQs: {e.faqs}</p>}
        </div>
      </Section>

      <Section title="Visibility">
        <div className="grid md:grid-cols-3">
          <Checkbox id="p-isActive" name="isActive" defaultChecked={v.isActive} label="Visible in store" />
          <Checkbox id="p-isBestseller" name="isBestseller" defaultChecked={v.isBestseller} label="Bestseller" />
          <Checkbox id="p-isFlashSale" name="isFlashSale" defaultChecked={v.isFlashSale} label="In flash sale" />
        </div>
        <FormField id="p-isNew" label="“New” badge" hint={`Automatic shows it for ${NEW_BADGE_DAYS} days after the product is added.`}>
          <Select
            id="p-isNew"
            name="isNew"
            defaultValue={v.isNew === true ? "on" : v.isNew === false ? "off" : "auto"}
            options={[
              { value: "auto", label: "Automatic" },
              { value: "on", label: "Always show" },
              { value: "off", label: "Never show" },
            ]}
            className="max-w-80"
          />
        </FormField>
        <FormField
          id="p-position"
          label="Position in the shop (optional)"
          error={e.position}
          hint="Lower numbers show first in homepage rows and category pages (1 = first). Leave empty to list it after numbered products, newest first."
        >
          <Input {...field("position")} type="number" inputMode="numeric" min={1} max={9999} defaultValue={v.position ?? ""} placeholder="Automatic" className="max-w-40" />
        </FormField>
      </Section>

      <Section title="Search appearance (optional)" description="Leave empty to generate from the title and summary.">
        <FormField id="p-seoTitle" label="SEO title" error={e.seoTitle} hint={`${seoTitle.length}/60 characters`}>
          <Input {...field("seoTitle")} value={seoTitle} onChange={(ev) => setSeoTitle(ev.target.value)} />
        </FormField>
        <FormField id="p-seoDescription" label="Meta description" error={e.seoDescription} hint={`${seoDescription.length}/155 characters`}>
          <Textarea {...field("seoDescription")} rows={2} value={seoDescription} onChange={(ev) => setSeoDescription(ev.target.value)} />
        </FormField>
      </Section>

      <div className="sticky bottom-0 z-sticky -mx-4 flex flex-wrap items-center gap-3 border-t border-border bg-surface px-4 py-3 md:mx-0 md:rounded-lg md:border">
        <Button type="submit" variant="secondary" size="lg" loading={pending}>
          {v.id ? "Save changes" : "Create product"}
        </Button>
        {v.path && (
          <Button href={v.path} variant="outline" icon={<ExternalLink aria-hidden className="h-4 w-4" />} iconPosition="right" target="_blank">
            View in store
          </Button>
        )}
        {Object.keys(e).length > 0 && <p className="text-sm text-error">Please fix {Object.keys(e).length} highlighted field(s).</p>}
      </div>
    </form>
  );
}
