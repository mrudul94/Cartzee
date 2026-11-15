import "server-only";
import { cache } from "react";
import { CACHE_TAGS, cached } from "@/lib/cache";
import { isSupabaseConfigured } from "@/lib/config";
import {
  defaultFor,
  type ContentKey,
  type HomeContent,
  type PageContent,
  type PageSlug,
  schemaFor,
  type Settings,
} from "@/lib/content/schema";
import type { Faq } from "@/lib/types";
import { store, type ActivityEntry } from "./seed-store";
import { fail } from "./supabase-repo";
import { pub, svc } from "./supabase-clients";

/** Thrown when content fails validation; the message lists the first problem for the admin form. */
export class ContentError extends Error {
  constructor(
    message: string,
    readonly fields: Record<string, string> = {},
  ) {
    super(message);
  }
}

/* ------------------------------------------------------------------ helpers */

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Saved values win; missing object fields fall back to defaults (arrays are replaced, not merged). */
export function mergeDefaults(def: unknown, saved: unknown): unknown {
  if (saved === undefined || saved === null) return def;
  if (isPlainObject(def) && isPlainObject(saved)) {
    const out: Record<string, unknown> = { ...def };
    for (const [k, v] of Object.entries(saved)) out[k] = mergeDefaults(def[k], v);
    return out;
  }
  return saved;
}

/** Validated content for a key: saved value merged over defaults, or the defaults if the saved value is invalid. */
function resolve(key: ContentKey, saved: unknown): unknown {
  const def = defaultFor(key);
  const parsed = schemaFor(key).safeParse(mergeDefaults(def, saved));
  if (parsed.success) return parsed.data;
  console.error(`[content] stored "${key}" is invalid; using defaults`, parsed.error.issues[0]);
  return schemaFor(key).parse(def);
}

/** "sections.2.slides.0.title" → "Section 3, slide 1"; "items.4.a" → "Item 5". */
export function friendlyPath(path: string): string {
  if (!path || path === "form") return "";
  const words: Record<string, string> = { sections: "Section", slides: "slide", banners: "banner", items: "Item", blocks: "Block", paragraphs: "paragraph" };
  const parts = path.split(".");
  const out: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    const word = words[parts[i]!];
    const n = Number(parts[i + 1]);
    if (word && Number.isInteger(n)) {
      out.push(`${out.length ? word : word.charAt(0).toUpperCase() + word.slice(1)} ${n + 1}`);
      i++;
    }
  }
  return out.join(", ");
}

/* ------------------------------------------------------------------ storage */

async function readRaw(key: ContentKey): Promise<unknown> {
  if (!isSupabaseConfigured) return store.content.get(key);
  const { data, error } = await pub().from("site_content").select("value").eq("key", key).maybeSingle();
  if (error) fail(`content ${key}`, error);
  return (data as { value: unknown } | null)?.value;
}

// Supabase reads are cached across requests (tag "content"); mock mode reads memory directly.
const readRawCached = isSupabaseConfigured ? cached(readRaw, ["site-content"], CACHE_TAGS.content) : readRaw;
const readContent = cache(async (key: ContentKey) => resolve(key, await readRawCached(key)));

export const getSettings = () => readContent("settings") as Promise<Settings>;
export const getHome = () => readContent("home") as Promise<HomeContent>;
export const getStoreFaqs = async () => ((await readContent("faqs")) as { items: Faq[] }).items;
export const getPage = (slug: PageSlug) => readContent(`page:${slug}`) as Promise<PageContent>;

/** Validates and saves content. Throws ContentError with field messages on bad input. */
export async function saveContent(key: ContentKey, value: unknown, actor: string): Promise<unknown> {
  const parsed = schemaFor(key).safeParse(value);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const i of parsed.error.issues) fields[i.path.join(".") || "form"] ??= i.message;
    const [path, msg] = Object.entries(fields)[0] ?? ["form", "Invalid content"];
    const where = friendlyPath(path);
    throw new ContentError(where ? `${where}: ${msg}` : msg, fields);
  }
  if (!isSupabaseConfigured) {
    store.content.set(key, parsed.data);
  } else {
    const { error } = await svc().from("site_content").upsert({ key, value: parsed.data, updated_by: actor });
    if (error) fail(`save content ${key}`, error);
  }
  await logActivity(actor, `Updated ${key.replace("page:", "page ")}`, key);
  return parsed.data;
}

/** Resets a key to its built-in defaults. */
export async function resetContent(key: ContentKey, actor: string) {
  if (!isSupabaseConfigured) store.content.delete(key);
  else {
    const { error } = await svc().from("site_content").delete().eq("key", key);
    if (error) fail(`reset content ${key}`, error);
  }
  await logActivity(actor, `Reset ${key} to defaults`, key);
}

/* ------------------------------------------------------------------ activity log */

export async function logActivity(actor: string, action: string, target = ""): Promise<void> {
  if (!isSupabaseConfigured) {
    store.activity.unshift({ id: Date.now() + Math.random(), actor, action, target, at: new Date().toISOString() });
    store.activity.length = Math.min(store.activity.length, 200);
    return;
  }
  const { error } = await svc().from("admin_activity").insert({ actor, action, target });
  if (error) console.error("[activity] log failed", error.message);
}

export async function listActivity(limit = 15): Promise<ActivityEntry[]> {
  if (!isSupabaseConfigured) return store.activity.slice(0, limit);
  const { data, error } = await svc().from("admin_activity").select("id, actor, action, target, created_at").order("created_at", { ascending: false }).limit(limit);
  if (error) fail("activity", error);
  return (data as { id: number; actor: string; action: string; target: string; created_at: string }[]).map((r) => ({ ...r, at: r.created_at }));
}
