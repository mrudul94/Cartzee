import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache";

/**
 * After an admin save: refresh the admin's own cached data, then ask the shop (a separate app)
 * to refresh via its secured /api/revalidate. In `pnpm dev` the shop doesn't cache, so changes show at
 * once; in production REVALIDATE_SECRET must be set on both apps or the shop updates within an hour.
 */
export async function refreshShop(): Promise<void> {
  Object.values(CACHE_TAGS).forEach((t) => revalidateTag(t));
  revalidatePath("/", "layout");
  const secret = process.env.REVALIDATE_SECRET;
  const shop = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  if (!secret || !shop) {
    if (process.env.NODE_ENV === "production") console.warn("[refreshShop] REVALIDATE_SECRET or NEXT_PUBLIC_SITE_URL not set: the shop will show this change within an hour.");
    return;
  }
  try {
    const res = await fetch(`${shop}/api/revalidate`, { method: "POST", headers: { "x-revalidate-secret": secret }, cache: "no-store" });
    if (!res.ok) console.error("[refreshShop] shop revalidate failed", res.status);
  } catch (e) {
    console.error("[refreshShop] shop not reachable", e);
  }
}
