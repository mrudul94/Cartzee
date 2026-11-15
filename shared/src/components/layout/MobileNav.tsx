"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Accordion } from "@/components/ui/Disclosure";
import { SocialIcon } from "@/components/ui/Icon";
import { Drawer } from "@/components/ui/Modal";
import type { Settings } from "@/lib/content/schema";
import { site } from "@/lib/site";
import { BUDGET_TIERS } from "@/lib/utils/budget";
import { paths } from "@/lib/utils/paths";
import type { NavCategory } from "./MegaMenu";

const link = "flex min-h-11 items-center text-base text-text hover:underline";

/** Hamburger + left drawer with categories (accordion), budget tiers, key links and socials. */
export function MobileNav({ tree, social }: { tree: NavCategory[]; social: Settings["social"] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      side="left"
      title="Menu"
      trigger={
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
          <Menu aria-hidden className="h-6 w-6" />
        </Button>
      }
    >
      <nav aria-label="Mobile">
        <ul className="mb-4 flex flex-col">
          <li><Link className={link} href={paths.flashSale()}>Flash Sale</Link></li>
          <li><Link className={link} href={paths.newArrivals()}>New arrivals</Link></li>
          <li><Link className={link} href={paths.bestsellers()}>Bestsellers</Link></li>
        </ul>
        <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-text-muted">Shop by Category</p>
        <Accordion
          type="single"
          headingLevel="h3"
          items={tree.map((c) => ({
            id: c.slug,
            title: c.name,
            content: (
              <ul className="flex flex-col pl-2">
                {c.children.map((s) => (
                  <li key={s.slug}><Link className={link} href={paths.category(s)}>{s.name}</Link></li>
                ))}
                <li><Link className={`${link} font-semibold`} href={paths.category(c)}>View all {c.name}</Link></li>
              </ul>
            ),
          }))}
        />
        <p className="mb-1 mt-6 text-sm font-semibold uppercase tracking-wider text-text-muted">Shop by Budget</p>
        <ul className="flex flex-col">
          {BUDGET_TIERS.map((t) => (
            <li key={t.slug}><Link className={link} href={paths.budget(t.slug)}>{t.label}</Link></li>
          ))}
        </ul>
        <ul className="mt-6 flex flex-col border-t border-border pt-4">
          <li><Link className={link} href={paths.guides()}>Buying guides</Link></li>
          <li><Link className={link} href={paths.track()}>Track order</Link></li>
          <li><Link className={link} href={paths.contact()}>Contact us</Link></li>
          <li><Link className={link} href={paths.login()}>Login</Link></li>
        </ul>
        <ul className="mt-4 flex gap-2" aria-label="Social media">
          {(["instagram", "facebook", "youtube"] as const).filter((b) => social[b]).map((b) => (
            <li key={b}>
              <a href={social[b]} target="_blank" rel="noopener noreferrer" aria-label={`${site.name} on ${b}`} className="inline-flex h-11 w-11 items-center justify-center rounded-md hover:bg-secondary/60">
                <SocialIcon brand={b} />
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </Drawer>
  );
}
