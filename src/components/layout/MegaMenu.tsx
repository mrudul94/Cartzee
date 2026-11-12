import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/lib/types";
import { BUDGET_TIERS } from "@/lib/utils/budget";
import { paths } from "@/lib/utils/paths";
import { Container } from "./Container";
import { NavDropdown } from "./NavDropdown";

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
            <Link href={paths.category(c)} className="font-heading text-lg font-semibold text-text hover:text-primary">
              {c.name}
            </Link>
            <ul className="mt-3 flex flex-col gap-1">
              {c.children.map((s) => (
                <li key={s.slug}>
                  <Link href={paths.category(s)} className="flex min-h-11 items-center gap-3 rounded-md px-1 text-base text-text-muted hover:bg-background hover:text-text">
                    <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md bg-background">
                      <Image src={s.image} alt="" fill sizes="36px" className="object-cover" />
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

/** "Shop by Budget" dropdown listing the five price tiers. */
export function BudgetMenu() {
  return (
    <NavDropdown label="Shop by Budget">
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
