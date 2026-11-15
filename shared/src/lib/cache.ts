import "server-only";
import { unstable_cache } from "next/cache";

/** Cache tags: the admin revalidates these on the shop after saving (see shop /api/revalidate). */
export const CACHE_TAGS = { content: "content", catalog: "catalog" } as const;
export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

/**
 * Cross-request data cache for read-heavy lookups (settings, homepage, categories), so most page
 * renders skip the database. Entries refresh on tag revalidation or after `revalidate` seconds.
 * Only active inside the Next.js runtime; in tests/scripts the function runs uncached.
 */
export function cached<A extends unknown[], R>(fn: (...args: A) => Promise<R>, keyParts: string[], tag: CacheTag, revalidate = 3600) {
  if (!process.env.NEXT_RUNTIME) return fn;
  return unstable_cache(fn, keyParts, { tags: [tag], revalidate });
}
