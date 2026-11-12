import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingTemplate } from "@/components/sections/ListingTemplate";
import { repo } from "@/lib/data";
import { buildMetadata } from "@/lib/seo/metadata";
import { BUDGET_TIERS, getBudgetTier } from "@/lib/utils/budget";
import { paths } from "@/lib/utils/paths";
import { toCardProduct } from "@/lib/utils/product";

export const revalidate = 3600;
export const dynamicParams = false;

type Props = { params: Promise<{ tier: string }> };

export function generateStaticParams() {
  return BUDGET_TIERS.map((t) => ({ tier: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tier = getBudgetTier((await params).tier);
  if (!tier) return {};
  return buildMetadata({
    title: `Home Essentials ${tier.label}`,
    description: `Useful home products ${tier.label.toLowerCase()}: kitchen storage, cleaning tools, bath accessories and décor, with prepaid checkout and delivery across India.`,
    path: paths.budget(tier.slug),
  });
}

export default async function BudgetPage({ params }: Props) {
  const tier = getBudgetTier((await params).tier);
  if (!tier) notFound();
  const products = await repo.listProducts({ minPrice: tier.min, maxPrice: Number.isFinite(tier.max) ? tier.max : undefined });

  return (
    <ListingTemplate
      crumbs={[{ label: "Shop by budget" }, { label: tier.label }]}
      title={`Home essentials ${tier.label.toLowerCase()}`}
      answer={`These are City Seller's home-needs products priced ${tier.label.toLowerCase()}, across kitchen, storage, cleaning, bathroom and décor. All prices include taxes and are paid online at checkout.`}
      products={products.map(toCardProduct)}
      hideBudget
      chips={BUDGET_TIERS.map((t) => ({ label: t.label, href: paths.budget(t.slug), active: t.slug === tier.slug }))}
    />
  );
}
