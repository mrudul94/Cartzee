// OpenNext adapter config for Cloudflare Workers.
// ISR/`revalidate` pages are cached in R2 (bucket bound as NEXT_INC_CACHE_R2_BUCKET in wrangler.jsonc).
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
});
