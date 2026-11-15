import { notFound } from "next/navigation";
import { PageEditor } from "@/components/admin/PageEditors";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PAGE_SLUGS, type PageSlug } from "@/lib/content/schema";
import { getPage } from "@/lib/data/content-repo";
import { paths } from "@/lib/utils/paths";
import { saveContentAction } from "../../../../cms-actions";
import { requirePermission } from "@/lib/auth/admin";

type Props = { params: Promise<{ slug: string }> };

const isPage = (s: string): s is PageSlug => (PAGE_SLUGS as readonly string[]).includes(s);

export default async function AdminPageEditor({ params }: Props) {
  await requirePermission("content");
  const slug = (await params).slug;
  if (!isPage(slug)) notFound();
  const page = await getPage(slug);
  const viewHref = slug === "about" ? paths.about() : paths.policy(slug);
  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={[{ label: "Pages", href: paths.admin("/content/pages") }, { label: page.title }]} withJsonLd={false} home={{ label: "Dashboard", href: paths.admin() }} className="-mb-4" />
      <h1 className="font-heading text-3xl font-semibold">Edit: {page.title}</h1>
      <PageEditor initial={page} viewHref={viewHref} action={saveContentAction} />
    </div>
  );
}
