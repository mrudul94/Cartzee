"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatINR } from "@/lib/utils/format";

export type BrowserTile = { href: string; label: string; image?: string; price?: number };
export type BrowserCategory = { slug: string; name: string; href: string; image?: string; subcategories: BrowserTile[]; products: BrowserTile[] };

function Tile({ t }: { t: BrowserTile }) {
  return (
    <li>
      <Link href={t.href} className="group flex flex-col items-center gap-1 rounded-md text-center focus-visible:outline-none focus-visible:shadow-focus">
        <span className="relative block aspect-square w-full overflow-hidden rounded-md bg-surface">
          {t.image && <Image src={t.image} alt="" fill sizes="(min-width: 1024px) 12vw, (min-width: 640px) 18vw, 26vw" className="object-cover transition-transform duration-slow group-hover:scale-105" />}
        </span>
        <span className="line-clamp-2 text-xs leading-tight text-text">{t.label}</span>
        {t.price !== undefined && <span className="text-xs font-semibold text-text">{formatINR(t.price)}</span>}
      </Link>
    </li>
  );
}

const grid = "grid grid-cols-3 gap-x-2 gap-y-3 sm:grid-cols-4 lg:grid-cols-6";

/**
 * All-categories browser (marketplace app style): category list on the left, compact picture tiles on the
 * right (subcategories, then that category's products). Remembers the choice in the URL (?c=slug).
 */
export function CategoryBrowser({ categories }: { categories: BrowserCategory[] }) {
  const [selected, setSelected] = useState(categories[0]?.slug);
  const current = categories.find((c) => c.slug === selected) ?? categories[0];

  // Restore the last chosen category from the address (?c=slug) so Back returns to it.
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("c");
    if (c && categories.some((x) => x.slug === c)) setSelected(c);
  }, [categories]);

  useEffect(() => {
    if (!selected) return;
    const url = new URL(window.location.href);
    url.searchParams.set("c", selected);
    window.history.replaceState(null, "", url);
  }, [selected]);

  if (!current) return <p className="p-4 text-text-muted">Categories are coming soon.</p>;
  return (
    <div className="flex min-h-screen">
      <nav aria-label="Categories" className="w-24 shrink-0 bg-background sm:w-32">
        <ul className="flex flex-col">
          {categories.map((c) => {
            const active = c.slug === current.slug;
            return (
              <li key={c.slug}>
                <button
                  type="button"
                  aria-current={active ? "true" : undefined}
                  onClick={() => setSelected(c.slug)}
                  className={cn(
                    "flex min-h-14 w-full items-center justify-center border-l-4 px-2 py-2 text-center text-xs leading-tight focus-visible:outline-none focus-visible:shadow-focus sm:text-sm",
                    active ? "border-primary bg-surface font-semibold text-primary" : "border-transparent text-text hover:bg-surface",
                  )}
                >
                  {c.name}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="min-w-0 flex-1 bg-surface px-3 py-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold">{current.name}</h2>
          <Link href={current.href} className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary">
            View all <ChevronRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
        {current.subcategories.length > 0 && (
          <section aria-label={`${current.name} types`} className="mb-4">
            <ul className={grid}>
              {current.subcategories.map((t) => (
                <Tile key={t.href} t={t} />
              ))}
            </ul>
          </section>
        )}
        {current.products.length > 0 ? (
          <section aria-label={`${current.name} products`}>
            {current.subcategories.length > 0 && <h3 className="mb-2 text-sm font-semibold text-text-muted">Products</h3>}
            <ul className={grid}>
              {current.products.map((t) => (
                <Tile key={t.href} t={t} />
              ))}
            </ul>
          </section>
        ) : (
          current.subcategories.length === 0 && <p className="text-sm text-text-muted">New products are coming soon.</p>
        )}
      </div>
    </div>
  );
}
