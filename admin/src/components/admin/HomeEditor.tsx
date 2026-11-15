"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Select } from "@/components/ui/Input";
import type { ActionState } from "@/lib/admin/forms";
import { newSection } from "@/lib/content/new-section";
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

/** One-line description shown in the section list. */
function summary(s: HomeSection): string {
  switch (s.type) {
    case "hero":
      return `${s.slides.length} slide${s.slides.length === 1 ? "" : "s"}: ${s.slides[0]?.title ?? ""}`;
    case "productRow":
      return `${s.title} · ${s.source === "manual" ? `${s.productSlugs.length} picked` : s.source}`;
    case "offerBanner":
      return s.banner.title;
    case "bannerGrid":
      return `${s.banners.length} banners`;
    case "valueProps":
      return `${s.items.length} items`;
    case "brandStory":
    case "categoryTiles":
    case "budgetTiles":
    case "customerCare":
    case "guides":
    case "faq":
      return s.title;
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
  const [sections, setSections] = useState<HomeSection[]>(initial.sections);
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
      value={{ sections }}
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
          <ol className="flex flex-col gap-1">
            {sections.map((s, i) => {
              const state = scheduleState(s);
              return (
                <li key={s.id} className={cn("rounded-md border p-2", s.id === selected ? "border-ink bg-background" : "border-border")}>
                  <div className="flex items-start gap-2">
                    <Checkbox id={`show-${s.id}`} label={<span className="sr-only">Show {SECTION_LABELS[s.type]}</span>} checked={s.enabled} onCheckedChange={(enabled) => update({ ...s, enabled } as HomeSection)} />
                    <button type="button" onClick={() => setSelected(s.id)} className="min-w-0 flex-1 py-2 text-left focus-visible:outline-none focus-visible:shadow-focus" aria-current={s.id === selected || undefined}>
                      <span className="flex flex-wrap items-center gap-1">
                        <span className="font-semibold">{SECTION_LABELS[s.type]}</span>
                        {!s.enabled && <Badge variant="neutral">Hidden</Badge>}
                        {s.enabled && state !== "live" && <Badge variant={STATE_BADGE[state].variant}>{STATE_BADGE[state].label}</Badge>}
                      </span>
                      <span className="block truncate text-sm text-text-muted">{summary(s)}</span>
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
                      <button type="button" className={cn(iconBtn, "text-error")} onClick={() => remove(s)} aria-label={`Delete ${SECTION_LABELS[s.type]}`}>
                        <Trash2 aria-hidden className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
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
