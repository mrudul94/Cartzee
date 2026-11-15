import { notFound } from "next/navigation";
import { CategoryForm, type CategoryFormValues } from "@/components/admin/CategoryForm";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { contentAdmin } from "@/lib/data/admin-content";
import { paths } from "@/lib/utils/paths";
import { uploadImageAction } from "../../../actions";
import { deleteCategoryAction, saveCategoryAction } from "../../../cms-actions";
import { requirePermission } from "@/lib/auth/admin";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> };

const EMPTY: CategoryFormValues = { name: "", slug: "", parentSlug: null, intro: "", blurb: "", image: "", sortOrder: 50, isActive: true, faqs: [] };

/** /categories/new creates; /categories/<id> edits. */
export default async function AdminCategoryPage({ params, searchParams }: Props) {
  await requirePermission("content");
  const [{ id }, { created }] = await Promise.all([params, searchParams]);
  const all = await contentAdmin.listCategories();
  const isNew = id === "new";
  const c = isNew ? undefined : all.find((x) => x.id === id);
  if (!isNew && !c) notFound();
  const values: CategoryFormValues = c ? { ...c, viewHref: c.isActive ? paths.category(c) : undefined } : EMPTY;
  const title = c ? c.name : "Add category";

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={[{ label: "Categories", href: paths.admin("/categories") }, { label: title }]} withJsonLd={false} home={{ label: "Dashboard", href: paths.admin() }} className="-mb-4" />
      <h1 className="font-heading text-3xl font-semibold">{title}</h1>
      <CategoryForm
        key={c?.id ?? "new"}
        values={values}
        parents={all.filter((x) => !x.parentSlug).map((x) => ({ slug: x.slug, name: x.name }))}
        action={saveCategoryAction}
        deleteAction={c ? deleteCategoryAction : undefined}
        upload={uploadImageAction}
        notice={created ? "Category created." : undefined}
      />
    </div>
  );
}
