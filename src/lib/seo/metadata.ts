import type { Metadata } from "next";
import { site } from "@/lib/site";

export type BuildMetadataInput = {
  title: string;
  description: string;
  /** Path starting with "/" — becomes the canonical URL. */
  path: string;
  image?: string;
  /** Manual overrides stored in the database (seo_title / seo_description). */
  seoTitle?: string;
  seoDescription?: string;
  type?: "website" | "article";
  noindex?: boolean;
};

const clip = (s: string, n: number) => (s.length <= n ? s : `${s.slice(0, n - 1).trimEnd()}…`);

/** Unique title/description, canonical, Open Graph and Twitter card for every page. */
export function buildMetadata(i: BuildMetadataInput): Metadata {
  const title = clip(i.seoTitle ?? i.title, 60);
  const description = clip(i.seoDescription ?? i.description, 160);
  const url = `${site.url}${i.path}`;
  const image = i.image ? (i.image.startsWith("http") ? i.image : `${site.url}${i.image}`) : `${site.url}/placeholders/og-default.svg`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: i.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      title,
      description,
      url,
      siteName: site.name,
      locale: "en_IN",
      type: i.type ?? "website",
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}
