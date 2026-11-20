import Link from "next/link";
import type { HTMLAttributes, ReactNode } from "react";
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/** Loading placeholder block. Size it with token classes (h-4 w-32 …). */
export function Skeleton({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden className={cn("animate-pulse rounded-md bg-secondary-strong", className)} {...rest} />;
}

export function Separator({ orientation = "horizontal", className }: { orientation?: "horizontal" | "vertical"; className?: string }) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn("shrink-0 bg-border", orientation === "horizontal" ? "h-px w-full" : "h-full w-px", className)}
    />
  );
}

/* ------------------------------------------------------------------------------------------ */

export type PaginationProps = {
  page: number;
  totalPages: number;
  /** Builds the href for a page (keeps pages crawlable as links). */
  hrefFor: (page: number) => string;
  className?: string;
};

function pageList(page: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, page - 1, page, page + 1].filter((p) => p >= 1 && p <= total));
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1]! > 1) out.push("…");
    out.push(p);
  });
  return out;
}

const pageBtn =
  "inline-flex h-11 min-w-11 items-center justify-center rounded-md px-3 text-base font-medium transition-colors duration-fast focus-visible:outline-none focus-visible:shadow-focus";

export function Pagination({ page, totalPages, hrefFor, className }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Pagination" className={cn("flex items-center justify-center gap-1", className)}>
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} rel="prev" className={cn(pageBtn, "hover:bg-secondary/60")} aria-label="Previous page">
          <ChevronLeft aria-hidden className="h-5 w-5" />
        </Link>
      ) : (
        <span className={cn(pageBtn, "opacity-40")} aria-hidden>
          <ChevronLeft className="h-5 w-5" />
        </span>
      )}
      {pageList(page, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-2 text-text-muted">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(pageBtn, p === page ? "bg-ink text-text-inverse" : "hover:bg-secondary/60")}
          >
            {p}
          </Link>
        ),
      )}
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} rel="next" className={cn(pageBtn, "hover:bg-secondary/60")} aria-label="Next page">
          <ChevronRight aria-hidden className="h-5 w-5" />
        </Link>
      ) : (
        <span className={cn(pageBtn, "opacity-40")} aria-hidden>
          <ChevronRight className="h-5 w-5" />
        </span>
      )}
    </nav>
  );
}

/* ------------------------------------------------------------------------------------------ */

export type TableRow = { label: ReactNode; value: ReactNode };

/** Key–value table rendered as real HTML (specs, order details). Row headers use th scope="row". */
export function Table({ rows, caption, className }: { rows: TableRow[]; caption?: string; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-md border border-border", className)}>
      <table className="w-full border-collapse text-left text-base">
        {caption && <caption className="sr-only">{caption}</caption>}
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-border last:border-0 odd:bg-background">
              <th scope="row" className="w-2/5 px-4 py-3 align-top font-medium text-text">
                {r.label}
              </th>
              <td className="px-4 py-3 text-text-muted">{r.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------ */

export type QuantityStepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  label?: string;
  className?: string;
};

export function QuantityStepper({ value, onChange, min = 1, max = 10, size = "md", label = "Quantity", className }: QuantityStepperProps) {
  const btn = cn(
    "inline-flex items-center justify-center text-text transition-colors duration-fast hover:bg-secondary/60 focus-visible:outline-none focus-visible:shadow-focus disabled:opacity-40",
    size === "sm" ? "h-9 w-9" : "h-11 w-11",
  );
  return (
    <div role="group" aria-label={label} className={cn("inline-flex items-center rounded-md border border-border-strong bg-surface", className)}>
      <button type="button" className={btn} onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="Decrease quantity">
        <Minus aria-hidden className="h-4 w-4" />
      </button>
      <output aria-live="polite" className={cn("min-w-8 text-center font-semibold", size === "sm" ? "text-sm" : "text-base")}>
        {value}
      </output>
      <button type="button" className={btn} onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="Increase quantity">
        <Plus aria-hidden className="h-4 w-4" />
      </button>
    </div>
  );
}
