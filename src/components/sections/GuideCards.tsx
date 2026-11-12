import Image from "next/image";
import Link from "next/link";
import { Section, type SectionProps } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { Post } from "@/lib/types";
import { formatDate } from "@/lib/utils/format";
import { paths } from "@/lib/utils/paths";

export type GuideCardsProps = {
  title?: string;
  posts: Pick<Post, "slug" | "title" | "excerpt" | "cover" | "updatedAt">[];
  viewAllHref?: string;
  background?: SectionProps["background"];
  /** Use h1-level page title when this is the main listing (guides index). */
  asPage?: boolean;
};

/** Grid of buying-guide cards (homepage strip and /guides index). */
export function GuideCards({ title = "Buying guides", posts, viewAllHref, background, asPage = false }: GuideCardsProps) {
  if (posts.length === 0) return null;
  const H = asPage ? "h2" : "h3";
  return (
    <Section background={background} aria-labelledby="guides-heading">
      <SectionHeader id="guides-heading" as={asPage ? "h1" : "h2"} title={title} viewAllHref={viewAllHref} />
      <ul className="grid gap-6 md:grid-cols-3">
        {posts.map((p) => (
          <li key={p.slug}>
            <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface">
              <div className="relative aspect-banner bg-background">
                <Image src={p.cover} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <H className="font-heading text-xl font-semibold">
                  <Link href={paths.guide(p.slug)} className="after:absolute after:inset-0 group-hover:underline">
                    {p.title}
                  </Link>
                </H>
                <p className="text-base text-text-muted">{p.excerpt}</p>
                <p className="mt-auto text-sm text-text-muted">Updated {formatDate(p.updatedAt)}</p>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </Section>
  );
}
