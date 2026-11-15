import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { contentAdmin, type AdminCategory } from "@/lib/data/admin-content";
import { paths } from "@/lib/utils/paths";
import { requirePermission } from "@/lib/auth/admin";

export const metadata = { title: "Categories" };

/** Main categories followed by their subcategories (indented). */
function ordered(cats: AdminCategory[]) {
  const tops = cats.filter((c) => !c.parentSlug);
  return tops.flatMap((t) => [t, ...cats.filter((c) => c.parentSlug === t.slug)]);
}

export default async function AdminCategoriesPage() {
  await requirePermission("content");
  const rows = ordered(await contentAdmin.listCategories());
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-semibold">Categories</h1>
          <p className="text-text-muted">Names, images, intro answers and FAQs for category pages, the menu and homepage tiles.</p>
        </div>
        <Button href={paths.admin("/categories/new")} variant="secondary" icon={<Plus aria-hidden className="h-4 w-4" />}>
          Add category
        </Button>
      </div>
      <DataTable
        caption="Categories"
        rows={rows}
        rowKey={(c) => c.id}
        columns={[
          {
            header: "Category",
            cell: (c) => (
              <Link href={paths.admin(`/categories/${c.id}`)} className={`flex items-center gap-3 hover:underline ${c.parentSlug ? "pl-8" : ""}`}>
                <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-background">
                  {c.image && <Image src={c.image} alt="" fill sizes="40px" className="object-cover" />}
                </span>
                <span>
                  <span className={c.parentSlug ? "" : "font-semibold"}>{c.name}</span>
                  {!c.isActive && <Badge className="ml-2">Hidden</Badge>}
                </span>
              </Link>
            ),
          },
          { header: "Address", cell: (c) => <span className="text-sm text-text-muted">{paths.category(c)}</span>, hideOnMobile: true },
          { header: "Products", cell: (c) => c.productCount, align: "right" },
          { header: "Order", cell: (c) => c.sortOrder, align: "right", hideOnMobile: true },
        ]}
      />
    </div>
  );
}
