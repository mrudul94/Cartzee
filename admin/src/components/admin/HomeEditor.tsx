"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Copy, ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Select } from "@/components/ui/Input";
import type { ActionState } from "@/lib/admin/forms";
import { addMarketplaceSections, categoryRowSection, duplicateSection, insertBeforeInfo, missingMarketplaceSections, newSection } from "@/lib/content/new-section";
import { scheduleState, SECTION_LABELS, type HomeContent, type HomeSection, type SectionType } from "@/lib/content/schema";
import { cn } from "@/lib/utils/cn";
import { ContentSaveForm } from "./EditorKit";
import type { ProductOption } from "./ProductPicker";
import { SectionEditor, type CategoryOptionLite } from "./SectionEditor";

export type HomeEditorProps = {
  initial: HomeContent;
  categories: CategoryOptionLite[];
  products: ProductOption[];
  shopUrl: string;
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  upload: (fd: FormData) => Promise<{ src?: string; error?: string }>;
};

const iconBtn =
  "inline-flex h-9 w-9 items-center justify-center rounded-md text-text hover:bg-secondary/60 disabled:opacity-40 focus-visible:outline-none focus-visible:shadow-focus";

const SOURCE_LABELS = { bestsellers: "Bestsellers", flashSale: "Flash sale", newArrivals: "New arrivals", trending: "Trending" } as const;

/** Bold name in the section list: the section's own title when it has one (e.g. "Shop by collection", "Kitchen"). */
function heading(s: HomeSection): string {
  const title = "title" in s ? s.title.trim() : "";
  return title || SECTION_LABELS[s.type];
}

const TILE_STYLES = { circle: "round images", collection: "wide photo cards", slider: "big slider", card: "cards" } as const;

/** One-line description shown in the section list. */
function summary(s: HomeSection, categories: CategoryOptionLite[]): string {
  switch (s.type) {
    case "hero":
      return `${s.slides.length} slide${s.slides.length === 1 ? "" : "s"}: ${s.slides[0]?.title ?? ""}`;
    case "productRow":
      if (s.source === "manual") return `Product row · ${s.productSlugs.length} hand-picked`;
      if (s.source === "category") return `Product row · category: ${categories.find((c) => c.slug === s.categorySlug)?.name ?? "not chosen"}`;
      return `Product row · ${SOURCE_LABELS[s.source]}`;
    case "offerBanner":
      return s.banner.title;
    case "bannerGrid":
      return `${s.banners.length} banners`;
    case "valueProps":
      return `${s.items.length} items`;
    case "categoryTiles":
      return `Category tiles · ${TILE_STYLES[s.variant]} · ${s.source === "top" ? "all main categories" : `${s.categorySlugs.length} chosen`}`;
    case "brandStory":
    case "budgetTiles":
    case "customerCare":
    case "guides":
    case "faq":
    case "recommended":
    case "recentlyViewed":
      return SECTION_LABELS[s.type];
  }
}

const STATE_BADGE = {
  live: { label: "Live", variant: "success" },
  scheduled: { label: "Scheduled", variant: "warning" },
  ended: { label: "Ended", variant: "neutral" },
} as const;

/**
 * Admin → Homepage: list of sections (reorder, show/hide, schedule status, delete, add)
 * with an edit panel. Nothing changes on the shop until "Save changes".
 */
