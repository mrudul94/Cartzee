"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { BookOpen, ExternalLink, FileText, FolderTree, Home, LayoutDashboard, LogOut, MessageSquare, Package, Settings, ShoppingCart, Users } from "lucide-react";
import { hasPermission, type AdminRole, type Permission } from "@/lib/auth/permissions";
import { Logo } from "@/components/layout/Logo";
import { cn } from "@/lib/utils/cn";
import { paths } from "@/lib/utils/paths";

type NavItem = { href: string; label: string; icon: typeof Home; exact?: boolean; need?: Permission | "super" };
const NAV: NavItem[] = [
  { href: paths.admin(), label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: paths.admin("/orders"), label: "Orders", icon: ShoppingCart, need: "orders" },
  { href: paths.admin("/products"), label: "Products", icon: Package, need: "products" },
  { href: paths.admin("/content/home"), label: "Homepage", icon: Home, need: "content" },
  { href: paths.admin("/categories"), label: "Categories", icon: FolderTree, need: "content" },
  { href: paths.admin("/guides"), label: "Guides", icon: BookOpen, need: "content" },
  { href: paths.admin("/content/pages"), label: "Pages", icon: FileText, need: "content" },
  { href: paths.admin("/reviews"), label: "Reviews", icon: MessageSquare, need: "reviews" },
  { href: paths.admin("/settings"), label: "Settings", icon: Settings, need: "settings" },
  { href: paths.admin("/team"), label: "Team", icon: Users, need: "super" },
];
// The style guide stays available at /design-system (for developers) but is not in the menu.

export type AdminShellProps = {
  email: string;
  /** Menu shows only the areas this admin may use. */
  role?: AdminRole;
  permissions?: Permission[];
  devMode?: boolean;
  /** Email sign-in code paused for testing (ADMIN_EMAIL_CODE=off). */
  codePaused?: boolean;
  /** Count shown on the Orders link (paid orders waiting to be placed). */
  pendingCount?: number;
  signOut?: () => Promise<void>;
  children: ReactNode;
};

/** Admin layout: sidebar on desktop, scrolling top nav on mobile, sign-out, dev-mode banner. */
export function AdminShell({ email, role = "super_admin", permissions = [], devMode = false, codePaused = false, pendingCount = 0, signOut, children }: AdminShellProps) {
  const pathname = usePathname();
  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));

  const allowed = NAV.filter((n) => !n.need || (n.need === "super" ? role === "super_admin" : hasPermission({ role, permissions }, n.need)));
  const links = allowed.map(({ href, label, icon: Glyph, exact }) => (
    <li key={href} className="shrink-0">
      <Link
        href={href}
        aria-current={isActive(href, exact) ? "page" : undefined}
        className={cn(
          "flex min-h-11 items-center gap-3 rounded-md px-3 text-base font-medium focus-visible:outline-none focus-visible:shadow-focus",
          isActive(href, exact) ? "bg-ink text-text-inverse" : "text-text hover:bg-secondary/60",
        )}
      >
        <Glyph aria-hidden className="h-5 w-5" />
        {label}
        {href === paths.admin("/orders") && pendingCount > 0 && (
          <span className="ml-auto rounded-full bg-primary px-2 text-xs font-bold text-text-inverse" aria-label={`${pendingCount} to place`}>
            {pendingCount}
          </span>
        )}
      </Link>
    </li>
  ));

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-5 xl:grid-cols-6">
      <aside className="border-b border-border bg-surface lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <Logo />
          <span className="rounded-sm bg-secondary px-2 py-0.5 text-xs font-semibold uppercase tracking-wide">Admin</span>
        </div>
        <nav aria-label="Admin">
          <ul className="flex gap-1 overflow-x-auto px-4 pb-3 lg:flex-col lg:overflow-visible">{links}</ul>
        </nav>
        <div className="hidden flex-col gap-1 border-t border-border px-4 py-3 lg:flex">
          <Link href="/" target="_blank" className="flex min-h-11 items-center gap-3 rounded-md px-3 text-text hover:bg-secondary/60">
            <ExternalLink aria-hidden className="h-5 w-5" /> View store
          </Link>
          <p className="truncate px-3 text-sm text-text-muted" title={email}>
            {email}
          </p>
          {signOut && (
            <form action={signOut}>
              <button type="submit" className="flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-text hover:bg-secondary/60">
                <LogOut aria-hidden className="h-5 w-5" /> Sign out
              </button>
            </form>
          )}
        </div>
      </aside>
      <div className="lg:col-span-4 xl:col-span-5">
        {devMode && (
          <p role="note" className="bg-warning-soft px-4 py-2 text-sm text-warning">
            Development mode: Supabase is not configured, so the admin panel is open without sign-in and edits are kept in memory.
          </p>
        )}
        {codePaused && (
          <p role="alert" className="bg-error-soft px-4 py-2 text-sm text-error">
            Two-step sign-in is paused for testing: admins sign in with a password only. Remove ADMIN_EMAIL_CODE=off before launch.
          </p>
        )}
        <main id="main" className="mx-auto max-w-container px-4 py-6 md:px-6 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
