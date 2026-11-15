import { FaqEditor } from "@/components/admin/PageEditors";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { getStoreFaqs } from "@/lib/data/content-repo";
import { paths } from "@/lib/utils/paths";
import { saveContentAction } from "../../../cms-actions";
import { requirePermission } from "@/lib/auth/admin";

export const metadata = { title: "Store FAQs" };

export default async function AdminFaqsPage() {
  await requirePermission("content");
  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={[{ label: "Pages", href: paths.admin("/content/pages") }, { label: "Store FAQs" }]} withJsonLd={false} home={{ label: "Dashboard", href: paths.admin() }} className="-mb-4" />
      <div>
        <h1 className="font-heading text-3xl font-semibold">Store FAQs</h1>
        <p className="text-text-muted">Shown on the homepage and the FAQ page, and included in Google&apos;s FAQ data.</p>
      </div>
      <FaqEditor initial={await getStoreFaqs()} action={saveContentAction} />
    </div>
  );
}
