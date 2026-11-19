import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ADMIN_AUTH_COOKIE } from "./lib/auth/cookie-name";
import { isAccessConfigured, verifyAccessToken } from "@/lib/auth/cf-access";

/**
 * Admin website (admin.cartzee.in):
 *  • Cloudflare Access: when configured, every request must carry a valid Access token, so requests
 *    that bypass Cloudflare are refused.
 *  • Refreshes the Supabase session cookie (Server Components can't set cookies).
 * Authorisation itself (admin, email code, permissions) is enforced server-side in lib/auth/admin.ts.
 * Security headers (noindex, no-store, no framing) are set for every route in next.config.ts.
 */
export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === "/robots.txt") {
    return new NextResponse("User-agent: *\nDisallow: /\n", { headers: { "Content-Type": "text/plain" } });
  }
  if (isAccessConfigured()) {
    const token = req.headers.get("cf-access-jwt-assertion") ?? req.cookies.get("CF_Authorization")?.value;
    if (!(await verifyAccessToken(token))) return new NextResponse("Access denied", { status: 403 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  let res = NextResponse.next({ request: req });
  if (!url || !anon) return res;
  const supabase = createServerClient(url, anon, {
    cookieOptions: ADMIN_AUTH_COOKIE,
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
