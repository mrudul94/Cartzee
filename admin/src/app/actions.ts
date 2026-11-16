"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { fieldErrors, formObject, orderUpdateSchema, productFormSchema, type ActionState } from "@/lib/admin/forms";
import { headers } from "next/headers";
import { getAdmin, getSessionState, hasPermission, isAdminUser, requirePermission, supabaseAuthClient } from "@/lib/auth/admin";
import { clearLoginCodes, sendLoginCode, verifyLoginCode, type SendResult } from "@/lib/auth/email-code";
import { clientIpHash, isLocked, recordAttempt, WINDOW_MIN } from "@/lib/auth/rate-limit";
import { isSupabaseConfigured } from "@/lib/config";
import { repo } from "@/lib/data";
import { adminRepo, AdminError, type UploadFolder } from "@/lib/data/admin-repo";
import { logActivity } from "@/lib/data/content-repo";
import { changeOrderStatus, refundOrder } from "@/lib/orders/service";
import { canTransition } from "@/lib/orders/status";
import { paths } from "@/lib/utils/paths";
import { refreshShop } from "@/lib/refresh";

/* ------------------------------------------------------------------ auth */

const loginSchema = z.object({ email: z.string().trim().email("Enter your email"), password: z.string().min(6, "Enter your password") });

const LOCKED = `Too many failed attempts. Please wait ${WINDOW_MIN} minutes and try again.`;

/** Step 1: email + password (rate limited). Non-admins are signed out again. Then a code is emailed (step 2). */
export async function signInAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured) return { message: "Sign-in needs Supabase. Add your Supabase keys to .env.local." };
  const parsed = loginSchema.safeParse(formObject(fd));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const email = parsed.data.email.toLowerCase();
  const key = `admin:${email}`;
  const ip = await clientIpHash(await headers());
  if (await isLocked(key, ip)) {
    await logActivity(email, "Admin sign-in blocked (too many attempts)", "auth");
    return { message: LOCKED };
  }

  const supabase = await supabaseAuthClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: parsed.data.password });
  if (error || !data.user || !(await isAdminUser(data.user.id))) {
    if (data?.user) await supabase.auth.signOut();
    await recordAttempt(key, ip, false);
    await logActivity(email, "Failed admin sign-in", "auth");
    // Same message for wrong password and non-admin accounts (no account enumeration).
    return { message: "Email or password is incorrect, or this account is not an admin." };
  }
  await recordAttempt(key, ip, true);
  const sessionId = sessionIdOf(data.session?.access_token);
  if (!sessionId) return { message: "Sign-in failed. Please try again." };
  const sent = await sendLoginCode(sessionId, data.user.id, email);
  await logActivity(email, "Admin password accepted, sign-in code emailed", "auth");
  redirect(sent.ok ? "/mfa" : "/mfa?send=failed");
}

/** session_id claim of an access token Supabase has just issued to this server (not user input). */
function sessionIdOf(token: string | undefined): string | null {
  try {
    const payload = JSON.parse(Buffer.from(token!.split(".")[1]!, "base64url").toString("utf8")) as { session_id?: unknown };
    return typeof payload.session_id === "string" ? payload.session_id : null;
  } catch {
    return null;
  }
}

const sendMessage = (r: SendResult) =>
  r.ok ? "A new code has been sent." : r.reason === "cooldown" ? `Please wait ${r.waitSec} seconds before asking for another code.` : "We couldn't send the email. Please try again in a minute.";

/** Step 2a: email a new code (max one per minute). */
export async function resendCodeAction(_prev: ActionState, _fd: FormData): Promise<ActionState> {
  const s = await getSessionState();
  if (s.state === "ok") redirect("/");
  if (s.state !== "needs-mfa") redirect("/login");
  const r = await sendLoginCode(s.sessionId, s.userId, s.email);
  return { ok: r.ok, message: sendMessage(r) };
}

