"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleHelp, KeyRound, LogOut } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { paths } from "@/lib/utils/paths";
import { ACCOUNT_LINKS } from "./AccountMenu";

const link =
  "flex min-h-11 items-center gap-3 rounded-md px-3 text-base text-text hover:bg-secondary/60 focus-visible:outline-none focus-visible:shadow-focus";

const EXTRA = [
  { href: "/account/password", label: "Change password", icon: KeyRound },
  { href: paths.faq(), label: "Help & FAQ", icon: CircleHelp },
] as const;

/** My account sidebar (desktop) / link list (mobile): orders, profile, addresses, password, help, sign out. */
export function AccountNav({ name, email }: { name: string; email: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label="My account" className="flex flex-col gap-3">
      <div className="rounded-lg border border-border bg-surface p-4">
        <p className="text-sm text-text-muted">Hello,</p>
        <p className="truncate font-heading text-lg font-semibold">{name || "Shopper"}</p>
        <p className="truncate text-sm text-text-muted">{email}</p>
      </div>
      <ul className="flex flex-col rounded-lg border border-border bg-surface p-2">
        {[...ACCOUNT_LINKS, ...EXTRA].map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <li key={href}>
              <Link href={href} aria-current={active ? "page" : undefined} className={cn(link, active && "bg-secondary font-semibold")}>
                <Icon aria-hidden className="h-5 w-5 text-text-muted" />
                {label}
              </Link>
            </li>
          );
        })}
        <li className="mt-1 border-t border-border pt-1">
          <form method="post" action="/auth/signout">
            <button type="submit" className={cn(link, "w-full")}>
              <LogOut aria-hidden className="h-5 w-5 text-text-muted" />
              Sign out
            </button>
          </form>
        </li>
      </ul>
    </nav>
  );
}
