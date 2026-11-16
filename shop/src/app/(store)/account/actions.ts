"use server";

import { revalidatePath } from "next/cache";
import { MAX_SAVED_ADDRESSES, profileSchema, savedAddressSchema } from "@/lib/account";
import { customerClient, getCustomer } from "@/lib/customer";

export type AccountState = { ok?: boolean; message?: string; errors?: Record<string, string> };

const errs = (issues: { path: PropertyKey[]; message: string }[]) => Object.fromEntries(issues.map((i) => [String(i.path[0]), i.message]));
const signedOut: AccountState = { message: "Your session has ended. Please sign in again." };
const MISSING_TABLE = "Saved addresses aren't set up yet (run migration 0008 in Supabase).";

/** Name and mobile number (stored on the shopper's own account). */
export async function saveProfileAction(_prev: AccountState, fd: FormData): Promise<AccountState> {
  if (!(await getCustomer())) return signedOut;
  const parsed = profileSchema.safeParse({ name: fd.get("name"), phone: fd.get("phone") ?? "" });
  if (!parsed.success) return { errors: errs(parsed.error.issues) };
  const { error } = await (await customerClient()).auth.updateUser({ data: { name: parsed.data.name, phone: parsed.data.phone } });
  if (error) return { message: "Could not save your details. Please try again." };
  revalidatePath("/account", "layout");
  return { ok: true, message: "Your details are saved." };
}

/** Add or edit a saved address. The database only allows a shopper to touch their own rows (RLS). */
export async function saveAddressAction(_prev: AccountState, fd: FormData): Promise<AccountState> {
  if (!(await getCustomer())) return signedOut;
  const parsed = savedAddressSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { errors: errs(parsed.error.issues), message: "Please fix the highlighted fields." };
  const { id, isDefault, ...a } = parsed.data;
  const db = await customerClient();

  const existing = await db.from("customer_addresses").select("id, is_default");
  if (existing.error) return { message: MISSING_TABLE };
  const rows = existing.data as { id: string; is_default: boolean }[];
  if (!id && rows.length >= MAX_SAVED_ADDRESSES) return { message: `You can save up to ${MAX_SAVED_ADDRESSES} addresses. Delete one first.` };
  if (id && !rows.some((r) => r.id === id)) return { message: "Address not found." };
  // The first address is always the default.
  const makeDefault = isDefault || rows.length === 0 || (rows.length === 1 && rows[0]!.id === id);
  if (makeDefault) await db.from("customer_addresses").update({ is_default: false }).eq("is_default", true);

  const row = { ...a, is_default: makeDefault, updated_at: new Date().toISOString() };
  const res = id ? await db.from("customer_addresses").update(row).eq("id", id) : await db.from("customer_addresses").insert(row);
  if (res.error) return { message: "Could not save the address. Please check the details and try again." };
  revalidatePath("/account/addresses");
  return { ok: true, message: id ? "Address updated." : "Address saved." };
}

export async function deleteAddressAction(_prev: AccountState, fd: FormData): Promise<AccountState> {
  if (!(await getCustomer())) return signedOut;
  const id = String(fd.get("id") ?? "");
  const db = await customerClient();
  const { data, error } = await db.from("customer_addresses").delete().eq("id", id).select("is_default");
  if (error) return { message: "Could not delete the address." };
  // If the default was deleted, promote the oldest remaining address.
  if ((data as { is_default: boolean }[]).some((r) => r.is_default)) {
    const next = await db.from("customer_addresses").select("id").order("created_at").limit(1);
    const first = (next.data as { id: string }[] | null)?.[0];
    if (first) await db.from("customer_addresses").update({ is_default: true }).eq("id", first.id);
  }
  revalidatePath("/account/addresses");
  return { ok: true, message: "Address deleted." };
}

export async function setDefaultAddressAction(_prev: AccountState, fd: FormData): Promise<AccountState> {
  if (!(await getCustomer())) return signedOut;
  const id = String(fd.get("id") ?? "");
  const db = await customerClient();
  const owned = await db.from("customer_addresses").select("id").eq("id", id).maybeSingle();
  if (owned.error || !owned.data) return { message: "Address not found." };
  await db.from("customer_addresses").update({ is_default: false }).eq("is_default", true);
  const { error } = await db.from("customer_addresses").update({ is_default: true }).eq("id", id);
  if (error) return { message: "Could not change the default address." };
  revalidatePath("/account/addresses");
  return { ok: true, message: "Default address changed." };
}
