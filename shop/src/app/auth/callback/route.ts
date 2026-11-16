import { NextResponse } from "next/server";
import { customerClient, isAdminAccount, safeNext } from "@/lib/customer";

/**
 * Email links (confirm account, reset password) land here: exchange the one-time code for a session.
 * Admin accounts never get a shop session (their passwords are managed in the admin app only).
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next"));
  if (code) {
    const supabase = await customerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user && (await isAdminAccount(data.user.id))) {
      await supabase.auth.signOut({ scope: "local" });
      return NextResponse.redirect(new URL("/login?error=admin", url.origin));
    }
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }
  return NextResponse.redirect(new URL("/login?error=link", url.origin));
}
