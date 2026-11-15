import "server-only";
import { isSupabaseConfigured } from "@/lib/config";
import { svc } from "@/lib/data/supabase-clients";

/**
 * Sign-in rate limiting: after MAX_FAILURES failed attempts for the same key (account) within the
 * window, further attempts are refused until the window passes. A per-IP cap stops one source from
 * trying many accounts. Stored in public.auth_attempts (in memory in mock mode).
 */
export const WINDOW_MIN = 15;
export const MAX_FAILURES = 5;
export const MAX_IP_FAILURES = 20;

type Attempt = { key: string; ipHash: string; success: boolean; at: number };
const g = globalThis as unknown as { __cityAttempts?: Attempt[] };
const memory = (g.__cityAttempts ??= []);

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Hashed client IP (never stored raw) from Cloudflare / proxy headers. */
export async function clientIpHash(headers: Headers): Promise<string> {
  const ip = headers.get("cf-connecting-ip") ?? headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  return sha256(`city-seller:${ip}`);
}

export async function isLocked(key: string, ipHash: string, now = Date.now()): Promise<boolean> {
  const since = now - WINDOW_MIN * 60_000;
  if (!isSupabaseConfigured) {
    const recent = memory.filter((a) => !a.success && a.at >= since);
    return recent.filter((a) => a.key === key).length >= MAX_FAILURES || recent.filter((a) => a.ipHash === ipHash).length >= MAX_IP_FAILURES;
  }
  const iso = new Date(since).toISOString();
  const [byKey, byIp] = await Promise.all([
    svc().from("auth_attempts").select("id", { count: "exact", head: true }).eq("key", key).eq("success", false).gte("created_at", iso),
    svc().from("auth_attempts").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).eq("success", false).gte("created_at", iso),
  ]);
  if (byKey.error || byIp.error) {
    console.error("[rate-limit] check failed", byKey.error ?? byIp.error);
    return false;
  }
  return (byKey.count ?? 0) >= MAX_FAILURES || (byIp.count ?? 0) >= MAX_IP_FAILURES;
}

export async function recordAttempt(key: string, ipHash: string, success: boolean): Promise<void> {
  if (!isSupabaseConfigured) {
    memory.push({ key, ipHash, success, at: Date.now() });
    if (memory.length > 5000) memory.splice(0, memory.length - 5000);
    return;
  }
  const { error } = await svc().from("auth_attempts").insert({ key, ip_hash: ipHash, success });
  if (error) console.error("[rate-limit] record failed", error.message);
}
