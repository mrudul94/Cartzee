import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { CACHE_TAGS } from "@/lib/cache";

/**
 * POST /api/revalidate — called by the admin website after a save so the shop shows changes
 * immediately. Requires the shared REVALIDATE_SECRET (constant-time compared). Only refreshes caches;
 * it can't change any data.
 */
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  const given = req.headers.get("x-revalidate-secret") ?? "";
  if (!secret || secret.length < 16 || !safeEqual(given, secret)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  Object.values(CACHE_TAGS).forEach((t) => revalidateTag(t));
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
