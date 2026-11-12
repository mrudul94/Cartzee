import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/commerce/ProductCard";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { FAQSection } from "@/components/sections/InfoSections";
import { repo } from "@/lib/data";
import { buildArticleJsonLd } from "@/lib/seo/jsonld";
import { JsonLd } from "@/lib/seo/JsonLdScript";
import { buildMetadata } from "@/lib/seo/metadata";
import { formatDate } from "@/lib/utils/format";
import { paths } from "@/lib/utils/paths";
import { toCardProduct } from "@/lib/utils/product";
import type { PostBlock } from "@/lib/types";

export const revalidate = 3600;

/** Splits guide blocks into runs of prose and runs of product rows so cards never inherit prose styles. */
function groupBlocks(blocks: PostBlock[]): PostBlock[][] {
  const groups: PostBlock[][] = [];
  for (const b of blocks) {
    const last = groups.at(-1);
    const isProducts = b.type === "products";
    if (last && (last[0]?.type === "products") === isProducts) last.push(b);
    else groups.push([b]);
  }
  return groups;
}
// New catalogue rows render on first request (ISR); unknown slugs 404 via notFound().
type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await repo.listPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await repo.getPost((await params).slug);
  if (!post) return {};
  return buildMetadata({ title: post.title, description: post.excerpt, path: paths.guide(post.slug), image: post.cover, type: "article" });
}

export default async function GuidePage({ params }: Props) {
  const post = await repo.getPost((await params).slug);
  if (!post) notFound();
  const productSlugs = post.body.flatMap((b) => (b.type === "products" ? b.slugs : []));
  const products = await repo.listProducts({ slugs: productSlugs });
  const bySlug = new Map(products.map((p) => [p.slug, toCardProduct(p)]));

  return (
    <>
      <Container width="prose" className="pb-10">
        <Breadcrumbs items={[{ label: "Guides", href: paths.guides() }, { label: post.title }]} />
        <article>
          <header className="mb-6 flex flex-col gap-3">
            <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">{post.title}</h1>
            <p className="text-sm text-text-muted">
              By {post.author} · Updated <time dateTime={post.updatedAt}>{formatDate(post.updatedAt)}</time>
            </p>
            <div className="relative aspect-banner overflow-hidden rounded-lg bg-background">
              <Image src={post.cover} alt="" fill priority sizes="(min-width: 768px) 65ch, 100vw" className="object-cover" />
            </div>
          </header>
          {groupBlocks(post.body).map((group, gi) =>
            group[0]?.type === "products" ? (
              group.map((b, i) => {
                if (b.type !== "products") return null;
                const cards = b.slugs.map((s) => bySlug.get(s)).filter((c) => c !== undefined);
                return (
                  <ul key={`${gi}-${i}`} className="my-6 grid grid-cols-2 gap-4">
                    {cards.map((c) => (
                      <li key={c.id}>
                        <ProductCard product={c} headingLevel="h3" />
                      </li>
                    ))}
                  </ul>
                );
              })
            ) : (
              <div key={gi} className="prose-body">
                {group.map((b, i) =>
                  b.type === "h2" ? <h2 key={i}>{b.text}</h2> : b.type === "p" ? <p key={i} className={gi === 0 && i === 0 ? "text-lg" : undefined}>{b.text}</p> : null,
                )}
              </div>
            ),
          )}
        </article>
      </Container>
      <FAQSection faqs={post.faqs} />
      <JsonLd data={buildArticleJsonLd(post)} />
    </>
  );
}
