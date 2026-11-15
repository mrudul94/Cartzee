"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { fieldErrors, formObject, orderUpdateSchema, productFormSchema, type ActionState } from "@/lib/admin/forms";
import { headers } from "next/headers";
import { getAdmin, getSessionState, hasPermission, isAdminUser, requirePermission, supabaseAuthClient } from "@/lib/auth/admin";
import { clientIpHash, isLocked, recordAttempt, WINDOW_MIN } from "@/lib/auth/rate-limit";
import { isRazorpayConfigured, isSupabaseConfigured } from "@/lib/config";
import { repo } from "@/lib/data";
import { adminRepo, AdminError, type UploadFolder } from "@/lib/data/admin-repo";
import { logActivity } from "@/lib/data/content-repo";
import { changeOrderStatus } from "@/lib/orders/service";
import { canTransition } from "@/lib/orders/status";
import { refundPayment, toPaise } from "@/lib/payments/razorpay";
import { paths } from "@/lib/utils/paths";
import { refreshShop } from "@/lib/refresh";

/* ------------------------------------------------------------------ auth */

const loginSchema = z.object({ email: z.string().trim().email("Enter your email"), password: z.string().min(6, "Enter your password") });

const LOCKED = `Too many failed attempts. Please wait ${WINDOW_MIN} minutes and try again.`;

/** Step 1: email + password (rate limited). Non-admins are signed out again. Then MFA (step 2). */
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
  redirect("/mfa");
}

/** Step 2a (first sign-in): start authenticator-app enrollment; returns the QR code to scan. */
export async function mfaEnrollAction(): Promise<{ factorId?: string; qr?: string; secret?: string; error?: string }> {
  const s = await getSessionState();
  if (s.state !== "needs-mfa") return { error: "Please sign in again." };
  const supabase = await supabaseAuthClient();
  // Remove unfinished enrollments so a fresh QR code is shown.
  const factors = await supabase.auth.mfa.listFactors();
  for (const f of factors.data?.all ?? []) if (f.status !== "verified") await supabase.auth.mfa.unenroll({ factorId: f.id });
  const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `City Seller admin ${Date.now()}` });
  if (error || !data) return { error: error?.message ?? "Could not start setup." };
  return { factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret };
}

const mfaSchema = z.object({ factorId: z.string().min(1), code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code") });

/** Step 2b: verify the 6-digit code (rate limited). Upgrades the session to aal2. */
export async function mfaVerifyAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const s = await getSessionState();
  if (s.state === "ok") redirect("/");
  if (s.state !== "needs-mfa") redirect("/login");
  const parsed = mfaSchema.safeParse(formObject(fd));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const key = `mfa:${s.userId}`;
  const ip = await clientIpHash(await headers());
  if (await isLocked(key, ip)) return { message: LOCKED };

  const supabase = await supabaseAuthClient();
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: parsed.data.factorId, code: parsed.data.code });
  if (error) {
    await recordAttempt(key, ip, false);
    await logActivity(s.email, "Failed MFA code", "auth");
    return { errors: { code: "That code is not correct or has expired." } };
  }
  await recordAttempt(key, ip, true);
  await logActivity(s.email, "Admin signed in (MFA verified)", "auth");
  redirect("/");
}

export async function signOutAction() {
  // Global sign-out revokes every session of this account, not just this browser.
  if (isSupabaseConfigured) await (await supabaseAuthClient()).auth.signOut({ scope: "global" });
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
    if (!order.razorpayPaymentId) return { message: "No payment ID on this order, so it can't be refunded automatically. Refund it from the Razorpay dashboard and untick 'Refund via Razorpay'." };
    if (isRazorpayConfigured) {
      try {
        const r = await refundPayment(order.razorpayPaymentId, toPaise(order.total), { orderNumber: order.number });
        note = [note, `Refund ${r.id} (${r.status})`].filter(Boolean).join(" · ");
      } catch (e) {
        return { message: e instanceof Error ? e.message : "Refund failed; status not changed." };
      }
    } else {
      note = [note, "Refund simulated (Razorpay not configured)"].filter(Boolean).join(" · ");
    }
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
