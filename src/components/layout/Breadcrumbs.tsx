import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { buildBreadcrumbJsonLd, type Crumb } from "@/lib/seo/jsonld";
import { JsonLd } from "@/lib/seo/JsonLdScript";
import { cn } from "@/lib/utils/cn";

export type BreadcrumbsProps = {
  items: Crumb[];
  withJsonLd?: boolean;
  /** First crumb; defaults to the shop home. The admin passes its dashboard. */
  home?: Crumb;
  className?: string;
};

/** Visible breadcrumb trail + matching BreadcrumbList JSON-LD. A home crumb is prepended automatically. */
export function Breadcrumbs({ items, withJsonLd = true, home = { label: "Home", href: "/" }, className }: BreadcrumbsProps) {
  const all: Crumb[] = [home, ...items];
  return (
    <>
      <nav aria-label="Breadcrumb" className={cn("py-3 text-sm", className)}>
        <ol className="flex flex-wrap items-center gap-1 text-text-muted">
          {all.map((c, i) => {
            const last = i === all.length - 1;
            return (
              <li key={`${c.label}-${i}`} className="flex items-center gap-1">
                {c.href && !last ? (
                  <Link href={c.href} className="inline-flex min-h-9 items-center hover:text-text hover:underline">
                    {c.label}
                  </Link>
                ) : (
                  <span aria-current={last ? "page" : undefined} className={cn(last && "text-text")}>
                    {c.label}
                  </span>
                )}
                {!last && <ChevronRight aria-hidden className="h-3 w-3" />}
              </li>
            );
          })}
        </ol>
      </nav>
      {withJsonLd && <JsonLd data={buildBreadcrumbJsonLd(all)} />}
    </>
  );
}
