import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/** Shop website: one canonical host (www.cityseller.in/… → cityseller.in/…). The admin is a separate app. */
const SITE_HOST = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "").hostname.toLowerCase() || undefined;
  } catch {
    return undefined;
  }
})();

/** Only these paths read the shopper session, so the rest of the shop stays fast and cacheable. */
const AUTH_PATHS = ["/login", "/account", "/checkout", "/api/checkout", "/auth/"];

export async function middleware(req: NextRequest) {
  const host = (req.headers.get("host") ?? req.nextUrl.host).split(":")[0]!.toLowerCase();
  if (SITE_HOST && host === `www.${SITE_HOST}`) {
    const canonical = req.nextUrl.clone();
    canonical.host = SITE_HOST;
    canonical.port = "";
    canonical.protocol = "https:";
    return NextResponse.redirect(canonical, 301);
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon || !AUTH_PATHS.some((p) => req.nextUrl.pathname.startsWith(p))) return NextResponse.next();
  // Refresh the shopper's session cookie (Server Components can't set cookies).
  let res = NextResponse.next({ request: req });
  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, { ...options, httpOnly: true, secure: true, sameSite: "lax" }));
      },
    },
  });
  await supabase.auth.getUser();
  return res;
}

export const config = { matcher: ["/((?!_next/static|_next/image|logo/|icon.png|apple-icon.png|favicon.ico).*)"] };
