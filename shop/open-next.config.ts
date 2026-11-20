// OpenNext adapter config for Cloudflare Workers.
// Pages with `revalidate` (ISR) are cached in Workers KV (binding NEXT_INC_CACHE_KV), and cache tags live in
// KV too (NEXT_TAG_CACHE_KV), so revalidateTag()/revalidatePath() after an admin save refresh the shop at once.
// KV is on Cloudflare's free plan. For heavy traffic later, R2 (r2-incremental-cache) is the scalable option.
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";
import kvNextTagCache from "@opennextjs/cloudflare/overrides/tag-cache/kv-next-tag-cache";
import memoryQueue from "@opennextjs/cloudflare/overrides/queue/memory-queue";

export default defineCloudflareConfig({
  incrementalCache: kvIncrementalCache,
  tagCache: kvNextTagCache,
  // Rebuilds stale pages (after revalidate or an admin save) via the WORKER_SELF_REFERENCE binding.
  // Without a queue OpenNext uses a no-op one, so cached pages never refresh until the next deploy.
  queue: memoryQueue,
});
