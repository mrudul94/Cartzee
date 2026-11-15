import { HomeEditor } from "@/components/admin/HomeEditor";
import { adminRepo } from "@/lib/data/admin-repo";
import { contentAdmin } from "@/lib/data/admin-content";
import { getHome } from "@/lib/data/content-repo";
import { site } from "@/lib/site";
import { resetContentAction, saveContentAction } from "../../../cms-actions";
import { uploadImageAction } from "../../../actions";
import { Button } from "@/components/ui/Button";
import { requirePermission } from "@/lib/auth/admin";

export const metadata = { title: "Homepage" };

export default async function AdminHomepagePage() {
  await requirePermission("content");
  const [home, categories, products] = await Promise.all([getHome(), contentAdmin.listCategories(), adminRepo.listProducts()]);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-semibold">Homepage</h1>
          <p className="text-text-muted">Hero slides, banners, product rows and their order. Untick a section to hide it; set dates to run offers automatically.</p>
        </div>
        <form action={resetContentAction}>
          <input type="hidden" name="key" value="home" />
          <Button type="submit" variant="ghost" size="sm">
            Reset to original layout
          </Button>
        </form>
      </div>
      <HomeEditor
        initial={home}
        categories={categories.map((c) => ({ slug: c.slug, name: c.name, parentSlug: c.parentSlug }))}
        products={products.filter((p) => p.isActive).map((p) => ({ slug: p.slug, title: p.title, image: p.images[0]?.src ?? "" }))}
        shopUrl={site.url}
        action={saveContentAction}
        upload={uploadImageAction}
      />
    </div>
  );
}
