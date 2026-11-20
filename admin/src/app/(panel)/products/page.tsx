import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { MarginText } from "@/components/admin/AdminBits";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { adminRepo } from "@/lib/data/admin-repo";
import { daysSince, formatINR } from "@/lib/utils/format";
import { paths } from "@/lib/utils/paths";
import { ProductQuickActions, ProductQuickProvider, QuickBadges, QuickFilterChips, QuickPosition, QuickStock, type QuickRow } from "@/components/admin/ProductQuickActions";
import { productQuickAction, quickProductAction } from "../../cms-actions";
import { requirePermission } from "@/lib/auth/admin";

export const metadata = { title: "Products" };

type Props = { searchParams: Promise<{ q?: string; filter?: string; deleted?: string; notice?: string }> };

export default async function AdminProductsPage({ searchParams }: Props) {
  await requirePermission("products");
  const { q = "", filter = "all", deleted, notice } = await searchParams;
  const [all, orderCounts] = await Promise.all([adminRepo.listProducts(), adminRepo.orderCountsByProduct()]);
  const needle = q.trim().toLowerCase();
  const filters = {
    all: () => true,
    stale: (p: (typeof all)[number]) => daysSince(p.priceCheckedAt) > 7,
    hidden: (p: (typeof all)[number]) => !p.isActive,
    soldout: (p: (typeof all)[number]) => p.stock === 0,
  } as const;
  const pick = filters[filter as keyof typeof filters] ?? filters.all;
  const rows = all.filter((p) => pick(p) && (!needle || `${p.title} ${p.slug}`.toLowerCase().includes(needle)));
  const href = (f: string) => paths.admin(`/products?filter=${f}${q ? `&q=${encodeURIComponent(q)}` : ""}`);
  // Quick-action state for every product (filter counts cover all of them, not just this page's rows).
  const quickRows: Record<string, QuickRow> = Object.fromEntries(
    all.map((p) => [p.id, { stock: p.stock, isActive: p.isActive, isNew: p.isNew ?? null, position: p.position ?? null, createdAt: p.createdAt }]),
  );

  return (
    <ProductQuickProvider rows={quickRows} action={quickProductAction}>
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-3xl font-semibold">Products</h1>
        <Button href={paths.admin("/products/new")} variant="secondary" icon={<Plus aria-hidden className="h-4 w-4" />}>
          Add product
        </Button>
      </div>
      {deleted && (
        <p role="status" className="rounded-md bg-success-soft p-3 text-sm text-success">
          Product removed. The shop is updated.
        </p>
      )}
      {notice === "in-orders" && (
        <p role="alert" className="rounded-md bg-error-soft p-3 text-sm text-error">
          That product is in an order, so it can&apos;t be removed (the order history needs it). Use Hide to take it off the shop.
        </p>
      )}
      <form role="search" className="max-w-modal">
        <input type="hidden" name="filter" value={filter} />
        <label htmlFor="product-q" className="sr-only">
          Search products
        </label>
        <Input id="product-q" name="q" type="search" defaultValue={q} placeholder="Search by title or slug" />
      </form>
      <QuickFilterChips hrefs={{ all: href("all"), stale: href("stale"), soldout: href("soldout"), hidden: href("hidden") }} active={filter} staleCount={all.filter(filters.stale).length} />
      <DataTable
        caption="Products"
        rows={rows}
        rowKey={(p) => p.id}
        empty="No products match."
        columns={[
          {
            header: "Product",
            cell: (p) => (
              <Link href={paths.admin(`/products/${p.id}`)} className="flex items-center gap-3 hover:underline">
                <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-background">
                  {p.images[0] && <Image src={p.images[0].src} alt="" fill sizes="48px" className="object-cover" />}
                </span>
                <span>
                  <span className="font-medium">{p.title}</span>
                  <QuickBadges id={p.id} isBestseller={p.isBestseller} isFlashSale={p.isFlashSale} isDemo={p.isDemo} />
                </span>
              </Link>
            ),
          },
          {
            header: "Position",
            // Lower shows first in the shop; empty = automatic (newest first, after numbered products). Enter or Set saves.
            cell: (p) => <QuickPosition id={p.id} title={p.title} />,
            align: "right",
          },
          { header: "Price", cell: (p) => <>{formatINR(p.price)}<s className="block text-sm text-text-muted">{formatINR(p.mrp)}</s></>, align: "right" },
          { header: "Meesho", cell: (p) => formatINR(p.meeshoPrice), align: "right", hideOnMobile: true },
          { header: "Margin", cell: (p) => <MarginText price={p.price} cost={p.meeshoPrice} />, align: "right" },
          { header: "Stock", cell: (p) => <QuickStock id={p.id} />, align: "right", hideOnMobile: true },
          // Paid orders (not cancelled or returned) containing this product; the shop shows "10+ bought" from 10.
          { header: "Bought", cell: (p) => p.boughtCount ?? 0, align: "right", hideOnMobile: true },
          {
            header: "Price checked",
            cell: (p) => {
              const d = daysSince(p.priceCheckedAt);
              return <span className={d > 7 ? "font-semibold text-warning" : "text-text-muted"}>{d === 0 ? "Today" : `${d}d ago`}</span>;
            },
            align: "right",
            hideOnMobile: true,
          },
          {
            header: "Quick actions",
            align: "right",
            cell: (p) => (
              <ProductQuickActions id={p.id} title={p.title} orderCount={orderCounts.get(p.id) ?? 0} action={productQuickAction} />
            ),
          },
        ]}
      />
    </div>
    </ProductQuickProvider>
  );
}
