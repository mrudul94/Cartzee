import "server-only";
import type { CategoryOption, ProductFormValues } from "@/components/admin/ProductForm";
import { buildCategoryTree } from "@/components/layout/MegaMenu";
import { repo } from "@/lib/data";
import type { AdminProduct } from "@/lib/data/admin-repo";
import { paths } from "@/lib/utils/paths";

/** Category tree for the product form selects. */
export async function categoryOptions(): Promise<CategoryOption[]> {
  return buildCategoryTree(await repo.listCategories()).map((c) => ({
    slug: c.slug,
    name: c.name,
    hasSizes: c.hasSizes ?? false,
    children: c.children.map((s) => ({ slug: s.slug, name: s.name, hasSizes: s.hasSizes ?? false })),
  }));
}

export function toFormValues(p: AdminProduct): ProductFormValues {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    categorySlug: p.categorySlug,
    subcategorySlug: p.subcategorySlug,
    summary: p.summary,
    description: p.description,
    howToUse: p.howToUse,
    specs: p.specs,
    faqs: p.faqs,
    material: p.material,
    sizes: (p.sizes ?? []).join(", "),
    colour: p.colour,
    price: p.price,
    mrp: p.mrp,
    meeshoUrl: p.meeshoUrl,
    meeshoPrice: p.meeshoPrice,
    priceCheckedAt: p.priceCheckedAt,
    stock: p.stock,
    isBestseller: p.isBestseller,
    isFlashSale: p.isFlashSale,
    isActive: p.isActive,
    isNew: p.isNew ?? null,
    position: p.position ?? null,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
    images: p.images,
    path: p.isActive ? paths.product(p) : undefined,
  };
}

export const emptyFormValues: ProductFormValues = {
  title: "",
  slug: "",
  categorySlug: "",
  subcategorySlug: "",
  summary: "",
  description: "",
  howToUse: [],
  specs: [],
  faqs: [],
  material: "",
  sizes: "",
  colour: "",
  price: 0,
  mrp: 0,
  meeshoUrl: "",
  meeshoPrice: 0,
  stock: 0,
  isBestseller: false,
  isFlashSale: false,
  isActive: true,
  isNew: null,
  position: null,
  images: [],
};
