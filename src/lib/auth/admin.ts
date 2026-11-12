import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { config, isSupabaseConfigured } from "@/lib/config";
import { svc } from "@/lib/data/supabase-clients";
import { paths } from "@/lib/utils/paths";

export type AdminUser = { id: string; email: string; mode: "supabase" | "dev" };

/**
 * Admin sign-in is available when Supabase is configured. Without it, development builds get a
 * local "dev admin" so the panel can be used with seed data; production builds get no access.
 */
export const devAdminBypass = !isSupabaseConfigured && process.env.NODE_ENV !== "production";
export const adminAuthAvailable = isSupabaseConfigured || devAdminBypass;

/** Cookie-bound Supabase client (anon key + the visitor's session). */
export async function supabaseAuthClient() {
  const jar = await cookies();
  return createServerClient(config.supabase.url!, config.supabase.anonKey!, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => jar.set(name, value, options));
        } catch {
          /* called from a Server Component: middleware refreshes cookies instead */
        }
      },
    },
  });
}

/** Whether a Supabase user id is listed in public.admins. */
export async function isAdminUser(userId: string): Promise<boolean> {
  const { data, error } = await svc().from("admins").select("user_id").eq("user_id", userId).maybeSingle();
  if (error) throw new Error(`Admin lookup failed: ${error.message}`);
  return Boolean(data);
}

/** Current admin, or null. Uses getUser() (verified with Supabase), never the unverified session. */
export async function getAdmin(): Promise<AdminUser | null> {
  if (devAdminBypass) return { id: "dev", email: "dev-admin@localhost", mode: "dev" };
  if (!isSupabaseConfigured) return null;
  const supabase = await supabaseAuthClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user || !(await isAdminUser(data.user.id))) return null;
  return { id: data.user.id, email: data.user.email ?? "", mode: "supabase" };
}

/** Guard for admin pages and server actions. */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdmin();
  if (!admin) redirect(paths.admin("/login"));
  return admin;
}
