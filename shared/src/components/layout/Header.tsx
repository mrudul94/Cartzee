import Link from "next/link";
import { AccountMenu } from "@/components/account/AccountMenu";
import { CartButton } from "@/components/commerce/CartButton";
import { SearchBox } from "@/components/commerce/SearchBox";
import type { Settings } from "@/lib/content/schema";
import { paths } from "@/lib/utils/paths";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { BudgetMenu, MegaMenu, type NavCategory } from "./MegaMenu";
import { MobileNav } from "./MobileNav";

const navLink =
  "inline-flex min-h-11 items-center rounded-md px-3 text-base font-medium text-text hover:bg-secondary/60 focus-visible:outline-none focus-visible:shadow-focus";

/** Sticky site header: logo, search, account, cart (+count), and desktop navigation row. */
export function Header({ tree, settings }: { tree: NavCategory[]; settings: Settings }) {
  return (
    <header className="sticky top-0 z-sticky border-b border-border bg-surface">
      <Container className="flex items-center gap-2 py-2 md:gap-4">
        <MobileNav tree={tree} social={settings.social} />
        <Logo />
        <SearchBox className="mx-auto hidden max-w-narrow md:block" />
        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <AccountMenu />
          <CartButton />
        </div>
      </Container>
      <Container className="pb-2 md:hidden">
        <SearchBox id="site-search-mobile" size="sm" />
      </Container>
      <nav aria-label="Main" className="hidden border-t border-border lg:block">
        <Container className="flex items-center gap-1 py-1">
          <Link href={paths.flashSale()} className={`${navLink} text-primary`}>
            Flash Sale
          </Link>
          <MegaMenu tree={tree} />
          <BudgetMenu />
          <Link href={paths.newArrivals()} className={navLink}>
            New arrivals
          </Link>
          <Link href={paths.bestsellers()} className={navLink}>
            Bestsellers
          </Link>
          {tree.slice(0, 2).map((c) => (
            <Link key={c.slug} href={`/${c.slug}`} className={navLink}>
              {c.name}
            </Link>
          ))}
          <Link href={paths.guides()} className={`${navLink} ml-auto`}>
            Guides
          </Link>
        </Container>
      </nav>
    </header>
  );
}
