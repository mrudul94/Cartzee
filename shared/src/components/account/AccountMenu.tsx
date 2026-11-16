"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, LogOut, MapPin, Package, Truck, UserRound } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { paths } from "@/lib/utils/paths";

type Me = { name: string } | null;

const trigger =
  "inline-flex h-11 items-center gap-1 rounded-md px-2 text-text hover:bg-secondary/60 focus-visible:outline-none focus-visible:shadow-focus";
const item = "flex min-h-11 items-center gap-3 rounded-md px-3 text-base text-text hover:bg-secondary/60 focus-visible:outline-none focus-visible:shadow-focus";

export const ACCOUNT_LINKS = [
  { href: "/account", label: "My orders", icon: Package },
  { href: "/account/profile", label: "Profile", icon: UserRound },
  { href: "/account/addresses", label: "Saved addresses", icon: MapPin },
  { href: paths.track(), label: "Track an order", icon: Truck },
] as const;

/**
 * Header account control. Pages are cached for everyone, so the signed-in state is fetched in the
 * browser: "Login" when signed out, "Hi, <name> ▾" with account links and Sign out when signed in.
 */
export function AccountMenu({ className }: { className?: string }) {
  const [me, setMe] = useState<Me | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Ask the server only while signed out (to notice a sign-in) and on account pages (name may change).
  const signedIn = Boolean(me);
  const recheck = !signedIn || pathname.startsWith("/account");
  useEffect(() => {
    if (!recheck) return;
    let live = true;
    fetch("/api/account/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { name?: string; signedIn?: boolean } | null) => live && setMe(d?.signedIn ? { name: d.name ?? "" } : null))
      .catch(() => live && setMe(null));
    return () => {
      live = false;
    };
  }, [pathname, recheck]);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!me) {
    return (
      <Link href={paths.signIn()} className={cn(trigger, className)} aria-label={me === undefined ? "Account" : "Login"}>
        <UserRound aria-hidden className="h-6 w-6" />
        <span className="hidden text-base font-medium md:inline">Login</span>
      </Link>
    );
  }

  const first = me.name.split(" ")[0] || "Account";
  return (
    <div ref={root} className={cn("relative", className)} onBlur={(e) => !root.current?.contains(e.relatedTarget as Node) && setOpen(false)}>
      <button type="button" className={trigger} aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
        <UserRound aria-hidden className="h-6 w-6" />
        <span className="hidden max-w-32 truncate text-base font-medium md:inline">Hi, {first}</span>
        <span className="sr-only md:hidden">Your account</span>
        <ChevronDown aria-hidden className={cn("hidden h-4 w-4 transition-transform duration-fast md:block", open && "rotate-180")} />
      </button>
      <div id={id} hidden={!open} className="absolute right-0 top-full z-dropdown mt-1 w-64 rounded-md border border-border bg-surface p-2 shadow-lg">
        <p className="px-3 pb-2 pt-1 text-sm text-text-muted">Your account</p>
        <ul className="flex flex-col">
          {ACCOUNT_LINKS.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link href={href} className={item}>
                <Icon aria-hidden className="h-5 w-5 text-text-muted" />
                {label}
              </Link>
            </li>
          ))}
          <li className="mt-1 border-t border-border pt-1">
            <form method="post" action="/auth/signout">
              <button type="submit" className={cn(item, "w-full")}>
                <LogOut aria-hidden className="h-5 w-5 text-text-muted" />
                Sign out
              </button>
            </form>
          </li>
        </ul>
      </div>
    </div>
  );
}
