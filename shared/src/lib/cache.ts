import "server-only";
import { unstable_cache } from "next/cache";

/** Cache tags: the admin revalidates these on the shop after saving (see shop /api/revalidate). */
export const CACHE_TAGS = { content: "content", catalog: "catalog" } as const;
export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

/**
 * Cross-request data cache for read-heavy lookups (settings, homepage, categories), so most page
 * renders skip the database. Entries refresh on tag revalidation or after `revalidate` seconds.
 * Only active in production builds: in `pnpm dev` (and tests/scripts) every read is live, so admin
 * edits show in the shop immediately even though shop and admin are separate apps.
 */
export function cached<A extends unknown[], R>(fn: (...args: A) => Promise<R>, keyParts: string[], tag: CacheTag, revalidate = 3600) {
  if (!process.env.NEXT_RUNTIME || process.env.NODE_ENV !== "production") return fn;
  return unstable_cache(fn, keyParts, { tags: [tag], revalidate });
}
