import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { config, isSupabaseConfigured } from "@/lib/config";

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
  if (!data.user) return null;
  const name = typeof data.user.user_metadata?.name === "string" ? data.user.user_metadata.name : "";
  return { id: data.user.id, email: data.user.email ?? "", name };
}

/** Only allow same-site relative redirects after sign-in (prevents open redirects). */
export function safeNext(next: unknown, fallback = "/account"): string {
  const n = typeof next === "string" ? next : "";
  return n.startsWith("/") && !n.startsWith("//") && !n.startsWith("/\\") ? n : fallback;
}
