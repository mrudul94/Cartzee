import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache";

/**
 * After an admin save: refresh the admin's own cached data, then ask the shop (a separate app)
 * to refresh via its secured /api/revalidate. Without REVALIDATE_SECRET (local dev) the shop
 * shows changes on its next revalidation (dev mode never caches, so changes show at once).
 */
export async function refreshShop(): Promise<void> {
  Object.values(CACHE_TAGS).forEach((t) => revalidateTag(t));
  revalidatePath("/", "layout");
  const secret = process.env.REVALIDATE_SECRET;
  const shop = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  if (!secret || !shop) return;
  try {
    const res = await fetch(`${shop}/api/revalidate`, { method: "POST", headers: { "x-revalidate-secret": secret }, cache: "no-store" });
    if (!res.ok) console.error("[refreshShop] shop revalidate failed", res.status);
  } catch (e) {
    console.error("[refreshShop] shop not reachable", e);
  }
}
