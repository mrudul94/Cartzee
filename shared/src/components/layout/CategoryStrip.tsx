"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgePercent,
  Bath,
  CookingPot,
  Dumbbell,
  Flame,
  Flower2,
  Gift,
  House,
  Lamp,
  Lightbulb,
  Package,
  PawPrint,
  Shirt,
  Sparkles,
  SprayCan,
  Tag,
  ToyBrick,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { paths } from "@/lib/utils/paths";
import type { NavCategory } from "./MegaMenu";

/** Picks a line icon from the category name (categories are created in the admin and have no icon). */
const ICON_RULES: [RegExp, LucideIcon][] = [
  [/kitchen|cook|dining|utensil/i, CookingPot],
  [/clean|mop|laundry/i, SprayCan],
  [/decor|d[ée]cor|light|lamp/i, Lamp],
  [/storage|organis|organiz|box/i, Package],
  [/fashion|cloth|wear|apparel|kid/i, Shirt],
  [/bath/i, Bath],
  [/toy|game/i, ToyBrick],
  [/garden|plant/i, Flower2],
  [/tool|hardware|improvement/i, Wrench],
  [/fitness|sport|gym/i, Dumbbell],
  [/pet/i, PawPrint],
  [/gift|festive|pooja/i, Gift],
  [/electric|bulb/i, Lightbulb],
  [/home|essential/i, House],
];
const iconFor = (name: string): LucideIcon => ICON_RULES.find(([re]) => re.test(name))?.[1] ?? Tag;

const item =
  "relative flex w-20 shrink-0 snap-start flex-col items-center gap-1 pb-2 pt-1 text-center focus-visible:outline-none focus-visible:shadow-focus";

/**
 * Phone/tablet header row: sideways-scrolling line icons with names (no photos), like a marketplace app.
 * Starts with Flash Sale, Bestsellers and New, then every category; the current one is underlined.
 * Desktop keeps the text category bar with hover menus.
 */
export function CategoryStrip({ tree, className }: { tree: NavCategory[]; className?: string }) {
  const pathname = usePathname();
  const entries = [
    { href: paths.flashSale(), label: "Flash Sale", icon: Flame },
    { href: paths.bestsellers(), label: "Bestsellers", icon: BadgePercent },
    { href: paths.newArrivals(), label: "New", icon: Sparkles },
    ...tree.map((c) => ({ href: paths.category(c), label: c.name, icon: iconFor(c.name) })),
  ];
  return (
    <nav aria-label="Categories" className={cn("border-b border-border lg:hidden", className)}>
      <ul className="flex snap-x scroll-px-2 gap-1 overflow-x-auto px-2">
        {entries.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link href={href} aria-current={active ? "page" : undefined} className={cn(item, active ? "text-primary" : "text-text")}>
                <Icon aria-hidden className="h-7 w-7" strokeWidth={1.5} />
                <span className={cn("line-clamp-1 w-full text-xs leading-tight", active ? "font-semibold" : "font-medium")}>{label}</span>
                {active && <span aria-hidden className="absolute inset-x-2 bottom-0 h-1 rounded-full bg-primary" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