const mfaSchema = z.object({ code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code") });

/** Step 2b: check the emailed 6-digit code (rate limited). Marks this login session as verified. */
export async function mfaVerifyAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const s = await getSessionState();
  if (s.state === "ok") redirect("/");
  if (s.state !== "needs-mfa") redirect("/login");
  const parsed = mfaSchema.safeParse(formObject(fd));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const key = `mfa:${s.userId}`;
  const ip = await clientIpHash(await headers());
  if (await isLocked(key, ip)) return { message: LOCKED };

  const result = await verifyLoginCode(s.sessionId, parsed.data.code);
  if (result !== "ok") {
    await recordAttempt(key, ip, false);
    await logActivity(s.email, "Wrong admin sign-in code", "auth");
    const msg = {
      wrong: "That code is not correct.",
      expired: "That code has expired. Send a new one.",
      "too-many": "Too many wrong codes. Send a new one.",
      missing: "No code was sent yet. Send a new one.",
    }[result];
    return { errors: { code: msg } };
  }
  await recordAttempt(key, ip, true);
  await logActivity(s.email, "Admin signed in (email code verified)", "auth");
  redirect("/");
}

export async function signOutAction() {
  // Global sign-out revokes every session of this account, not just this browser.
  if (isSupabaseConfigured) {
    const supabase = await supabaseAuthClient();
    const { data } = await supabase.auth.getUser();
    if (data.user) await clearLoginCodes(data.user.id);
    await supabase.auth.signOut({ scope: "global" });
  }
  redirect("/login");
}

/* ------------------------------------------------------------------ orders */

export async function updateOrderAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const admin = await requirePermission("orders");
  const parsed = orderUpdateSchema.safeParse(formObject(fd));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const v = parsed.data;

  const order = await repo.getOrder(v.orderId);
  if (!order) return { message: "Order not found." };
  if (v.to === "paid" || !canTransition(order.status, v.to)) return { message: `This order can't move from "${order.status}" to "${v.to}".` };

  const refunding = (v.to === "cancelled_refunded" || v.to === "returned_refunded") && v.refund;
  let note = v.note;
  if (refunding) {
    const r = await refundOrder(order);
    if (!r.ok) return { message: `${r.message} Refund it from the Razorpay dashboard and untick 'Refund via Razorpay'. Status not changed.` };
    note = [note, r.note].filter(Boolean).join(" · ");
  }

  try {
    await changeOrderStatus(
      order.id,
      v.to,
      { meeshoOrderId: v.meeshoOrderId, meeshoCost: v.meeshoCost, trackingUrl: v.trackingUrl },
      [note, `by ${admin.email}`].filter(Boolean).join(" · "),
    );
  } catch (e) {
    return { message: e instanceof Error ? e.message : "Could not update the order." };
  }
  await logActivity(admin.email, `Order ${order.number}: ${order.status} → ${v.to}`, order.number);
  revalidatePath(`/orders/${order.id}`);
  revalidatePath("/orders");
  revalidatePath("/");
  return { ok: true, message: "Order updated and customer notified." };
}

/* ------------------------------------------------------------------ products */

export async function saveProductAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const admin = await requirePermission("products");
  const parsed = productFormSchema.safeParse(formObject(fd));
  if (!parsed.success) return { errors: fieldErrors(parsed.error), message: "Please fix the highlighted fields." };
  let id: string;
  try {
    id = (await adminRepo.saveProduct(parsed.data)).id;
    await logActivity(admin.email, `${parsed.data.id ? "Updated" : "Created"} product "${parsed.data.title}"`, parsed.data.slug);
  } catch (e) {
    if (e instanceof AdminError) return { message: e.message };
    console.error("[admin] save product failed", e);
    return { message: "Could not save the product. Please try again." };
  }
  // Catalogue changes affect listings, home, product and feeds: refresh all storefront ISR pages.
  await refreshShop();
  if (!parsed.data.id) redirect(paths.admin(`/products/${id}?created=1`));
  return { ok: true, message: "Product saved. The storefront is updated." };
}

/** Permanently delete a product (refused when any order contains it: hide it instead). */
export async function deleteProductAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const admin = await requirePermission("products");
  const id = z.string().trim().min(1).max(64).safeParse(fd.get("id"));
  if (!id.success) return { message: "Product not found." };
  const product = await adminRepo.getProduct(id.data);
  if (!product) return { message: "Product not found." };
  try {
    await adminRepo.deleteProduct(id.data);
  } catch (e) {
    if (e instanceof AdminError) return { message: e.message };
    console.error("[admin] delete product failed", e);
    return { message: "Could not delete the product. Please try again." };
  }
  await logActivity(admin.email, `Deleted product "${product.title}"`, product.slug);
  await refreshShop();
  redirect(paths.admin("/products?deleted=1"));
}

export async function markPriceCheckedAction(fd: FormData) {
  await requirePermission("products");
  const id = String(fd.get("id") ?? "");
  if (id) await adminRepo.markPriceChecked(id);
  revalidatePath("/");
  revalidatePath("/products");
}

export async function uploadImageAction(fd: FormData): Promise<{ src?: string; error?: string }> {
  const admin = await getAdmin();
  if (!admin) return { error: "Please sign in again." };
  if (!hasPermission(admin, "products") && !hasPermission(admin, "content")) return { error: "You don't have permission to upload images." };
  const file = fd.get("file");
  const slug = String(fd.get("slug") ?? "");
  const folderRaw = String(fd.get("folder") ?? "products");
  const folder: UploadFolder = (["products", "banners", "categories", "guides"] as const).find((x) => x === folderRaw) ?? "products";
  if (!(file instanceof File) || file.size === 0) return { error: "Choose an image to upload." };
  try {
    return { src: await adminRepo.uploadImage(file, slug, folder) };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload failed." };
  }
}
