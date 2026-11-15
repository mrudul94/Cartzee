"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { categoryFormSchema, fieldErrors, formObject, postFormSchema, type ActionState } from "@/lib/admin/forms";
import { requirePermission } from "@/lib/auth/admin";
import { isContentKey } from "@/lib/content/schema";
import { AdminError, adminRepo } from "@/lib/data/admin-repo";
import { contentAdmin } from "@/lib/data/admin-content";
import { ContentError, logActivity, resetContent, saveContent } from "@/lib/data/content-repo";
import { paths } from "@/lib/utils/paths";
import { refreshShop } from "@/lib/refresh";

/**
 * CMS server actions. Every action: requirePermission() → validate → save → activity log →
 * refresh the shop's cached pages. Secrets and payment settings are never editable here.
 */

const errorState = (e: unknown, fallback: string): ActionState => {
  if (e instanceof ContentError) return { message: e.message, errors: e.fields };
  if (e instanceof AdminError) return { message: e.message };
  console.error("[cms]", e);
  return { message: fallback };
};

/* ------------------------------------------------------------------ site content (settings, homepage, pages, FAQs) */

export async function saveContentAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const key = String(fd.get("key") ?? "");
  if (!isContentKey(key)) return { message: "Unknown content." };
  const admin = await requirePermission(key === "settings" ? "settings" : "content");
  let value: unknown;
  try {
    value = JSON.parse(String(fd.get("value") ?? ""));
  } catch {
    return { message: "Could not read the form. Please reload and try again." };
  }
  try {
    await saveContent(key, value, admin.email);
  } catch (e) {
    return errorState(e, "Could not save. Please try again.");
  }
  await refreshShop();
  return { ok: true, message: "Saved. The shop is updated." };
}

export async function resetContentAction(fd: FormData) {
  const admin = await requirePermission("content");
  const key = String(fd.get("key") ?? "");
  if (!isContentKey(key)) return;
  await resetContent(key, admin.email);
  await refreshShop();
}

/* ------------------------------------------------------------------ product quick actions */

const QUICK = ["soldout", "instock", "show", "hide", "new-auto", "new-on", "new-off", "duplicate"] as const;
type Quick = (typeof QUICK)[number];

export async function productQuickAction(fd: FormData) {
  const admin = await requirePermission("products");
  const id = String(fd.get("id") ?? "");
  const op = String(fd.get("op") ?? "") as Quick;
  if (!id || !QUICK.includes(op)) return;
  const restock = Math.max(1, Math.min(100_000, Math.floor(Number(fd.get("restock")) || 10)));
  const product = await adminRepo.getProduct(id);
  if (!product) return;

  if (op === "duplicate") {
    const copy = await adminRepo.duplicateProduct(id);
    await logActivity(admin.email, `Duplicated product "${product.title}"`, copy.slug);
    await refreshShop();
    redirect(paths.admin(`/products/${copy.id}?created=1`));
  }
  const patch =
    op === "soldout" ? { stock: 0 }
    : op === "instock" ? { stock: restock }
    : op === "show" ? { isActive: true }
    : op === "hide" ? { isActive: false }
    : op === "new-on" ? { isNew: true }
    : op === "new-off" ? { isNew: false }
    : { isNew: null };
  await adminRepo.patchProduct(id, patch);
  const label: Record<Exclude<Quick, "duplicate">, string> = {
    soldout: "Marked sold out",
    instock: `Back in stock (${restock})`,
    show: "Shown in store",
    hide: "Hidden from store",
    "new-auto": "New badge set to automatic",
    "new-on": "New badge on",
    "new-off": "New badge off",
  };
  await logActivity(admin.email, `${label[op]}: "${product.title}"`, product.slug);
  await refreshShop();
  revalidatePath("/products");
}

/* ------------------------------------------------------------------ categories */

export async function saveCategoryAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const admin = await requirePermission("content");
  const parsed = categoryFormSchema.safeParse(formObject(fd));
  if (!parsed.success) return { errors: fieldErrors(parsed.error), message: "Please fix the highlighted fields." };
  let saved;
  try {
    saved = await contentAdmin.saveCategory(parsed.data);
  } catch (e) {
    return errorState(e, "Could not save the category.");
  }
  await logActivity(admin.email, `${parsed.data.id ? "Updated" : "Created"} category "${saved.name}"`, saved.slug);
  await refreshShop();
  if (!parsed.data.id) redirect(paths.admin(`/categories/${saved.id}?created=1`));
  return { ok: true, message: "Category saved. The shop is updated." };
}

export async function deleteCategoryAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const admin = await requirePermission("content");
  const id = String(fd.get("id") ?? "");
  try {
    await contentAdmin.deleteCategory(id);
  } catch (e) {
    return errorState(e, "Could not delete the category.");
  }
  await logActivity(admin.email, "Deleted a category", id);
  await refreshShop();
  redirect(paths.admin("/categories"));
}

/* ------------------------------------------------------------------ guides */

export async function savePostAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const admin = await requirePermission("content");
  const parsed = postFormSchema.safeParse(formObject(fd));
  if (!parsed.success) return { errors: fieldErrors(parsed.error), message: "Please fix the highlighted fields." };
  let saved;
  try {
    saved = await contentAdmin.savePost(parsed.data);
  } catch (e) {
    return errorState(e, "Could not save the guide.");
  }
  await logActivity(admin.email, `${parsed.data.originalSlug ? "Updated" : "Created"} guide "${saved.title}"`, saved.slug);
  await refreshShop();
  if (parsed.data.originalSlug !== saved.slug) redirect(paths.admin(`/guides/${saved.slug}?saved=1`));
  return { ok: true, message: saved.isPublished ? "Guide saved and published." : "Guide saved as a draft (not visible in the shop)." };
}

export async function deletePostAction(fd: FormData) {
  const admin = await requirePermission("content");
  const slug = String(fd.get("slug") ?? "");
  if (!slug) return;
  await contentAdmin.deletePost(slug);
  await logActivity(admin.email, `Deleted guide`, slug);
  await refreshShop();
  redirect(paths.admin("/guides"));
}

/* ------------------------------------------------------------------ reviews */

export async function reviewAction(fd: FormData) {
  const admin = await requirePermission("reviews");
  const id = String(fd.get("id") ?? "");
  const op = String(fd.get("op") ?? "");
  if (!id) return;
  if (op === "approve") await contentAdmin.setReviewApproved(id, true);
  else if (op === "hide") await contentAdmin.setReviewApproved(id, false);
  else if (op === "delete") await contentAdmin.deleteReview(id);
  else return;
  await logActivity(admin.email, `Review ${op === "approve" ? "approved" : op === "hide" ? "hidden" : "deleted"}`, id);
  await refreshShop();
  revalidatePath("/reviews");
}
