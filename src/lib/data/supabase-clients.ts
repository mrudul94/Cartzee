import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { config } from "@/lib/config";

const opts = { auth: { persistSession: false, autoRefreshToken: false } } as const;
let publicClient: SupabaseClient | undefined;
let serviceClient: SupabaseClient | undefined;

/** Anon key: catalogue reads, governed by RLS + column grants (no supplier data). */
export const pub = () => (publicClient ??= createClient(config.supabase.url!, config.supabase.anonKey!, opts));

/** Service role: orders, customers, admin writes. Server-only; bypasses RLS. */
export const svc = () => (serviceClient ??= createClient(config.supabase.url!, config.supabase.serviceRoleKey!, opts));
