"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { fieldErrors, formObject, orderUpdateSchema, productFormSchema, type ActionState } from "@/lib/admin/forms";
import { getAdmin, isAdminUser, requireAdmin, supabaseAuthClient } from "@/lib/auth/admin";
import { isRazorpayConfigured, isSupabaseConfigured } from "@/lib/config";
import { repo } from "@/lib/data";
import { adminRepo, AdminError } from "@/lib/data/admin-repo";
import { changeOrderStatus } from "@/lib/orders/service";
import { canTransition } from "@/lib/orders/status";
import { refundPayment, toPaise } from "@/lib/payments/razorpay";

/* ------------------------------------------------------------------ auth */

const loginSchema = z.object({ email: z.string().trim().email("Enter your email"), password: z.string().min(6, "Enter your password") });

export async function signInAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured) return { message: "Sign-in needs Supabase. Add your Supabase keys to .env.local." };
  const parsed = loginSchema.safeParse(formObject(fd));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const supabase = await supabaseAuthClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) return { message: "Email or password is incorrect." };
  if (!(await isAdminUser(data.user.id))) {
    await supabase.auth.signOut();
    return { message: "This account does not have admin access." };
  }
  redirect("/admin");
}

export async function signOutAction() {
  if (isSupabaseConfigured) await (await supabaseAuthClient()).auth.signOut();
  redirect("/admin/login");
}

/* ------------------------------------------------------------------ orders */

export async function updateOrderAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
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
  revalidatePath(`/admin/orders/${order.id}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { ok: true, message: "Order updated and customer notified." };
}

/* ------------------------------------------------------------------ products */

export async function saveProductAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = productFormSchema.safeParse(formObject(fd));
  if (!parsed.success) return { errors: fieldErrors(parsed.error), message: "Please fix the highlighted fields." };
  let id: string;
  try {
    id = (await adminRepo.saveProduct(parsed.data)).id;
  } catch (e) {
    if (e instanceof AdminError) return { message: e.message };
    console.error("[admin] save product failed", e);
    return { message: "Could not save the product. Please try again." };
  }
  // Catalogue changes affect listings, home, product and feeds: refresh all storefront ISR pages.
  revalidatePath("/", "layout");
  if (!parsed.data.id) redirect(`/admin/products/${id}?created=1`);
  return { ok: true, message: "Product saved. The storefront is updated." };
}

export async function markPriceCheckedAction(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get("id") ?? "");
  if (id) await adminRepo.markPriceChecked(id);
  revalidatePath("/admin");
  revalidatePath("/admin/products");
}

export async function uploadImageAction(fd: FormData): Promise<{ src?: string; error?: string }> {
  if (!(await getAdmin())) return { error: "Please sign in again." };
  const file = fd.get("file");
  const slug = String(fd.get("slug") ?? "");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose an image to upload." };
  try {
    return { src: await adminRepo.uploadImage(file, slug) };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload failed." };
  }
}