export function HomeEditor({ initial, categories, products, shopUrl, action, upload }: HomeEditorProps) {
  const tops = categories.filter((c) => !c.parentSlug);
  // Older homepages added category rows automatically; list them here so they can be arranged (kept on Save).
  const upgrading = !initial.categoryRowsManaged;
  const [sections, setSections] = useState<HomeSection[]>(() => (upgrading ? insertBeforeInfo(initial.sections, tops.map(categoryRowSection)) : initial.sections));
  const hasRowFor = (slug: string) => sections.some((s) => s.type === "productRow" && s.source === "category" && s.categorySlug === slug);
  const missing = tops.filter((c) => !hasRowFor(c.slug));
  const addMissing = () => setSections((all) => insertBeforeInfo(all, missing.map(categoryRowSection)));
  const marketplace = missingMarketplaceSections(sections);
  const [selected, setSelected] = useState<string | null>(initial.sections[0]?.id ?? null);
  const [addType, setAddType] = useState<SectionType>("offerBanner");
  const current = sections.find((s) => s.id === selected);

  const update = (s: HomeSection) => setSections((all) => all.map((x) => (x.id === s.id ? s : x)));
  const move = (i: number, d: number) =>
    setSections((all) => {
      const next = [...all];
      const [it] = next.splice(i, 1);
      next.splice(i + d, 0, it!);
      return next;
    });
  /** Copy a section right below the original (new ids) and open it for editing. */
  const copy = (i: number) => {
    const dup = duplicateSection(sections[i]!);
    setSections((all) => [...all.slice(0, i + 1), dup, ...all.slice(i + 1)]);
    setSelected(dup.id);
  };
  const remove = (s: HomeSection) => {
    if (!window.confirm(`Delete the “${SECTION_LABELS[s.type]}” section? You can undo by not saving.`)) return;
    setSections((all) => all.filter((x) => x.id !== s.id));
    if (selected === s.id) setSelected(null);
  };
  const add = () => {
    const s = newSection(addType);
    setSections((all) => [...all, s]);
    setSelected(s.id);
  };

  return (
    <ContentSaveForm
      contentKey="home"
      value={{ sections, categoryRowsManaged: true }}
      action={action}
      extra={
        <Button href={shopUrl} target="_blank" variant="outline" icon={<ExternalLink aria-hidden className="h-4 w-4" />} iconPosition="right">
          View shop
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <Card padding="sm" className="self-start lg:col-span-2">
          <h2 className="px-1 pb-2 font-heading text-lg font-semibold">Sections (top to bottom)</h2>
          {upgrading && (
            <p role="status" className="mb-2 rounded-md bg-warning-soft p-3 text-sm">
              Each category&apos;s product row is now listed here, so you can move, hide or edit it. Click <strong>Save changes</strong> to keep this layout.
            </p>
          )}
          <ol className="flex flex-col gap-1">
            {sections.map((s, i) => {
              const state = scheduleState(s);
              return (
                <li key={s.id} className={cn("rounded-md border p-2", s.id === selected ? "border-ink bg-background" : "border-border")}>
                  <div className="flex items-start gap-2">
                    <Checkbox id={`show-${s.id}`} label={<span className="sr-only">Show {SECTION_LABELS[s.type]}</span>} checked={s.enabled} onCheckedChange={(enabled) => update({ ...s, enabled } as HomeSection)} />
                    <button type="button" onClick={() => setSelected(s.id)} className="min-w-0 flex-1 py-2 text-left focus-visible:outline-none focus-visible:shadow-focus" aria-current={s.id === selected || undefined}>
                      <span className="flex flex-wrap items-center gap-1">
                        <span className="font-semibold">{heading(s)}</span>
                        {!s.enabled && <Badge variant="neutral">Hidden</Badge>}
                        {s.enabled && state !== "live" && <Badge variant={STATE_BADGE[state].variant}>{STATE_BADGE[state].label}</Badge>}
                      </span>
                      <span className="block truncate text-sm text-text-muted">{summary(s, categories)}</span>
                    </button>
                    <div className="flex">
                      <button type="button" className={iconBtn} onClick={() => setSelected(s.id)} aria-label={`Edit ${SECTION_LABELS[s.type]}`}>
                        <Pencil aria-hidden className="h-4 w-4" />
                      </button>
                      <button type="button" className={iconBtn} onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${SECTION_LABELS[s.type]} up`}>
                        <ArrowUp aria-hidden className="h-4 w-4" />
                      </button>
                      <button type="button" className={iconBtn} onClick={() => move(i, 1)} disabled={i === sections.length - 1} aria-label={`Move ${SECTION_LABELS[s.type]} down`}>
                        <ArrowDown aria-hidden className="h-4 w-4" />
                      </button>
                      <button type="button" className={iconBtn} onClick={() => copy(i)} aria-label={`Copy ${heading(s)}`} title="Make a copy below">
                        <Copy aria-hidden className="h-4 w-4" />
                      </button>
                      <button type="button" className={cn(iconBtn, "text-error")} onClick={() => remove(s)} aria-label={`Delete ${SECTION_LABELS[s.type]}`}>
                        <Trash2 aria-hidden className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
          {marketplace.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-md bg-background p-2 text-sm">
              <span className="text-text-muted">Not on your homepage yet: {marketplace.join(", ")}</span>
              <Button size="sm" variant="outline" icon={<Plus aria-hidden className="h-4 w-4" />} onClick={() => setSections(addMarketplaceSections)}>
                Add marketplace sections
              </Button>
            </div>
          )}
          {missing.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-md bg-background p-2 text-sm">
              <span className="text-text-muted">No row yet for: {missing.map((c) => c.name).join(", ")}</span>
              <Button size="sm" variant="outline" icon={<Plus aria-hidden className="h-4 w-4" />} onClick={addMissing}>
                Add category rows
              </Button>
            </div>
          )}
          <div className="mt-3 flex gap-2 border-t border-border pt-3">
            <label htmlFor="add-section" className="sr-only">
              Section type to add
            </label>
            <Select id="add-section" size="sm" value={addType} onChange={(e) => setAddType(e.target.value as SectionType)} options={(Object.keys(SECTION_LABELS) as SectionType[]).map((t) => ({ value: t, label: SECTION_LABELS[t] }))} />
            <Button size="sm" variant="soft" icon={<Plus aria-hidden className="h-4 w-4" />} onClick={add}>
              Add
            </Button>
          </div>
        </Card>

        <Card padding="md" className="lg:col-span-3">
          {current ? (
            <>
              <h2 className="mb-4 font-heading text-xl font-semibold">Edit: {SECTION_LABELS[current.type]}</h2>
              <SectionEditor key={current.id} section={current} onChange={update} categories={categories} products={products} upload={upload} />
            </>
          ) : (
            <p className="text-text-muted">Choose a section on the left to edit it.</p>
          )}
        </Card>
      </div>
    </ContentSaveForm>
  );
}
