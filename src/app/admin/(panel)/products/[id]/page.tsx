import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { categoryOptions, toFormValues } from "@/lib/admin/product-values";
import { adminRepo } from "@/lib/data/admin-repo";
import { saveProductAction, uploadImageAction } from "../../../actions";
import { paths } from "@/lib/utils/paths";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> };

export async function generateMetadata({ params }: Props) {
  const p = await adminRepo.getProduct((await params).id);
  return { title: p ? `Edit: ${p.title}` : "Product" };
}

export default async function EditProductPage({ params, searchParams }: Props) {
  const [product, { created }] = await Promise.all([adminRepo.getProduct((await params).id), searchParams]);
  if (!product) notFound();
  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={[{ label: "Products", href: paths.admin("/products") }, { label: product.title }]} withJsonLd={false} home={{ label: "Dashboard", href: paths.admin() }} className="-mb-4" />
      <h1 className="font-heading text-3xl font-semibold">{product.title}</h1>
      <ProductForm
        key={product.id}
        values={toFormValues(product)}
        categories={await categoryOptions()}
        action={saveProductAction}
        upload={uploadImageAction}
        notice={created ? `Product created.${product.isActive ? " It is now live in the store." : " It is hidden until you tick “Visible in store”."}` : undefined}
      />
    </div>
  );
}
