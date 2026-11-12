import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isAccessConfigured, verifyAccessToken } from "@/lib/auth/cf-access";

/**
 * Two websites from one deployment:
 *
 *  • Shop  (cityseller.in)        – the storefront. Every /admin URL returns the normal 404 page.
 *  • Admin (admin.cityseller.in)  – only the admin panel, with clean URLs (/orders → app/admin/orders).
 *    Protected by Cloudflare Access (verified here when configured), Supabase sign-in + admins table
 *    (requireAdmin), never indexed, never framed, never cached.
 *
 * Set NEXT_PUBLIC_ADMIN_HOST to the admin hostname. Without it (local dev) the admin stays at /admin.
 */
const ADMIN_HOST = process.env.NEXT_PUBLIC_ADMIN_HOST?.trim().toLowerCase() || undefined;
const SITE_HOST = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "").hostname.toLowerCase() || undefined;
  } catch {
    return undefined;
  }
})();

const ADMIN_HEADERS: Record<string, string> = {
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "Cache-Control": "private, no-store",
  "X-Frame-Options": "DENY",
  "Content-Security-Policy": "frame-ancestors 'none'",
  "Referrer-Policy": "no-referrer",
};

const isAdminPath = (p: string) => p === "/admin" || p.startsWith("/admin/");

function hostOf(req: NextRequest) {
  return (req.headers.get("host") ?? req.nextUrl.host).split(":")[0]!.toLowerCase();
}

/** Refreshes the Supabase session cookie (Server Components can't set cookies), then builds the response. */
async function withSession(req: NextRequest, build: () => NextResponse): Promise<NextResponse> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return build();
  const pending: { name: string; value: string; options?: Parameters<NextResponse["cookies"]["set"]>[2] }[] = [];
  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => req.cookies.set(name, value));
        pending.push(...list);
      },
    },
  });
  await supabase.auth.getUser();
  const res = build();
  pending.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
  return res;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Local development / single-host mode: admin lives under /admin.
  if (!ADMIN_HOST) {
    return isAdminPath(pathname) ? withSession(req, () => NextResponse.next({ request: req })) : NextResponse.next();
  }

  // ---------------------------------------------------------------- admin website
  if (hostOf(req) === ADMIN_HOST) {
    if (pathname === "/robots.txt") {
      return new NextResponse("User-agent: *\nDisallow: /\n", { headers: { "Content-Type": "text/plain", ...ADMIN_HEADERS } });
    }
    if (isAccessConfigured()) {
      const token = req.headers.get("cf-access-jwt-assertion") ?? req.cookies.get("CF_Authorization")?.value;
      if (!(await verifyAccessToken(token))) {
        return new NextResponse("Access denied", { status: 403, headers: ADMIN_HEADERS });
      }
    }
    // The shop's APIs and pages don't exist on the admin website.
    if (pathname.startsWith("/api/")) return new NextResponse("Not found", { status: 404, headers: ADMIN_HEADERS });
    // Canonical clean URLs: admin.cityseller.in/admin/orders → /orders
    if (isAdminPath(pathname)) {
      const clean = req.nextUrl.clone();
      clean.pathname = pathname.slice("/admin".length) || "/";
      return NextResponse.redirect(clean, 308);
    }
    const target = req.nextUrl.clone();
    target.pathname = pathname === "/" ? "/admin" : `/admin${pathname}`;
    const res = await withSession(req, () => NextResponse.rewrite(target, { request: req }));
    Object.entries(ADMIN_HEADERS).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  }

  // ---------------------------------------------------------------- shop website
  // One canonical shop host: www.cityseller.in/… → cityseller.in/…
  if (SITE_HOST && hostOf(req) === `www.${SITE_HOST}`) {
    const canonical = req.nextUrl.clone();
    canonical.host = SITE_HOST;
    canonical.port = "";
    canonical.protocol = "https:";
    return NextResponse.redirect(canonical, 301);
  }
  if (isAdminPath(pathname)) {
    // Render the shop's normal 404 (no hint that an admin exists).
    const notFound = req.nextUrl.clone();
    notFound.pathname = "/404";
    return NextResponse.rewrite(notFound, { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  // Everything except build assets and public files (images/placeholders are public on both hosts).
  matcher: ["/((?!_next/static|_next/image|placeholders/|icon.svg|favicon.ico).*)"],
};
