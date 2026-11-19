import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { config, isSupabaseConfigured } from "@/lib/config";
import { svc } from "@/lib/data/supabase-clients";
import { ADMIN_AUTH_COOKIE } from "./cookie-name";
import { emailCodePaused, isSessionVerified } from "./email-code";
import { ALL_PERMISSIONS, hasPermission, type AdminRole, type Permission } from "./permissions";

export { ALL_PERMISSIONS, hasPermission, PERMISSION_LABELS, type AdminRole, type Permission } from "./permissions";

export type AdminUser = {
  id: string;
  email: string;
  role: AdminRole;
  permissions: Permission[];
  mode: "supabase" | "dev";
};

/**
 * Admin sign-in is available when Supabase is configured. Without it, development builds get a
 * local "dev admin" (Super Admin) so the panel can be used with seed data; production gets no access.
 */
export const devAdminBypass = !isSupabaseConfigured && process.env.NODE_ENV !== "production";
export const adminAuthAvailable = isSupabaseConfigured || devAdminBypass;

/** Cookie-bound Supabase client (anon key + the visitor's session). Session cookies are HttpOnly + Secure + SameSite=Lax. */
export async function supabaseAuthClient() {
  const jar = await cookies();
  return createServerClient(config.supabase.url!, config.supabase.anonKey!, {
    cookieOptions: ADMIN_AUTH_COOKIE,
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => jar.set(name, value, { ...options, httpOnly: true, secure: true, sameSite: "lax" }));
        } catch {
          /* called from a Server Component: middleware refreshes cookies instead */
        }
      },
    },
  });
}

type AdminRow = { user_id: string; role: AdminRole; permissions: Permission[] };

/** The admins-table row for a user (role + permissions), or null if they are not an admin. */
export async function adminRow(userId: string): Promise<AdminRow | null> {
  const { data, error } = await svc().from("admins").select("user_id, role, permissions").eq("user_id", userId).maybeSingle();
  if (error) throw new Error(`Admin lookup failed: ${error.message}`);
  return (data as AdminRow | null) ?? null;
}

export async function isAdminUser(userId: string): Promise<boolean> {
  return Boolean(await adminRow(userId));
}

export type SessionState =
  | { state: "signed-out" }
  | { state: "not-admin"; userId: string }
  | { state: "needs-mfa"; userId: string; email: string; sessionId: string }
  | { state: "ok"; admin: AdminUser };

/**
 * Verified session state. Uses getUser() (checked with Supabase, never the unverified cookie) and
 * requires the emailed sign-in code to have been entered for this login session.
 */
export const getSessionState = cache(async (): Promise<SessionState> => {
  if (devAdminBypass) return { state: "ok", admin: { id: "dev", email: "dev-admin@localhost", role: "super_admin", permissions: [...ALL_PERMISSIONS], mode: "dev" } };
  if (!isSupabaseConfigured) return { state: "signed-out" };
  const supabase = await supabaseAuthClient();
  // Independent checks run together (each is a round trip to Supabase): 2 waits instead of 4.
  const [{ data }, claims] = await Promise.all([supabase.auth.getUser(), supabase.auth.getClaims()]);
  if (!data.user) return { state: "signed-out" };
  const sessionId = claims.data?.claims.session_id;
  if (typeof sessionId !== "string" || claims.data?.claims.sub !== data.user.id) return { state: "signed-out" };
  const [row, verified] = await Promise.all([adminRow(data.user.id), emailCodePaused() ? Promise.resolve(true) : isSessionVerified(sessionId)]);
  if (!row) return { state: "not-admin", userId: data.user.id };
  if (!verified) return { state: "needs-mfa", userId: data.user.id, email: data.user.email ?? "", sessionId };
  return { state: "ok", admin: { id: data.user.id, email: data.user.email ?? "", role: row.role, permissions: row.permissions ?? [], mode: "supabase" } };
});

/** Current fully signed-in admin, or null. */
export async function getAdmin(): Promise<AdminUser | null> {
  const s = await getSessionState();
  return s.state === "ok" ? s.admin : null;
}

/** Guard for admin pages and server actions: signed in, an admin, and email-code verified. */
export async function requireAdmin(): Promise<AdminUser> {
  const s = await getSessionState();
  if (s.state === "ok") return s.admin;
  if (s.state === "needs-mfa") redirect("/mfa");
  redirect("/login");
}

/** Guard for a feature area. Super Admins have every permission. */
export async function requirePermission(permission: Permission): Promise<AdminUser> {
  const admin = await requireAdmin();
  if (!hasPermission(admin, permission)) redirect("/?denied=" + permission);
  return admin;
}

/** Guard for team management (Super Admin only). */
export async function requireSuperAdmin(): Promise<AdminUser> {
  const admin = await requireAdmin();
  if (admin.role !== "super_admin") redirect("/?denied=team");
  return admin;
}
