import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentPage } from "@/components/sections/ContentPage";
import { getPage } from "@/lib/data/content-repo";
import { buildMetadata } from "@/lib/seo/metadata";
import { paths } from "@/lib/utils/paths";

export const revalidate = 3600;
export const dynamicParams = false;

const POLICIES = ["shipping", "returns", "privacy", "terms"] as const;
type Slug = (typeof POLICIES)[number];
type Props = { params: Promise<{ slug: string }> };

const isPolicy = (s: string): s is Slug => (POLICIES as readonly string[]).includes(s);

export function generateStaticParams() {
  return POLICIES.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug;
  if (!isPolicy(slug)) return {};
  const page = await getPage(slug);
  return buildMetadata({ title: page.title, description: page.description, path: paths.policy(slug) });
}

/** Policy pages; text is edited in Admin → Pages. */
export default async function PolicyPage({ params }: Props) {
  const slug = (await params).slug;
  if (!isPolicy(slug)) notFound();
  const page = await getPage(slug);
  return <ContentPage page={page} crumbs={[{ label: "Policies" }, { label: page.title }]} />;
}
