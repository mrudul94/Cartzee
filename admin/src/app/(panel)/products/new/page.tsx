import { ProductForm } from "@/components/admin/ProductForm";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { categoryOptions, emptyFormValues } from "@/lib/admin/product-values";
import { saveProductAction, uploadImageAction } from "../../../actions";
import { paths } from "@/lib/utils/paths";
import { requirePermission } from "@/lib/auth/admin";

export const metadata = { title: "Add product" };

export default async function NewProductPage() {
  await requirePermission("products");
  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={[{ label: "Products", href: paths.admin("/products") }, { label: "Add product" }]} withJsonLd={false} home={{ label: "Dashboard", href: paths.admin() }} className="-mb-4" />
      <h1 className="font-heading text-3xl font-semibold">Add product</h1>
      <ProductForm values={emptyFormValues} categories={await categoryOptions()} action={saveProductAction} upload={uploadImageAction} />
    </div>
  );
}
