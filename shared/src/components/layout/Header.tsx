import Link from "next/link";
import { AccountMenu } from "@/components/account/AccountMenu";
import { CartButton } from "@/components/commerce/CartButton";
import { WishlistLink } from "@/components/commerce/WishlistLink";
import { SearchBox } from "@/components/commerce/SearchBox";
import type { Settings } from "@/lib/content/schema";
import { paths } from "@/lib/utils/paths";
import { CategoryStrip } from "./CategoryStrip";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { BudgetMenu, CategoryNav, MoreMenu, type NavCategory } from "./MegaMenu";
import { MobileNav } from "./MobileNav";

const navLink =
  "inline-flex min-h-11 items-center whitespace-nowrap rounded-md px-3 text-base font-medium text-text hover:bg-secondary/60 focus-visible:outline-none focus-visible:shadow-focus";

/**
 * Sticky site header: logo, search, account, cart (+count); desktop category bar with hover menus, and on
 * phones/tablets a sideways category strip.
 */
export function Header({ tree, settings }: { tree: NavCategory[]; settings: Settings }) {
  return (
    <header className="sticky top-0 z-sticky border-b border-border bg-surface">
      <Container className="flex items-center gap-2 py-2 md:gap-4">
        <MobileNav tree={tree} social={settings.social} />
        <Logo />
        <SearchBox className="mx-auto hidden max-w-narrow md:block" />
        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <AccountMenu />
          <span className="hidden md:block">
            <WishlistLink />
          </span>
          <CartButton />
        </div>
      </Container>
      <Container className="pb-2 md:hidden">
        <SearchBox id="site-search-mobile" size="sm" />
      </Container>
      <CategoryStrip tree={tree} />
      <nav aria-label="Main" className="hidden border-t border-border lg:block">
        <Container className="flex items-center gap-1 py-1">
          <Link href="/categories" className={navLink}>
            All categories
          </Link>
          <BudgetMenu />
          <CategoryNav tree={tree} />
          <div className="ml-auto flex items-center gap-1">
            <Link href={paths.flashSale()} className={navLink}>
              Flash Sale
            </Link>
            <MoreMenu />
          </div>
        </Container>
      </nav>
    </header>
  );
}
