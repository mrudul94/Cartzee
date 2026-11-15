import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { MarginText } from "@/components/admin/AdminBits";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ChipNav } from "@/components/ui/ChipNav";
import { DataTable } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { adminRepo } from "@/lib/data/admin-repo";
import { daysSince, formatINR } from "@/lib/utils/format";
import { paths } from "@/lib/utils/paths";
import { isProductNew } from "@/lib/utils/product";
import { ProductQuickActions } from "@/components/admin/ProductQuickActions";
import { productQuickAction } from "../../cms-actions";
import { requirePermission } from "@/lib/auth/admin";

export const metadata = { title: "Products" };

type Props = { searchParams: Promise<{ q?: string; filter?: string }> };

export default async function AdminProductsPage({ searchParams }: Props) {
  await requirePermission("products");
  const { q = "", filter = "all" } = await searchParams;
  const all = await adminRepo.listProducts();
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-3xl font-semibold">Products</h1>
        <Button href={paths.admin("/products/new")} variant="secondary" icon={<Plus aria-hidden className="h-4 w-4" />}>
          Add product
        </Button>
      </div>
      <form role="search" className="max-w-modal">
        <input type="hidden" name="filter" value={filter} />
        <label htmlFor="product-q" className="sr-only">
          Search products
        </label>
        <Input id="product-q" name="q" type="search" defaultValue={q} placeholder="Search by title or slug" />
      </form>
      <ChipNav
        label="Filter products"
        chips={[
          { label: "All", href: href("all"), active: filter === "all", count: all.length },
          { label: "Price check due", href: href("stale"), active: filter === "stale", count: all.filter(filters.stale).length },
          { label: "Sold out", href: href("soldout"), active: filter === "soldout", count: all.filter(filters.soldout).length },
          { label: "Hidden", href: href("hidden"), active: filter === "hidden", count: all.filter(filters.hidden).length },
        ]}
      />
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
                  <span className="mt-1 flex flex-wrap gap-1">
                    {!p.isActive && <Badge variant="neutral">Hidden</Badge>}
                    {p.isBestseller && <Badge variant="outline">Bestseller</Badge>}
                    {p.isFlashSale && <Badge variant="sale">Flash sale</Badge>}
                    {isProductNew(p) && <Badge variant="success">New</Badge>}
                    {p.stock === 0 && <Badge variant="dark">Sold out</Badge>}
                  </span>
                </span>
              </Link>
            ),
          },
          { header: "Price", cell: (p) => <>{formatINR(p.price)}<s className="block text-sm text-text-muted">{formatINR(p.mrp)}</s></>, align: "right" },
          { header: "Meesho", cell: (p) => formatINR(p.meeshoPrice), align: "right", hideOnMobile: true },
          { header: "Margin", cell: (p) => <MarginText price={p.price} cost={p.meeshoPrice} />, align: "right" },
          { header: "Stock", cell: (p) => <span className={p.stock === 0 ? "font-semibold text-error" : undefined}>{p.stock}</span>, align: "right", hideOnMobile: true },
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
              <ProductQuickActions
                id={p.id}
                title={p.title}
                inStock={p.stock > 0}
                isActive={p.isActive}
                isNew={p.isNew ?? null}
                showsNew={isProductNew(p)}
                action={productQuickAction}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
