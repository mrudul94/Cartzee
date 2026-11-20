import { NextResponse } from "next/server";
import { repo } from "@/lib/data";
import { recommendProducts } from "@/lib/recommend";
import { toCardProduct } from "@/lib/utils/product";

const list = (v: string | null, max: number) =>
  (v ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^[a-z0-9-]{1,100}$/.test(s))
    .slice(0, max);

/**
 * GET /api/products — public product cards for client-side rows (no secrets, cached for 5 minutes).
 *   ?slugs=a,b,c                       those products, in that order (wishlist, recently viewed)
 *   ?recommend=cat1,cat2&exclude=a,b   "Recommended for you" (see lib/recommend.ts)
 */
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const limit = Math.min(24, Math.max(1, Number(sp.get("limit")) || 14));
  const slugs = list(sp.get("slugs"), 100);
  const products = sp.has("slugs")
    ? slugs.length
      ? await repo.listProducts({ slugs })
      : []
    : await recommendProducts(repo, { categories: list(sp.get("recommend"), 3), exclude: list(sp.get("exclude"), 40), limit });
  return NextResponse.json(
    { products: products.map(toCardProduct) },
    { headers: { "cache-control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600" } },
  );
}
