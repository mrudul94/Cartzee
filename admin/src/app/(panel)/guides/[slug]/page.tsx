import { notFound } from "next/navigation";
import { PostForm, type PostFormValues } from "@/components/admin/PostForm";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { adminRepo } from "@/lib/data/admin-repo";
import { contentAdmin } from "@/lib/data/admin-content";
import { paths } from "@/lib/utils/paths";
import { uploadImageAction } from "../../../actions";
import { deletePostAction, savePostAction } from "../../../cms-actions";
import { requirePermission } from "@/lib/auth/admin";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ saved?: string }> };

const EMPTY: PostFormValues = {
  title: "",
  slug: "",
  excerpt: "",
  cover: "/placeholders/guides/storage-containers.svg",
  author: "City Seller Team",
  isPublished: false,
  body: [{ type: "p", text: "" }],
  faqs: [],
};

/** /guides/new creates; /guides/<slug> edits. */
export default async function AdminGuidePage({ params, searchParams }: Props) {
  await requirePermission("content");
  const [{ slug }, { saved }] = await Promise.all([params, searchParams]);
  const isNew = slug === "new";
  const [post, products] = await Promise.all([isNew ? null : contentAdmin.getPost(slug), adminRepo.listProducts()]);
  if (!isNew && !post) notFound();
  const values: PostFormValues = post
    ? { ...post, originalSlug: post.slug, viewHref: post.isPublished ? paths.guide(post.slug) : undefined }
    : EMPTY;
  const title = post?.title ?? "Write a guide";

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={[{ label: "Guides", href: paths.admin("/guides") }, { label: title }]} withJsonLd={false} home={{ label: "Dashboard", href: paths.admin() }} className="-mb-4" />
      <h1 className="font-heading text-3xl font-semibold">{title}</h1>
      <PostForm
        key={post?.slug ?? "new"}
        values={values}
        products={products.filter((p) => p.isActive).map((p) => ({ slug: p.slug, title: p.title, image: p.images[0]?.src ?? "" }))}
        action={savePostAction}
        deleteAction={post ? deletePostAction : undefined}
        upload={uploadImageAction}
        notice={saved ? "Guide saved." : undefined}
      />
    </div>
  );
}
