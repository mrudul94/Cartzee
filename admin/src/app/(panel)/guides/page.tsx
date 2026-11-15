import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { contentAdmin } from "@/lib/data/admin-content";
import { formatDate } from "@/lib/utils/format";
import { paths } from "@/lib/utils/paths";
import { requirePermission } from "@/lib/auth/admin";

export const metadata = { title: "Guides" };

export default async function AdminGuidesPage() {
  await requirePermission("content");
  const posts = await contentAdmin.listPosts();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-semibold">Buying guides</h1>
          <p className="text-text-muted">“Best X for Y” articles that link to your products and help you show up in Google and AI answers.</p>
        </div>
        <Button href={paths.admin("/guides/new")} variant="secondary" icon={<Plus aria-hidden className="h-4 w-4" />}>
          Write a guide
        </Button>
      </div>
      <DataTable
        caption="Guides"
        rows={posts}
        rowKey={(p) => p.slug}
        empty="No guides yet."
        columns={[
          {
            header: "Guide",
            cell: (p) => (
              <Link href={paths.admin(`/guides/${p.slug}`)} className="font-medium hover:underline">
                {p.title}
              </Link>
            ),
          },
          { header: "Status", cell: (p) => (p.isPublished ? <Badge variant="success">Published</Badge> : <Badge>Draft</Badge>) },
          { header: "Updated", cell: (p) => formatDate(p.updatedAt), hideOnMobile: true },
        ]}
      />
    </div>
  );
}
