import "server-only";
import { isSupabaseConfigured } from "@/lib/config";
import { svc } from "@/lib/data/supabase-clients";

/**
 * Site health: crash/error logs and "visitors now" (Admin → Site logs).
 * Writes never throw: logging must not break the page or request that is being logged.
 * Without Supabase (local mock mode) entries are kept in memory.
 */

export type LogLevel = "error" | "warn" | "info";
export type LogSource = "server" | "browser";
export type SiteLog = { id: number; at: string; level: LogLevel; source: LogSource; path: string; message: string; detail: string; userAgent: string };
export type LogInput = { level: LogLevel; source: LogSource; path?: string; message: string; detail?: string; userAgent?: string; ipHash?: string };

/** A browser tab counts as "on the site now" if it pinged within this window (tabs ping every 60 s while visible). */
export const PRESENCE_WINDOW_MS = 2 * 60_000;
/** Error reports allowed per visitor (hashed IP) per 10 minutes: stops one browser flooding the log. */
export const MAX_REPORTS_PER_IP = 20;
const LOG_RETENTION_DAYS = 30;

const cut = (s: string | undefined, n: number) => (s ?? "").slice(0, n);

type Mem = { logs: SiteLog[]; presence: Map<string, { path: string; at: number }> };
const g = globalThis as unknown as { __cartzeeSiteLog?: Mem };
const mem: Mem = (g.__cartzeeSiteLog ??= { logs: [], presence: new Map() } as Mem);

export async function recordLog(input: LogInput): Promise<void> {
  const row = {
    level: input.level,
    source: input.source,
    path: cut(input.path, 500),
    message: cut(input.message, 1000) || "(no message)",
    detail: cut(input.detail, 8000),
    user_agent: cut(input.userAgent, 300),
    ip_hash: cut(input.ipHash, 64),
  };
  try {
    if (!isSupabaseConfigured) {
      mem.logs.unshift({ id: Date.now() + Math.random(), at: new Date().toISOString(), level: row.level, source: row.source, path: row.path, message: row.message, detail: row.detail, userAgent: row.user_agent });
      mem.logs.length = Math.min(mem.logs.length, 500);
      return;
    }
    const { error } = await svc().from("site_logs").insert(row);
    if (error) console.error("[site-log] insert failed", error.message);
  } catch (e) {
    console.error("[site-log] insert failed", e);
  }
}

/** True when this (hashed) visitor has already sent MAX_REPORTS_PER_IP reports in the last 10 minutes. */
export async function tooManyReports(ipHash: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const since = new Date(Date.now() - 10 * 60_000).toISOString();
  const { count, error } = await svc().from("site_logs").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", since);
  return !error && (count ?? 0) >= MAX_REPORTS_PER_IP;
}

export async function recordPresence(sessionId: string, path: string): Promise<void> {
  try {
    if (!isSupabaseConfigured) {
      mem.presence.set(sessionId, { path: cut(path, 500), at: Date.now() });
      return;
    }
    const { error } = await svc().from("site_presence").upsert({ session_id: sessionId, path: cut(path, 500), last_seen: new Date().toISOString() });
    if (error) console.error("[presence] upsert failed", error.message);
    // Now and then, clear out old rows so both tables stay small (no scheduled job needed).
    if (Math.random() < 0.02) await cleanup();
  } catch (e) {
    console.error("[presence] upsert failed", e);
  }
}

async function cleanup() {
  const day = new Date(Date.now() - 24 * 3600_000).toISOString();
  const old = new Date(Date.now() - LOG_RETENTION_DAYS * 24 * 3600_000).toISOString();
  await Promise.all([svc().from("site_presence").delete().lt("last_seen", day), svc().from("site_logs").delete().lt("created_at", old)]);
}

export type PresenceNow = { total: number; pages: { path: string; count: number }[] };

/** Open browser tabs that pinged in the last PRESENCE_WINDOW_MS, and which pages they are on. */
export async function presenceNow(now = Date.now()): Promise<PresenceNow> {
  const since = now - PRESENCE_WINDOW_MS;
  let rows: { path: string }[];
  if (!isSupabaseConfigured) {
    rows = [...mem.presence.values()].filter((p) => p.at >= since);
  } else {
    const { data, error } = await svc().from("site_presence").select("path").gte("last_seen", new Date(since).toISOString()).limit(5000);
    if (error) throw new Error(`Visitors could not be loaded: ${error.message}`);
    rows = data as { path: string }[];
  }
  const byPath = new Map<string, number>();
  for (const r of rows) byPath.set(r.path || "/", (byPath.get(r.path || "/") ?? 0) + 1);
  const pages = [...byPath].map(([path, count]) => ({ path, count })).sort((a, b) => b.count - a.count).slice(0, 10);
  return { total: rows.length, pages };
}

export type LogFilter = { level?: LogLevel; source?: LogSource; sinceHours?: number; limit?: number };

export async function listLogs({ level, source, sinceHours = 24 * 7, limit = 200 }: LogFilter = {}): Promise<SiteLog[]> {
  const since = new Date(Date.now() - sinceHours * 3600_000).toISOString();
  if (!isSupabaseConfigured) {
    return mem.logs.filter((l) => (!level || l.level === level) && (!source || l.source === source) && l.at >= since).slice(0, limit);
  }
  let q = svc().from("site_logs").select("id, created_at, level, source, path, message, detail, user_agent").gte("created_at", since).order("created_at", { ascending: false }).limit(limit);
  if (level) q = q.eq("level", level);
  if (source) q = q.eq("source", source);
  const { data, error } = await q;
  if (error) throw new Error(`Logs could not be loaded: ${error.message}`);
  return (data as { id: number; created_at: string; level: LogLevel; source: LogSource; path: string; message: string; detail: string; user_agent: string }[]).map((r) => ({
    id: r.id,
    at: r.created_at,
    level: r.level,
    source: r.source,
    path: r.path,
    message: r.message,
    detail: r.detail,
    userAgent: r.user_agent,
  }));
}

/** Error counts for the summary cards: last 24 hours and last 7 days. */
export async function errorCounts(): Promise<{ day: number; week: number }> {
  const at = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();
  if (!isSupabaseConfigured) {
    const errs = mem.logs.filter((l) => l.level === "error");
    return { day: errs.filter((l) => l.at >= at(24)).length, week: errs.filter((l) => l.at >= at(168)).length };
  }
  const count = async (h: number) => {
    const { count: n, error } = await svc().from("site_logs").select("id", { count: "exact", head: true }).eq("level", "error").gte("created_at", at(h));
    if (error) throw new Error(`Logs could not be loaded: ${error.message}`);
    return n ?? 0;
  };
  const [day, week] = await Promise.all([count(24), count(168)]);
  return { day, week };
}
