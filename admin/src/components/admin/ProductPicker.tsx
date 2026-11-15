"use client";

import Image from "next/image";
import { useId, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Search, X } from "lucide-react";
import { Input } from "@/components/ui/Input";

export type ProductOption = { slug: string; title: string; image: string };

export type ProductPickerProps = {
  label: string;
  options: ProductOption[];
  value: string[];
  onChange: (slugs: string[]) => void;
  max?: number;
};

const iconBtn =
  "inline-flex h-9 w-9 items-center justify-center rounded-md text-text hover:bg-secondary/60 disabled:opacity-40 focus-visible:outline-none focus-visible:shadow-focus";

/** Choose products by title (hand-picked homepage rows, product blocks in guides). Order is kept. */
export function ProductPicker({ label, options, value, onChange, max = 12 }: ProductPickerProps) {
  const id = useId();
  const [q, setQ] = useState("");
  const bySlug = useMemo(() => new Map(options.map((o) => [o.slug, o])), [options]);
  const matches = q.trim()
    ? options.filter((o) => !value.includes(o.slug) && o.title.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 8)
    : [];
  const move = (i: number, d: number) => {
    const next = [...value];
    const [s] = next.splice(i, 1);
    next.splice(i + d, 0, s!);
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label} <span className="text-text-muted">({value.length}/{max})</span>
      </label>
      {value.length > 0 && (
        <ul className="flex flex-col gap-1">
          {value.map((slug, i) => {
            const o = bySlug.get(slug);
            return (
              <li key={slug} className="flex items-center gap-2 rounded-md border border-border bg-surface p-1">
                <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-sm bg-background">
                  {o?.image && <Image src={o.image} alt="" fill sizes="36px" className="object-cover" />}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm">{o?.title ?? `${slug} (not found)`}</span>
                <button type="button" className={iconBtn} onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${o?.title ?? slug} up`}>
                  <ArrowUp aria-hidden className="h-4 w-4" />
                </button>
                <button type="button" className={iconBtn} onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label={`Move ${o?.title ?? slug} down`}>
                  <ArrowDown aria-hidden className="h-4 w-4" />
                </button>
                <button type="button" className={iconBtn} onClick={() => onChange(value.filter((s) => s !== slug))} aria-label={`Remove ${o?.title ?? slug}`}>
                  <X aria-hidden className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {value.length < max && (
        <div className="relative">
          <Input id={id} size="sm" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products to add…" leadingIcon={<Search className="h-4 w-4" />} autoComplete="off" />
          {matches.length > 0 && (
            <ul className="absolute inset-x-0 top-full z-dropdown mt-1 max-h-80 overflow-y-auto rounded-md border border-border bg-surface shadow-lg" role="listbox" aria-label="Matching products">
              {matches.map((o) => (
                <li key={o.slug} role="option" aria-selected={false}>
                  <button
                    type="button"
                    className="flex min-h-11 w-full items-center gap-2 px-2 text-left text-sm hover:bg-background focus-visible:outline-none focus-visible:shadow-focus"
                    onClick={() => {
                      onChange([...value, o.slug]);
                      setQ("");
                    }}
                  >
                    <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-sm bg-background">
                      {o.image && <Image src={o.image} alt="" fill sizes="32px" className="object-cover" />}
                    </span>
                    {o.title}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
