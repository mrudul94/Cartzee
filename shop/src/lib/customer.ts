import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { config, isSupabaseConfigured } from "@/lib/config";
import { svc } from "@/lib/data/supabase-clients";

/**
 * Shopper accounts (Supabase Auth, email + password). Browsing never needs an account;
 * placing an order does. Customer sessions live in HttpOnly cookies on the shop domain only and
 * grant no admin access (admin access is the separate admins table + admin app).
 * Without Supabase (local mock mode) accounts are off and checkout works as a guest.
 */
export const customerAuthEnabled = isSupabaseConfigured;

export type Customer = { id: string; email: string; name: string };

export async function customerClient() {
  const jar = await cookies();
  return createServerClient(config.supabase.url!, config.supabase.anonKey!, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => jar.set(name, value, { ...options, httpOnly: true, secure: true, sameSite: "lax" }));
        } catch {
          /* Server Component: middleware refreshes cookies */
        }
      },
    },
  });
}

/** Signed-in shopper (verified with Supabase), or null. */
export async function getCustomer(): Promise<Customer | null> {
  if (!customerAuthEnabled) return null;
  const { data } = await (await customerClient()).auth.getUser();
  if (!data.user || (await isAdminAccount(data.user.id))) return null;
  const name = typeof data.user.user_metadata?.name === "string" ? data.user.user_metadata.name : "";
  return { id: data.user.id, email: data.user.email ?? "", name };
}

/** Admin accounts are kept out of the shop: they can't sign in or order as customers. */
export async function isAdminAccount(userId: string): Promise<boolean> {
  const { data, error } = await svc().from("admins").select("user_id").eq("user_id", userId).maybeSingle();
  if (error) throw new Error(`Account check failed: ${error.message}`);
  return Boolean(data);
}

/** Only allow same-site relative redirects after sign-in (prevents open redirects). */
export function safeNext(next: unknown, fallback = "/account"): string {
  const n = typeof next === "string" ? next : "";
  return n.startsWith("/") && !n.startsWith("//") && !n.startsWith("/\\") ? n : fallback;
}
