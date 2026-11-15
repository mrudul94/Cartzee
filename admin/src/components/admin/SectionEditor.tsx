"use client";

import type { ReactNode } from "react";
import { Checkbox } from "@/components/ui/Checkbox";
import { FormField } from "@/components/ui/FormField";
import { Select } from "@/components/ui/Input";
import { newBanner, newHeroSlide } from "@/lib/content/new-section";
import { VALUE_PROP_ICONS, type HomeSection } from "@/lib/content/schema";
import { ImageField, ListEditor, ScheduleFields, TextField } from "./EditorKit";
import { ProductPicker, type ProductOption } from "./ProductPicker";
import { paths } from "@/lib/utils/paths";

export type CategoryOptionLite = { slug: string; name: string; parentSlug: string | null };

export type SectionEditorProps = {
  section: HomeSection;
  onChange: (s: HomeSection) => void;
  categories: CategoryOptionLite[];
  products: ProductOption[];
  upload: (fd: FormData) => Promise<{ src?: string; error?: string }>;
};

type Banner = Extract<HomeSection, { type: "bannerGrid" }>["banners"][number];

const BACKGROUNDS = [
  { value: "background", label: "Cream (page)" },
  { value: "surface", label: "White" },
  { value: "secondary", label: "Sand" },
  { value: "soft", label: "Soft terracotta" },
];
const TONES = [
  { value: "sand", label: "Sand" },
  { value: "soft", label: "Soft terracotta" },
  { value: "ink", label: "Dark" },
];

function SelectField({ id, label, value, options, onChange, hint }: { id: string; label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void; hint?: string }) {
  return (
    <FormField id={id} label={label} hint={hint}>
      <Select id={id} size="sm" value={value} options={options} onChange={(e) => onChange(e.target.value)} />
    </FormField>
  );
}

const Row = ({ children }: { children: ReactNode }) => <div className="grid gap-3 md:grid-cols-2">{children}</div>;

function LinkPair({ idPrefix, label, value, onChange }: { idPrefix: string; label: string; value: { label: string; href: string }; onChange: (v: { label: string; href: string }) => void }) {
  return (
    <Row>
      <TextField id={`${idPrefix}-label`} label={`${label} text`} value={value.label} onChange={(v) => onChange({ ...value, label: v })} maxLength={40} required />
      <TextField id={`${idPrefix}-href`} label={`${label} link`} hint="e.g. /kitchen or https://…" value={value.href} onChange={(v) => onChange({ ...value, href: v })} required />
    </Row>
  );
}

function BannerFields({ banner, update, idPrefix, upload, schedule = true }: { banner: Banner; update: (p: Partial<Banner>) => void; idPrefix: string; upload: SectionEditorProps["upload"]; schedule?: boolean }) {
  return (
    <>
      <Row>
        <TextField id={`${idPrefix}-eyebrow`} label="Small label above title" value={banner.eyebrow} onChange={(v) => update({ eyebrow: v })} maxLength={40} />
        <SelectField id={`${idPrefix}-tone`} label="Colour" value={banner.tone} options={TONES} onChange={(v) => update({ tone: v as Banner["tone"] })} />
      </Row>
      <TextField id={`${idPrefix}-title`} label="Title" value={banner.title} onChange={(v) => update({ title: v })} maxLength={80} required />
      <TextField id={`${idPrefix}-text`} label="Text" value={banner.text} onChange={(v) => update({ text: v })} maxLength={160} />
      <LinkPair idPrefix={`${idPrefix}-cta`} label="Button" value={banner.cta} onChange={(cta) => update({ cta })} />
      <ImageField id={`${idPrefix}-image`} label="Background art (optional)" value={banner.image} onChange={(image) => update({ image })} upload={upload} folder="banners" slug={idPrefix} optional />
      {schedule && <ScheduleFields idPrefix={idPrefix} value={banner} onChange={(v) => update(v)} />}
    </>
  );
}

