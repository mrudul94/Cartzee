import type { MetadataRoute } from "next";
import { policies } from "@/lib/content/pages";
import { repo } from "@/lib/data";
import { site } from "@/lib/site";
import { BUDGET_TIERS } from "@/lib/utils/budget";
import { paths } from "@/lib/utils/paths";

export const revalidate = 3600;

const abs = (p: string) => `${site.url}${p}`;

/** /sitemap.xml: every indexable shop URL, with product images. Cart/checkout/search/admin are excluded. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products, posts] = await Promise.all([repo.listCategories(), repo.listProducts(), repo.listPosts()]);
  const now = new Date();
  const newest = products.reduce((d, p) => (p.createdAt > d ? p.createdAt : d), "1970-01-01");

  return [
    { url: abs("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    ...categories.map((c) => ({
      url: abs(paths.category(c)),
      lastModified: new Date(newest),
      changeFrequency: "weekly" as const,
      priority: c.parentSlug ? 0.7 : 0.8,
    })),
    ...products.map((p) => ({
      url: abs(paths.product(p)),
      lastModified: new Date(p.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.9,
      images: p.images.map((i) => (i.src.startsWith("http") ? i.src : abs(i.src))),
    })),
    ...BUDGET_TIERS.map((t) => ({ url: abs(paths.budget(t.slug)), changeFrequency: "weekly" as const, priority: 0.6 })),
    { url: abs(paths.flashSale()), changeFrequency: "daily", priority: 0.7 },
    { url: abs(paths.bestsellers()), changeFrequency: "weekly", priority: 0.7 },
    { url: abs(paths.guides()), changeFrequency: "weekly", priority: 0.6 },
    ...posts.map((p) => ({ url: abs(paths.guide(p.slug)), lastModified: new Date(p.updatedAt), changeFrequency: "monthly" as const, priority: 0.6 })),
    ...Object.values(policies).map((p) => ({
      url: abs(paths.policy(p.slug as keyof typeof policies)),
      lastModified: new Date(p.updated),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
    ...[paths.about(), paths.contact(), paths.faq(), paths.track()].map((p) => ({ url: abs(p), changeFrequency: "monthly" as const, priority: 0.4 })),
  ];
}
