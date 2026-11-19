"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Checkbox, RadioGroup } from "@/components/ui/Checkbox";
import { Select } from "@/components/ui/Input";
import { Drawer } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Misc";
import { BUDGET_TIERS } from "@/lib/utils/budget";
import { cn } from "@/lib/utils/cn";
import type { CardProduct } from "@/lib/utils/product";
import { ProductCard } from "./ProductCard";

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "bestselling", label: "Best selling" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Customer rating" },
  { value: "newest", label: "Newest first" },
  { value: "discount", label: "Biggest discount" },
] as const;

const PAGE_SIZE = 12;

type Filters = { budget?: string; material: string[]; colour: string[]; size: string[]; rating?: string; min?: number; max?: number; sort: string; page: number };

function readFilters(sp: URLSearchParams): Filters {
  const num = (k: string) => (sp.get(k) && !Number.isNaN(Number(sp.get(k))) ? Number(sp.get(k)) : undefined);
  return {
    budget: sp.get("budget") ?? undefined,
    material: sp.getAll("material"),
    colour: sp.getAll("colour"),
    size: sp.getAll("size"),
    rating: sp.get("rating") ?? undefined,
    min: num("min"),
    max: num("max"),
    sort: sp.get("sort") ?? "featured",
    page: Math.max(1, num("page") ?? 1),
  };
}

function apply(products: CardProduct[], f: Filters) {
  const tier = BUDGET_TIERS.find((t) => t.slug === f.budget);
  const list = products.filter(
    (p) =>
      (!tier || (p.price >= tier.min && p.price <= tier.max)) &&
      (f.min === undefined || p.price >= f.min) &&
      (f.max === undefined || p.price <= f.max) &&
      (f.material.length === 0 || f.material.includes(p.material)) &&
      (f.colour.length === 0 || f.colour.includes(p.colour)) &&
      (f.size.length === 0 || p.sizes.some((s) => f.size.includes(s))) &&
      (!f.rating || p.rating >= Number(f.rating)),
  );
  const off = (p: CardProduct) => (p.mrp - p.price) / p.mrp;
  const sorters: Record<string, (a: CardProduct, b: CardProduct) => number> = {
    bestselling: (a, b) => b.reviewCount - a.reviewCount,
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    rating: (a, b) => b.rating - a.rating,
    newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
    discount: (a, b) => off(b) - off(a),
  };
  const sorter = sorters[f.sort];
  const sorted = sorter ? [...list].sort(sorter) : [...list].sort((a, b) => Number(b.inStock) - Number(a.inStock));
  return sorted;
}

export type CategoryListingProps = {
  products: CardProduct[];
  /** Hide the budget facet on budget pages (already filtered). */
  hideBudget?: boolean;
  emptyMessage?: string;
};

/**
 * Filter (price, budget tier, size for clothing, material, colour, rating), sort and paginate a product set.
 * State lives in the URL so filtered views are shareable; the base page stays statically rendered.
 */
