import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentPage } from "@/components/sections/ContentPage";
import { policies } from "@/lib/content/pages";
import { buildMetadata } from "@/lib/seo/metadata";
import { paths } from "@/lib/utils/paths";

export const dynamicParams = false;
type Slug = keyof typeof policies;
type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return Object.keys(policies).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = policies[(await params).slug as Slug];
  if (!page) return {};
  return buildMetadata({ title: page.title, description: page.description, path: paths.policy(page.slug as Slug) });
}

export default async function PolicyPage({ params }: Props) {
  const page = policies[(await params).slug as Slug];
  if (!page) notFound();
  return <ContentPage page={page} crumbs={[{ label: "Policies" }, { label: page.title }]} />;
}
