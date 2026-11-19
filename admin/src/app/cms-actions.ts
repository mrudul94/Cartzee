"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { categoryFormSchema, fieldErrors, formObject, postFormSchema, type ActionState } from "@/lib/admin/forms";
import { requirePermission } from "@/lib/auth/admin";
import { isContentKey } from "@/lib/content/schema";
import { AdminError, adminRepo, type ProductPatch, type ProductQuickState } from "@/lib/data/admin-repo";
import { contentAdmin } from "@/lib/data/admin-content";
import { ContentError, logActivity, resetContent, saveContent } from "@/lib/data/content-repo";
import { paths } from "@/lib/utils/paths";
import { refreshShop, refreshShopSite } from "@/lib/refresh";
import { background } from "@/lib/background";

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

/** Duplicate / remove from the product list (these navigate away, so they stay plain form posts). */
export async function productQuickAction(fd: FormData) {
  const admin = await requirePermission("products");
  const id = String(fd.get("id") ?? "");
  const op = String(fd.get("op") ?? "");
  if (!id || (op !== "duplicate" && op !== "delete")) return;
  const product = await adminRepo.getProduct(id);
  if (!product) return;

  if (op === "delete") {
    try {
      await adminRepo.deleteProduct(id);
    } catch (e) {
      if (e instanceof AdminError) redirect(paths.admin("/products?notice=in-orders"));
      throw e;
    }
    await logActivity(admin.email, `Deleted product "${product.title}"`, product.slug);
    await refreshShop();
    redirect(paths.admin("/products?deleted=1"));
  }
  const copy = await adminRepo.duplicateProduct(id);
  await logActivity(admin.email, `Duplicated product "${product.title}"`, copy.slug);
  await refreshShop();
  redirect(paths.admin(`/products/${copy.id}?created=1`));
}

const QUICK_OPS = ["soldout", "instock", "show", "hide", "new-auto", "new-on", "new-off", "position"] as const;
export type QuickOp = (typeof QUICK_OPS)[number];
export type QuickResult = { ok: true; product: ProductQuickState } | { ok: false; message: string };

/**
 * One-click product change from the list (stock, visibility, New badge, position).
 * Returns the saved row so the list updates in place; it does NOT re-render the admin page (that full
 * re-render was what made each click take seconds). The activity log and the shop refresh run after the
 * response. Admin reads stay uncached (straight from the database).
 */
export async function quickProductAction(id: string, op: QuickOp, value?: number | null): Promise<QuickResult> {
  const admin = await requirePermission("products");
  if (typeof id !== "string" || !id || !QUICK_OPS.includes(op)) return { ok: false, message: "Unknown action." };
  const whole = (v: unknown, min: number, max: number) => (typeof v === "number" && Number.isInteger(v) && v >= min && v <= max ? v : undefined);
  let patch: ProductPatch;
  let label: string;
  switch (op) {
    case "soldout":
      [patch, label] = [{ stock: 0 }, "Marked sold out"];
      break;
    case "instock": {
      const stock = whole(value, 1, 100_000) ?? 10;
      [patch, label] = [{ stock }, `Back in stock (${stock})`];
      break;
    }
    case "show":
      [patch, label] = [{ isActive: true }, "Shown in store"];
      break;
    case "hide":
      [patch, label] = [{ isActive: false }, "Hidden from store"];
      break;
    case "new-on":
      [patch, label] = [{ isNew: true }, "New badge on"];
      break;
    case "new-off":
      [patch, label] = [{ isNew: false }, "New badge off"];
      break;
    case "new-auto":
      [patch, label] = [{ isNew: null }, "New badge set to automatic"];
      break;
    case "position": {
      const position = value === null || value === undefined ? null : whole(value, 1, 9999);
      if (position === undefined) return { ok: false, message: "Position must be a whole number from 1 to 9999 (or empty)." };
      [patch, label] = [{ position }, `Position ${position ?? "automatic"}`];
      break;
    }
  }
  try {
    const product = await adminRepo.patchProduct(id, patch);
    await background("activity log", () => logActivity(admin.email, `${label}: "${product.title}"`, product.slug));
    await refreshShopSite();
    return { ok: true, product };
  } catch (e) {
    if (e instanceof AdminError) return { ok: false, message: e.message };
    console.error("[quick action]", e);
    return { ok: false, message: "Could not save. Check your connection and try again." };
  }
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
  else if (op === "reply") await contentAdmin.setReviewReply(id, String(fd.get("reply") ?? "").trim().slice(0, 1000));
  else return;
  await logActivity(admin.email, `Review ${op === "approve" ? "approved" : op === "hide" ? "hidden" : op === "reply" ? "replied to" : "deleted"}`, id);
  await refreshShop();
  revalidatePath("/reviews");
}
