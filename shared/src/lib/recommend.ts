import type { ProductQuery } from "@/lib/data/repo";
import type { Product } from "@/lib/types";
import { byTrending } from "@/lib/utils/product";

type Lister = { listProducts(q: ProductQuery): Promise<Product[]> };

/**
 * "Recommended for you": products from the categories this shopper looked at (bestsellers first, then
 * trending), skipping what they've already seen, topped up with store-wide trending products.
 * With no history it is simply "trending now".
 */
export async function recommendProducts(repo: Lister, opts: { categories: string[]; exclude: string[]; limit: number }): Promise<Product[]> {
  const seen = new Set(opts.exclude);
  const out: Product[] = [];
  const take = (list: Product[]) => {
    for (const p of list) {
      if (out.length >= opts.limit) return;
      if (seen.has(p.slug)) continue;
      seen.add(p.slug);
      out.push(p);
    }
  };
  const fromCats = await Promise.all(opts.categories.slice(0, 3).map((category) => repo.listProducts({ category, sort: "trending" })));
  // Interleave categories so one category doesn't fill the whole row; bestsellers lead within each.
  const queues = fromCats.map((list) => [...list].sort((a, b) => Number(b.isBestseller) - Number(a.isBestseller) || byTrending(a, b)));
  for (let i = 0; out.length < opts.limit && queues.some((q) => i < q.length); i++) take(queues.map((q) => q[i]).filter((p): p is Product => Boolean(p)));
  if (out.length < opts.limit) take(await repo.listProducts({ sort: "trending" }));
  return out;
}