export function CategoryListing({ products, hideBudget = false, emptyMessage = "No products match these filters." }: CategoryListingProps) {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const f = readFilters(new URLSearchParams(sp.toString()));

  const facets = useMemo(
    () => ({
      material: [...new Set(products.map((p) => p.material))].sort(),
      colour: [...new Set(products.map((p) => p.colour))].sort(),
      // Clothing only: sizes in the order they were entered (S, M, L, XL), not alphabetical.
      size: [...new Set(products.flatMap((p) => p.sizes))],
    }),
    [products],
  );
  const filtered = useMemo(() => apply(products, f), [products, sp]); // eslint-disable-line react-hooks/exhaustive-deps
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(f.page, totalPages);
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hrefWith = (mutate: (p: URLSearchParams) => void) => {
    const next = new URLSearchParams(sp.toString());
    mutate(next);
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };
  const update = (mutate: (p: URLSearchParams) => void) => {
    router.replace(hrefWith((p) => {
      mutate(p);
      p.delete("page");
    }), { scroll: false });
  };
  const toggle = (key: "material" | "colour" | "size", value: string, on: boolean) =>
    update((p) => {
      const vals = p.getAll(key).filter((v) => v !== value);
      p.delete(key);
      [...vals, ...(on ? [value] : [])].forEach((v) => p.append(key, v));
    });

  const activeCount = (f.budget ? 1 : 0) + f.material.length + f.colour.length + f.size.length + (f.rating ? 1 : 0);

  const panel = (
    <div className="flex flex-col gap-6">
      {!hideBudget && (
        <fieldset>
          <legend className="mb-1 font-semibold">Budget</legend>
          <RadioGroup
            name="budget"
            label="Budget"
            value={f.budget ?? "any"}
            onValueChange={(v) => update((p) => (v === "any" ? p.delete("budget") : p.set("budget", v)))}
            options={[{ value: "any", label: "Any price" }, ...BUDGET_TIERS.map((t) => ({ value: t.slug, label: t.label }))]}
          />
        </fieldset>
      )}
      {facets.size.length > 0 && (
        <fieldset>
          <legend className="mb-2 font-semibold">Size</legend>
          <div className="flex flex-wrap gap-2">
            {facets.size.map((z) => {
              const on = f.size.includes(z);
              return (
                <button
                  key={z}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle("size", z, !on)}
                  className={cn(
                    "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border px-3 text-sm font-semibold transition-colors duration-fast focus-visible:outline-none focus-visible:shadow-focus",
                    on ? "border-ink bg-ink text-text-inverse" : "border-border-strong bg-surface text-text hover:border-ink",
                  )}
                >
                  {z}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}
      {facets.material.length > 1 && (
        <fieldset>
          <legend className="mb-1 font-semibold">Material</legend>
          {facets.material.map((m) => (
            <Checkbox key={m} id={`material-${m}`} label={m} checked={f.material.includes(m)} onCheckedChange={(on) => toggle("material", m, on)} />
          ))}
        </fieldset>
      )}
      {facets.colour.length > 1 && (
        <fieldset>
          <legend className="mb-1 font-semibold">Colour</legend>
          {facets.colour.map((c) => (
            <Checkbox key={c} id={`colour-${c}`} label={c} checked={f.colour.includes(c)} onCheckedChange={(on) => toggle("colour", c, on)} />
          ))}
        </fieldset>
      )}
      <fieldset>
        <legend className="mb-1 font-semibold">Customer rating</legend>
        <RadioGroup
          name="rating"
          label="Customer rating"
          value={f.rating ?? "any"}
          onValueChange={(v) => update((p) => (v === "any" ? p.delete("rating") : p.set("rating", v)))}
          options={[
            { value: "any", label: "Any rating" },
            { value: "4", label: "4★ & above" },
            { value: "3", label: "3★ & above" },
          ]}
        />
      </fieldset>
      {activeCount > 0 && (
        <Button variant="link" className="self-start" onClick={() => router.replace(pathname, { scroll: false })}>
          Clear all filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-4">
      <aside className="hidden lg:block" aria-label="Filters">
        {panel}
      </aside>
      <div className="lg:col-span-3">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-text-muted" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? "product" : "products"}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="lg:hidden"
              onClick={() => setFiltersOpen(true)}
              icon={<SlidersHorizontal aria-hidden className="h-4 w-4" />}
            >
              Filters{activeCount > 0 ? ` (${activeCount})` : ""}
            </Button>
            <label htmlFor="sort" className="sr-only">
              Sort by
            </label>
            <Select
              id="sort"
              className="w-auto"
              value={f.sort}
              onChange={(e) => update((p) => (e.target.value === "featured" ? p.delete("sort") : p.set("sort", e.target.value)))}
              options={SORT_OPTIONS}
            />
          </div>
        </div>

        {visible.length === 0 ? (
          <p className="rounded-lg border border-border bg-surface p-8 text-center text-text-muted">{emptyMessage}</p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
            {visible.map((p, i) => (
              <li key={p.id}>
                <ProductCard product={p} priority={i < 2} headingLevel="h2" />
              </li>
            ))}
          </ul>
        )}
        <Pagination className="mt-8" page={page} totalPages={totalPages} hrefFor={(n) => hrefWith((p) => (n === 1 ? p.delete("page") : p.set("page", String(n))))} />
      </div>

      <Drawer
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        side="left"
        title="Filters"
        footer={
          <Button fullWidth variant="secondary" onClick={() => setFiltersOpen(false)}>
            Show {filtered.length} products
          </Button>
        }
      >
        {panel}
      </Drawer>
    </div>
  );
}