/** Edit form for one homepage section; fields depend on the section type. */
export function SectionEditor({ section: s, onChange, categories, products, upload }: SectionEditorProps) {
  const set = (patch: Partial<HomeSection>) => onChange({ ...s, ...patch } as HomeSection);
  const id = (f: string) => `${s.id}-${f}`;
  const tops = categories.filter((c) => !c.parentSlug);

  const body = (() => {
    switch (s.type) {
      case "hero":
        return (
          <ListEditor
            items={s.slides}
            onChange={(slides) => set({ slides })}
            min={1}
            max={5}
            addLabel="Add slide"
            newItem={newHeroSlide}
            itemLabel={(sl, i) => `Slide ${i + 1}: ${sl.title}${sl.enabled ? "" : " (hidden)"}`}
            renderItem={(sl, update, i) => (
              <>
                <div className="grid gap-1 rounded-md bg-surface p-3 md:grid-cols-2">
                  <Checkbox id={id(`s${i}-on`)} label="Show this slide" checked={sl.enabled} onCheckedChange={(enabled) => update({ enabled })} />
                  <Checkbox id={id(`s${i}-click`)} label="Whole slide is clickable" checked={sl.clickable} onCheckedChange={(clickable) => update({ clickable })} />
                  {sl.clickable && (
                    <div className="grid gap-3 md:col-span-2 md:grid-cols-2">
                      <SelectField
                        id={id(`s${i}-cat`)}
                        label="Opens category"
                        value={categories.some((c) => paths.category(c) === sl.link) ? sl.link : ""}
                        onChange={(link) => link && update({ link })}
                        options={[{ value: "", label: "Choose a category…" }, ...categories.map((c) => ({ value: paths.category(c), label: c.parentSlug ? `— ${c.name}` : c.name }))]}
                      />
                      <TextField id={id(`s${i}-link`)} label="…or any link" hint="e.g. /flash-sale or /kitchen/cookware" value={sl.link} onChange={(link) => update({ link })} />
                    </div>
                  )}
                </div>
                <TextField id={id(`s${i}-eyebrow`)} label="Small label above title" value={sl.eyebrow} onChange={(v) => update({ eyebrow: v })} maxLength={60} />
                <TextField id={id(`s${i}-title`)} label="Title" value={sl.title} onChange={(v) => update({ title: v })} maxLength={90} required />
                <TextField id={id(`s${i}-text`)} label="Text" value={sl.text} onChange={(v) => update({ text: v })} multiline maxLength={240} />
                <ImageField id={id(`s${i}-img`)} label="Image" value={sl.image.src} onChange={(src) => update({ image: { ...sl.image, src } })} upload={upload} folder="banners" slug={s.id} hint="Wide image (16:9), plain background works best" />
                <TextField id={id(`s${i}-alt`)} label="Image description (alt text)" value={sl.image.alt} onChange={(alt) => update({ image: { ...sl.image, alt } })} maxLength={160} required />
                <LinkPair idPrefix={id(`s${i}-cta1`)} label="Main button" value={sl.primaryCta} onChange={(primaryCta) => update({ primaryCta })} />
                <Checkbox id={id(`s${i}-cta2-on`)} label="Second button" checked={Boolean(sl.secondaryCta)} onCheckedChange={(on) => update({ secondaryCta: on ? { label: "Learn more", href: "/" } : null })} />
                {sl.secondaryCta && <LinkPair idPrefix={id(`s${i}-cta2`)} label="Second button" value={sl.secondaryCta} onChange={(secondaryCta) => update({ secondaryCta })} />}
                <TextField
                  id={id(`s${i}-chips`)}
                  label="Highlight chips"
                  hint="Up to 4, separated by |"
                  value={sl.highlights.join(" | ")}
                  onChange={(v) => update({ highlights: v.split("|").map((x) => x.trim()).filter(Boolean).slice(0, 4) })}
                />
                <ScheduleFields idPrefix={id(`s${i}`)} value={sl} onChange={(v) => update(v)} />
              </>
            )}
          />
        );
      case "productRow":
        return (
          <>
            <Row>
              <TextField id={id("title")} label="Title" value={s.title} onChange={(title) => set({ title })} maxLength={60} required />
              <TextField id={id("eyebrow")} label="Small label above title" value={s.eyebrow} onChange={(eyebrow) => set({ eyebrow })} maxLength={40} />
            </Row>
            <TextField id={id("subtitle")} label="Subtitle" value={s.subtitle} onChange={(subtitle) => set({ subtitle })} maxLength={160} />
            <Row>
              <SelectField
                id={id("source")}
                label="Which products"
                value={s.source}
                onChange={(v) => set({ source: v as typeof s.source })}
                options={[
                  { value: "bestsellers", label: "Bestsellers" },
                  { value: "flashSale", label: "Flash sale" },
                  { value: "newArrivals", label: "New arrivals" },
                  { value: "category", label: "From a category" },
                  { value: "manual", label: "Hand-picked" },
                ]}
              />
              <SelectField id={id("layout")} label="Layout" value={s.layout} onChange={(v) => set({ layout: v as typeof s.layout })} options={[{ value: "grid", label: "Grid" }, { value: "carousel", label: "Swipe row on mobile" }]} />
            </Row>
            {s.source === "category" && (
              <SelectField
                id={id("cat")}
                label="Category"
                value={s.categorySlug}
                onChange={(categorySlug) => set({ categorySlug })}
                options={[{ value: "", label: "Choose…" }, ...categories.map((c) => ({ value: c.slug, label: c.parentSlug ? `— ${c.name}` : c.name }))]}
              />
            )}
            {s.source === "manual" && <ProductPicker label="Products" options={products} value={s.productSlugs} onChange={(productSlugs) => set({ productSlugs })} />}
            <Row>
              {s.source !== "manual" && (
                <SelectField id={id("limit")} label="How many" value={String(s.limit)} onChange={(v) => set({ limit: Number(v) })} options={[4, 6, 8, 12].map((n) => ({ value: String(n), label: String(n) }))} />
              )}
              <TextField id={id("viewall")} label="“View all” link (optional)" value={s.viewAllHref} onChange={(viewAllHref) => set({ viewAllHref })} placeholder="/bestsellers" />
              <SelectField id={id("bg")} label="Background" value={s.background} onChange={(v) => set({ background: v as typeof s.background })} options={BACKGROUNDS} />
            </Row>
          </>
        );
      case "offerBanner":
        return (
          <>
            <p className="text-sm text-text-muted">Optional heading shown above the banner:</p>
            <Row>
              <TextField id={id("heading")} label="Heading" value={s.heading} onChange={(heading) => set({ heading })} maxLength={60} />
              <TextField id={id("heyebrow")} label="Small label above heading" value={s.headingEyebrow} onChange={(headingEyebrow) => set({ headingEyebrow })} maxLength={40} />
            </Row>
            <TextField id={id("hsub")} label="Heading subtitle" value={s.headingSubtitle} onChange={(headingSubtitle) => set({ headingSubtitle })} maxLength={160} />
            <TextField id={id("viewall")} label="“View all” link (optional)" value={s.viewAllHref} onChange={(viewAllHref) => set({ viewAllHref })} />
            <hr className="border-border" />
            <BannerFields banner={s.banner} update={(p) => set({ banner: { ...s.banner, ...p } })} idPrefix={id("banner")} upload={upload} schedule={false} />
          </>
        );
      case "bannerGrid":
        return (
          <>
            <TextField id={id("label")} label="Name (for screen readers)" value={s.label} onChange={(label) => set({ label })} maxLength={60} />
            <ListEditor
              items={s.banners}
              onChange={(banners) => set({ banners })}
              min={1}
              max={6}
              addLabel="Add banner"
              newItem={newBanner}
              itemLabel={(b, i) => `Banner ${i + 1}: ${b.title}`}
              renderItem={(b, update, i) => <BannerFields banner={b} update={update} idPrefix={id(`b${i}`)} upload={upload} />}
            />
          </>
        );
      case "categoryTiles":
        return (
          <>
            <TextField id={id("title")} label="Title" value={s.title} onChange={(title) => set({ title })} maxLength={60} required />
            <TextField id={id("subtitle")} label="Subtitle" value={s.subtitle} onChange={(subtitle) => set({ subtitle })} maxLength={160} />
            <Row>
              <SelectField id={id("variant")} label="Style" value={s.variant} onChange={(v) => set({ variant: v as typeof s.variant })} options={[{ value: "circle", label: "Round images" }, { value: "card", label: "Cards with caption" }]} />
              <SelectField id={id("source")} label="Which categories" value={s.source} onChange={(v) => set({ source: v as typeof s.source })} options={[{ value: "top", label: "All main categories" }, { value: "manual", label: "Choose…" }]} />
              <SelectField id={id("bg")} label="Background" value={s.background} onChange={(v) => set({ background: v as typeof s.background })} options={BACKGROUNDS} />
            </Row>
            {s.source === "manual" && (
              <fieldset>
                <legend className="mb-1 text-sm font-medium">Categories (in this order)</legend>
                <div className="grid md:grid-cols-2">
                  {categories.map((c) => (
                    <Checkbox
                      key={c.slug}
                      id={id(`c-${c.slug}`)}
                      label={c.parentSlug ? `${c.name} (${tops.find((t) => t.slug === c.parentSlug)?.name ?? ""})` : c.name}
                      checked={s.categorySlugs.includes(c.slug)}
                      onCheckedChange={(on) => set({ categorySlugs: on ? [...s.categorySlugs, c.slug] : s.categorySlugs.filter((x) => x !== c.slug) })}
                    />
                  ))}
                </div>
              </fieldset>
            )}
          </>
        );
      case "budgetTiles":
      case "customerCare":
        return (
          <>
            <TextField id={id("title")} label="Title" value={s.title} onChange={(title) => set({ title })} maxLength={60} required />
            <TextField id={id("subtitle")} label="Subtitle" value={s.subtitle} onChange={(subtitle) => set({ subtitle })} maxLength={200} />
            {s.type === "customerCare" && <p className="text-sm text-text-muted">Phone, WhatsApp, email and hours come from Settings.</p>}
          </>
        );
      case "valueProps":
        return (
          <ListEditor
            items={s.items}
            onChange={(items) => set({ items })}
            min={1}
            max={6}
            addLabel="Add item"
            newItem={() => ({ icon: "star" as const, title: "New point", text: "" })}
            itemLabel={(it, i) => `${i + 1}. ${it.title}`}
            renderItem={(it, update, i) => (
              <Row>
                <SelectField id={id(`v${i}-icon`)} label="Icon" value={it.icon} onChange={(v) => update({ icon: v as typeof it.icon })} options={VALUE_PROP_ICONS.map((x) => ({ value: x, label: x }))} />
                <TextField id={id(`v${i}-title`)} label="Title" value={it.title} onChange={(title) => update({ title })} maxLength={40} required />
                <div className="md:col-span-2">
                  <TextField id={id(`v${i}-text`)} label="Text" value={it.text} onChange={(text) => update({ text })} maxLength={120} />
                </div>
              </Row>
            )}
          />
        );
      case "brandStory":
        return (
          <>
            <TextField id={id("title")} label="Title" value={s.title} onChange={(title) => set({ title })} maxLength={80} required />
            <ListEditor
              items={s.paragraphs.map((text) => ({ text }))}
              onChange={(ps) => set({ paragraphs: ps.map((p) => p.text) })}
              min={1}
              max={4}
              addLabel="Add paragraph"
              newItem={() => ({ text: "" })}
              itemLabel={(_p, i) => `Paragraph ${i + 1}`}
              renderItem={(p, update, i) => <TextField id={id(`p${i}`)} label="Text" value={p.text} onChange={(text) => update({ text })} multiline rows={4} maxLength={800} />}
            />
            <Checkbox id={id("blurbs")} label="Show a card for each category (uses the category blurbs)" checked={s.showCategoryBlurbs} onCheckedChange={(showCategoryBlurbs) => set({ showCategoryBlurbs })} />
          </>
        );
      case "guides":
        return (
          <Row>
            <TextField id={id("title")} label="Title" value={s.title} onChange={(title) => set({ title })} maxLength={60} required />
            <SelectField id={id("limit")} label="How many guides" value={String(s.limit)} onChange={(v) => set({ limit: Number(v) })} options={[1, 2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: String(n) }))} />
            <SelectField id={id("bg")} label="Background" value={s.background} onChange={(v) => set({ background: v as typeof s.background })} options={BACKGROUNDS} />
          </Row>
        );
      case "faq":
        return (
          <>
            <TextField id={id("title")} label="Title" value={s.title} onChange={(title) => set({ title })} maxLength={80} required />
            <p className="text-sm text-text-muted">The questions themselves are edited in Pages → Store FAQs.</p>
          </>
        );
    }
  })();

  return (
    <div className="flex flex-col gap-4">
      {body}
      <div className="border-t border-border pt-4">
        <p className="mb-2 text-sm font-semibold">Schedule this whole section</p>
        <ScheduleFields idPrefix={id("sched")} value={s} onChange={(v) => set(v)} />
      </div>
    </div>
  );
}
