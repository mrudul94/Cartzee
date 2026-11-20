import { BadgeCheck } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DeliveryPromise } from "@/components/commerce/DeliveryPromise";
import { PincodeChecker } from "@/components/commerce/PincodeChecker";
import { PrepaidNotice } from "@/components/commerce/PrepaidNotice";
import { PriceBlock } from "@/components/commerce/PriceBlock";
import { ProductBuyBox } from "@/components/commerce/ProductBuyBox";
import { ProductGallery } from "@/components/commerce/ProductGallery";
import { DeliveryReturns, ProductOffers, YouSave } from "@/components/commerce/ProductOffers";
import { ShareButton } from "@/components/commerce/ShareButton";
import { WishlistButton } from "@/components/commerce/WishlistButton";
import { RecentlyViewedRow, RecommendedRow, RecordView } from "@/components/sections/PersonalRows";
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
import { formatBought, formatINR } from "@/lib/utils/format";
import { paths } from "@/lib/utils/paths";
import { toCardProduct } from "@/lib/utils/product";

export const revalidate = 3600;
// New catalogue rows render on first request (ISR); unknown slugs 404 via notFound().

type Props = { params: Promise<{ category: string; sub: string; product: string }> };

export async function generateStaticParams() {
  // Products without a subcategory are served by the [sub] route (/<category>/<product>).
  return (await repo.listProducts()).filter((p) => p.subcategorySlug).map((p) => ({ category: p.categorySlug, sub: p.subcategorySlug, product: p.slug }));
}

/** Loads the product and enforces the single canonical path (sub is "" for products without a subcategory). */
async function load({ category, sub, product }: Awaited<Props["params"]>) {
  const p = await repo.getProductBySlug(product);
  if (!p || p.categorySlug !== category || p.subcategorySlug !== sub) return null;
  const [parent, subcategory] = await Promise.all([repo.getCategory(category), sub ? repo.getCategory(sub) : Promise.resolve(null)]);
  if (!parent || (sub && !subcategory)) return null;
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
    p.subcategorySlug ? repo.listProducts({ subcategory: p.subcategorySlug }) : Promise.resolve([]),
    repo.listProducts({ category: p.categorySlug }),
    getSettings(),
  ]);
  const returnDays = settings.delivery.returnWindowDays;
  const related = [...sameSub, ...sameCat, ...(await repo.listProducts({ bestseller: true }))]
    .filter((x, i, arr) => x.id !== p.id && arr.findIndex((y) => y.id === x.id) === i)
    .slice(0, 14);
  const card = toCardProduct(p);
  // Specifications: the admin's list, or at least material and colour when none were entered.
  const specRows = p.specs.length
    ? p.specs.map((s) => ({ label: s.label, value: s.value }))
    : [
        { label: "Material", value: p.material },
        { label: "Colour", value: p.colour },
      ].filter((r) => r.value);
  // Country of origin (required on Indian e-commerce listings), unless the admin's own specs already list it.
  const origin = p.countryOfOrigin?.trim();
  if (origin && !specRows.some((r) => /origin/i.test(r.label))) specRows.push({ label: "Country of origin", value: origin });
  const inStock = p.stock > 0;

  return (
    <div className="pb-24 md:pb-0">
      <Container>
        <Breadcrumbs
          items={[
            { label: parent.name, href: paths.category(parent) },
            ...(subcategory ? [{ label: subcategory.name, href: paths.category(subcategory) }] : []),
            { label: p.title },
          ]}
        />
        <div className="grid gap-8 pb-10 md:grid-cols-2 lg:gap-12">
          {/* Photos stay in view on larger screens while the buy options and details scroll. */}
          <div className="relative md:sticky md:top-32 md:self-start">
            <ProductGallery images={p.images} title={p.title} />
            <div className="absolute right-3 top-3 z-raised flex flex-col gap-2">
              <WishlistButton slug={p.slug} title={p.title} />
              <ShareButton title={p.title} path={paths.product(p)} />
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              {(p.isBestseller || p.qualityCertified) && (
                <div className="flex flex-wrap gap-2">
                  {p.isBestseller && <Badge variant="outline">Bestseller</Badge>}
                  {p.qualityCertified && (
                    <Badge variant="outline" className="border-info-soft bg-info-soft text-info">
                      <BadgeCheck aria-hidden className="h-4 w-4 fill-info text-info-soft" />
                      Quality Certified
                    </Badge>
                  )}
                </div>
              )}
              <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">{p.title}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                {p.reviewCount > 0 ? (
                  <a href="#reviews" className="hover:underline">
                    <RatingStars value={p.rating} count={p.reviewCount} size="md" showValue />
                  </a>
                ) : (
                  <p className="text-sm text-text-muted">No reviews yet</p>
                )}
                {formatBought(p.boughtCount ?? 0) && <p className="text-sm font-medium text-text-muted">{formatBought(p.boughtCount ?? 0)} so far</p>}
              </div>
            </div>
            <p className="text-lg text-text">{p.summary}</p>
            <div className="flex flex-col gap-2">
              <PriceBlock price={p.price} mrp={p.mrp} size="lg" showTaxNote />
              <YouSave price={p.price} mrp={p.mrp} />
            </div>
            {inStock ? (
              <>
                <p className="text-sm font-medium text-success">In stock, ready to ship</p>
                <DeliveryPromise price={p.price} />
              </>
            ) : (
              <p className="text-sm font-medium text-error">Sold out. Contact us to be notified when it is back.</p>
            )}
            <ProductBuyBox product={card} />
            <ProductOffers price={p.price} delivery={settings.delivery} upiDiscountPercent={settings.upiDiscountPercent} />
            <PrepaidNotice variant="inline" />
            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="mb-2 font-semibold">Check delivery date</p>
              <PincodeChecker />
            </div>
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
            {p.howToUse.length > 0 && (
              <>
                <h3 className="mb-3 mt-8 font-heading text-xl font-semibold">How to use and care</h3>
                <ol className="prose-body list-decimal pl-6">
                  {p.howToUse.map((step) => (
                    <li key={step} className="mb-2">
                      {step}
                    </li>
                  ))}
                </ol>
                  </>
            )}
          </div>
          {specRows.length > 0 && (
            <div>
              <h2 className="mb-6 font-heading text-2xl font-semibold md:text-3xl">Specifications</h2>
              <Table caption={`${p.title} specifications`} rows={specRows} />
            </div>
          )}
        </div>
      </Section>

      <Section aria-label="Delivery and returns" spacing="sm">
        <DeliveryReturns delivery={settings.delivery} />
      </Section>

      <FAQSection title="Questions about this product" faqs={p.faqs} background="background" />

      <Section background="surface" id="reviews" aria-labelledby="reviews-heading">
        <SectionHeader id="reviews-heading" title="Customer reviews" />
        <ReviewList reviews={reviews} rating={p.rating} reviewCount={p.reviewCount} productTitle={p.title} />
      </Section>

      <ProductGrid title="Similar products" products={related.map(toCardProduct)} viewAllHref={paths.category(subcategory ?? parent)} layout="row" panel />
      <RecommendedRow title="Recommended for you" exclude={p.slug} />
      <RecentlyViewedRow title="Recently viewed" exclude={p.slug} />
      <RecordView slug={p.slug} category={p.categorySlug} />

      <JsonLd data={buildProductJsonLd(p, subcategory ? `${parent.name} > ${subcategory.name}` : parent.name, returnDays)} />
    </div>
  );
}
