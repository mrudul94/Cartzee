"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, House, LayoutGrid, ShoppingCart, UserRound, type LucideIcon } from "lucide-react";
import { useSettings } from "@/components/layout/SettingsProvider";
import { cartTotals, useCart } from "@/hooks/useCart";
import { useHydrated } from "@/hooks/useHydrated";
import { useWishlist } from "@/hooks/useWishlist";
import { cn } from "@/lib/utils/cn";

const tab = "flex flex-1 flex-col items-center justify-center gap-1 py-1 text-xs font-medium focus-visible:outline-none";

/** Icon inside a soft pill when active (the current section), plain otherwise. */
function TabIcon({ icon: Icon, active, badge }: { icon: LucideIcon; active: boolean; badge?: number }) {
  return (
    <span
      className={cn(
        "relative inline-flex h-8 w-14 items-center justify-center rounded-full transition-colors duration-fast",
        active ? "bg-primary-soft text-primary" : "text-text-muted",
      )}
    >
      <Icon aria-hidden className="h-6 w-6" strokeWidth={active ? 2.5 : 2} />
      {badge ? (
        <span className="absolute -top-1 right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-text-inverse">
          {badge}
        </span>
      ) : null}
    </span>
  );
}

/**
 * App-style floating bottom bar on phones: Home, Categories, Wishlist, Account, Cart (opens the cart drawer).
 * Rounded and lifted off the screen edge; the current section sits in a highlighted pill.
 */
export function MobileTabBar() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const { delivery } = useSettings();
  const items = useCart((s) => s.items);
  const openCart = useCart((s) => s.open);
  const isOpen = useCart((s) => s.isOpen);
  const count = hydrated ? cartTotals(items, delivery).count : 0;
  const saved = useWishlist((s) => s.slugs.length);

  const links = [
    { href: "/", label: "Home", icon: House, active: pathname === "/" },
    { href: "/categories", label: "Categories", icon: LayoutGrid, active: pathname === "/categories" },
    { href: "/wishlist", label: "Wishlist", icon: Heart, active: pathname === "/wishlist", badge: hydrated ? saved : 0 },
    { href: "/account", label: "Account", icon: UserRound, active: pathname.startsWith("/account") || pathname === "/login" },
  ];
  const cartActive = isOpen || pathname === "/cart";

  return (
    <nav
      aria-label="Shortcuts"
      className="fixed inset-x-2 bottom-2 z-sticky flex rounded-xl border border-border bg-surface px-1 py-1 shadow-lg md:hidden"
    >
      {links.map(({ href, label, icon, active, badge }) => (
        <Link
          key={href}
          href={href}
          aria-current={active ? "page" : undefined}
          className={cn(tab, "rounded-lg focus-visible:shadow-focus", active ? "font-semibold text-primary" : "text-text-muted")}
        >
          <TabIcon icon={icon} active={active} badge={badge} />
          {label}
        </Link>
      ))}
      <button
        type="button"
        onClick={openCart}
        className={cn(tab, "rounded-lg focus-visible:shadow-focus", cartActive ? "font-semibold text-primary" : "text-text-muted")}
        aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
      >
        <TabIcon icon={ShoppingCart} active={cartActive} badge={count} />
        Cart
      </button>
    </nav>
  );
}
