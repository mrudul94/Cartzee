import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export type Chip = { label: string; href: string; active?: boolean; count?: number };

/** Horizontally scrolling link chips (subcategory refine, budget tiers, admin status filters). */
export function ChipNav({ chips, label, className }: { chips: Chip[]; label: string; className?: string }) {
  if (chips.length === 0) return null;
  return (
    <nav aria-label={label} className={cn("-mx-4 overflow-x-auto px-4", className)}>
      <ul className="flex gap-2">
        {chips.map((c) => (
          <li key={c.href} className="shrink-0">
            <Link
              href={c.href}
              aria-current={c.active ? "page" : undefined}
              className={cn(
                "inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-medium focus-visible:outline-none focus-visible:shadow-focus",
                c.active ? "bg-ink text-text-inverse" : "border border-border-strong bg-surface text-text hover:bg-secondary/60",
              )}
            >
              {c.label}
              {c.count !== undefined && (
                <span className={cn("rounded-full px-2 text-xs", c.active ? "bg-surface/20" : "bg-secondary")}>{c.count}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
