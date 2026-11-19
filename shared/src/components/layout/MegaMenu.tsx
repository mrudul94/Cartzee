import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/lib/types";
import { BUDGET_TIERS } from "@/lib/utils/budget";
import { paths } from "@/lib/utils/paths";
import { Container } from "./Container";
import { NavDropdown } from "./NavDropdown";
import { cn } from "@/lib/utils/cn";

export type NavCategory = Category & { children: Category[] };

/** Builds the two-level category tree used by MegaMenu, MobileNav and Footer. */
export function buildCategoryTree(categories: Category[]): NavCategory[] {
  return categories
    .filter((c) => !c.parentSlug)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((c) => ({ ...c, children: categories.filter((s) => s.parentSlug === c.slug).sort((a, b) => a.sortOrder - b.sortOrder) }));
}

/** "Shop by Category" mega-menu: one column per category, heading + "View all" + subcategory links with thumbnails. */
export function MegaMenu({ tree }: { tree: NavCategory[] }) {
  return (
    <NavDropdown label="Shop by Category" panel="mega">
      <Container className="grid grid-cols-3 gap-8 py-8 xl:grid-cols-6">
        {tree.map((c) => (
          <div key={c.slug}>
            <Link href={paths.category(c)} className="text-lg font-semibold text-text hover:text-primary">
              {c.name}
            </Link>
            <ul className="mt-3 flex flex-col gap-1">
              {c.children.map((s) => (
                <li key={s.slug}>
                  <Link href={paths.category(s)} className="flex min-h-11 items-center gap-3 rounded-md px-1 text-base text-text-muted hover:bg-background hover:text-text">
                    <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md bg-background">
                      {s.image && <Image src={s.image} alt="" fill sizes="36px" className="object-cover" />}
                    </span>
                    {s.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href={paths.category(c)} className="inline-flex min-h-11 items-center px-1 text-sm font-semibold text-text underline-offset-4 hover:underline">
                  View all {c.name}
                </Link>
              </li>
            </ul>
          </div>
        ))}
      </Container>
    </NavDropdown>
  );
}

/**
 * Marketplace-style category bar: one menu per top category. Hovering opens a full-width panel with
 * that category's subcategories in columns, "View all", and the category picture. Categories without
 * subcategories are plain links. Shows 4 categories on laptops and 6 on wide screens; every category is
 * on the All categories page (first item of the bar).
 */
export function CategoryNav({ tree }: { tree: NavCategory[] }) {
  return (
    <>
      {tree.slice(0, 6).map((c, i) => {
        const visibility = i >= 4 ? "hidden xl:block" : undefined;
        if (c.children.length === 0) {
          return (
            <Link
              key={c.slug}
              href={paths.category(c)}
              className={cn(
                "items-center whitespace-nowrap rounded-md px-3 text-base font-medium text-text hover:bg-secondary/60 focus-visible:outline-none focus-visible:shadow-focus",
                i >= 4 ? "hidden min-h-11 xl:inline-flex" : "inline-flex min-h-11",
              )}
            >
              {c.name}
            </Link>
          );
        }
        return (
          <NavDropdown key={c.slug} label={c.name} panel="mega" className={visibility}>
            <Container className="grid grid-cols-4 gap-8 py-6">
              <div className="col-span-3">
                <div className="mb-4 flex items-baseline justify-between gap-4 border-b border-border pb-2">
                  <Link href={paths.category(c)} className="text-xl font-semibold text-text hover:text-primary">
                    {c.name}
                  </Link>
                  <Link href={paths.category(c)} className="inline-flex min-h-11 items-center text-sm font-semibold text-primary underline-offset-4 hover:underline">
                    View all {c.name} →
                  </Link>
                </div>
                <ul className="grid grid-cols-3 gap-x-6 gap-y-1">
                  {c.children.map((s) => (
                    <li key={s.slug}>
                      <Link
                        href={paths.category(s)}
                        className="flex min-h-11 items-center gap-3 rounded-md px-2 text-base text-text-muted hover:bg-background hover:text-text focus-visible:outline-none focus-visible:shadow-focus"
                      >
                        <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md bg-background">
                          {s.image && <Image src={s.image} alt="" fill sizes="36px" className="object-cover" />}
                        </span>
                        {s.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <Link href={paths.category(c)} className="group relative block aspect-tile overflow-hidden rounded-lg bg-secondary focus-visible:outline-none focus-visible:shadow-focus">
                {c.image && <Image src={c.image} alt="" fill sizes="25vw" className="object-cover transition-transform duration-slow group-hover:scale-105" />}
                <span className="absolute inset-x-0 bottom-0 bg-ink/80 px-4 py-3 text-lg font-semibold text-text-inverse">Shop {c.name}</span>
              </Link>
            </Container>
          </NavDropdown>
        );
      })}
    </>
  );
}

/** "More" menu at the end of the bar: Bestsellers, New arrivals, Track order, Guides, All categories. */
export function MoreMenu() {
  const links = [
    { href: paths.bestsellers(), label: "Bestsellers" },
    { href: paths.newArrivals(), label: "New arrivals" },
    { href: paths.track(), label: "Track order" },
    { href: paths.guides(), label: "Buying guides" },
    { href: "/categories", label: "All categories" },
  ];
  return (
    <NavDropdown label="More" align="right">
      <ul className="flex flex-col p-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="flex min-h-11 items-center rounded-md px-3 text-base text-text hover:bg-background">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </NavDropdown>
  );
}

/** "Shop by Budget" dropdown listing the five price tiers. */
export function BudgetMenu({ align = "left" }: { align?: "left" | "right" } = {}) {
  return (
    <NavDropdown label="Shop by Budget" align={align}>
      <ul className="flex flex-col p-2">
        {BUDGET_TIERS.map((t) => (
          <li key={t.slug}>
            <Link href={paths.budget(t.slug)} className="flex min-h-11 items-center rounded-md px-3 text-base text-text hover:bg-background">
              {t.label}
            </Link>
          </li>
        ))}
      </ul>
    </NavDropdown>
  );
}
