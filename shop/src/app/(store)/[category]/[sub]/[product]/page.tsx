import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { PincodeChecker } from "@/components/commerce/PincodeChecker";
import { PrepaidNotice } from "@/components/commerce/PrepaidNotice";
import { PriceBlock } from "@/components/commerce/PriceBlock";
import { ProductBuyBox } from "@/components/commerce/ProductBuyBox";
import { ProductGallery } from "@/components/commerce/ProductGallery";
import { RatingStars } from "@/components/commerce/RatingStars";
import { ReviewList } from "@/components/commerce/ReviewList";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container, Section } from "@/components/layout/Container";
import { FAQSection } from "@/components/sections/InfoSections";
import { ProductGrid } from "@/components/sections/ProductGrid";
import { Badge } from "@/components/ui/Badge";
import { Table } from "@/components/ui/Misc";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { repo } from "@/lib/data";
import { buildProductJsonLd } from "@/lib/seo/jsonld";
import { JsonLd } from "@/lib/seo/JsonLdScript";
import { buildMetadata } from "@/lib/seo/metadata";
import { getSettings } from "@/lib/data/content-repo";
import { formatINR } from "@/lib/utils/format";
import { paths } from "@/lib/utils/paths";
import { toCardProduct } from "@/lib/utils/product";

export const revalidate = 3600;
// New catalogue rows render on first request (ISR); unknown slugs 404 via notFound().

type Props = { params: Promise<{ category: string; sub: string; product: string }> };

export async function generateStaticParams() {
  return (await repo.listProducts()).map((p) => ({ category: p.categorySlug, sub: p.subcategorySlug, product: p.slug }));
}

/** Loads the product and enforces the single canonical path. */
async function load({ category, sub, product }: Awaited<Props["params"]>) {
  const p = await repo.getProductBySlug(product);
  if (!p || p.categorySlug !== category || p.subcategorySlug !== sub) return null;
  const [parent, subcategory] = await Promise.all([repo.getCategory(category), repo.getCategory(sub)]);
  if (!parent || !subcategory) return null;
  return { p, parent, subcategory };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await load(await params);
  if (!data) return {};
  const { p } = data;
  return buildMetadata({
    title: `${p.title} at ${formatINR(p.price)}`,
    description: p.summary,
    path: paths.product(p),
    image: p.images[0]?.src,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
  });
}

export default async function ProductPage({ params }: Props) {
  const data = await load(await params);
  if (!data) notFound();
  const { p, parent, subcategory } = data;
  const [reviews, sameSub, sameCat, settings] = await Promise.all([
    repo.listReviews(p.id),
    repo.listProducts({ subcategory: p.subcategorySlug }),
    repo.listProducts({ category: p.categorySlug }),
    getSettings(),
  ]);
  const returnDays = settings.delivery.returnWindowDays;
  const related = [...sameSub, ...sameCat, ...(await repo.listProducts({ bestseller: true }))]
    .filter((x, i, arr) => x.id !== p.id && arr.findIndex((y) => y.id === x.id) === i)
    .slice(0, 4);
  const card = toCardProduct(p);
  const inStock = p.stock > 0;

  return (
    <div className="pb-24 md:pb-0">
      <Container>
        <Breadcrumbs
          items={[
            { label: parent.name, href: paths.category(parent) },
            { label: subcategory.name, href: paths.category(subcategory) },
            { label: p.title },
          ]}
        />
        <div className="grid gap-8 pb-10 md:grid-cols-2 lg:gap-12">
          <ProductGallery images={p.images} title={p.title} />

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              {p.isBestseller && <Badge variant="outline" className="self-start">Bestseller</Badge>}
              <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">{p.title}</h1>
              <a href="#reviews" className="self-start hover:underline">
                <RatingStars value={p.rating} count={p.reviewCount} size="md" showValue />
              </a>
            </div>
            <p className="text-lg text-text">{p.summary}</p>
            <PriceBlock price={p.price} mrp={p.mrp} size="lg" showTaxNote />
            {inStock ? (
              <p className="text-sm font-medium text-success">In stock, ready to ship</p>
            ) : (
              <p className="text-sm font-medium text-error">Sold out. Contact us to be notified when it is back.</p>
            )}
            <ProductBuyBox product={card} />
            <PrepaidNotice variant="inline" />
            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="mb-2 font-semibold">Check delivery date</p>
              <PincodeChecker />
            </div>
            <ul className="grid grid-cols-3 gap-2 text-center text-sm text-text-muted">
              <li className="flex flex-col items-center gap-1">
                <Truck aria-hidden className="h-5 w-5 text-text" /> Ships across India
              </li>
              <li className="flex flex-col items-center gap-1">
                <RotateCcw aria-hidden className="h-5 w-5 text-text" /> {returnDays}-day returns on damage
              </li>
              <li className="flex flex-col items-center gap-1">
                <ShieldCheck aria-hidden className="h-5 w-5 text-text" /> Secure Razorpay payments
              </li>
            </ul>
          </div>
        </div>
      </Container>

      <Section background="surface" aria-labelledby="details-heading">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeader id="details-heading" title="Product details" />
            <div className="prose-body">
              {p.description.split("\n\n").map((para) => (
                <p key={para.slice(0, 32)}>{para}</p>
              ))}
            </div>
            <h3 className="mb-3 mt-8 font-heading text-xl font-semibold">How to use and care</h3>
            <ol className="prose-body list-decimal pl-6">
              {p.howToUse.map((step) => (
                <li key={step} className="mb-2">
                  {step}
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h2 className="mb-6 font-heading text-2xl font-semibold md:text-3xl">Specifications</h2>
            <Table caption={`${p.title} specifications`} rows={p.specs.map((s) => ({ label: s.label, value: s.value }))} />
          </div>
        </div>
      </Section>

      <FAQSection title="Questions about this product" faqs={p.faqs} background="background" />

      <Section background="surface" id="reviews" aria-labelledby="reviews-heading">
        <SectionHeader id="reviews-heading" title="Customer reviews" />
        <ReviewList reviews={reviews} rating={p.rating} reviewCount={p.reviewCount} productTitle={p.title} />
      </Section>

      <ProductGrid title="You may also like" products={related.map(toCardProduct)} viewAllHref={paths.category(subcategory)} />

      <JsonLd data={buildProductJsonLd(p, `${parent.name} > ${subcategory.name}`, returnDays)} />
    </div>
  );
}
