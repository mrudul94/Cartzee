"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { fieldErrors, type ActionState } from "@/lib/admin/forms";
import { ALL_PERMISSIONS, requireSuperAdmin, type Permission } from "@/lib/auth/admin";
import { AdminError } from "@/lib/data/admin-repo";
import { logActivity } from "@/lib/data/content-repo";
import { addAdmin, removeAdmin, updateAdmin } from "@/lib/data/team";

/** Team management (Super Admin only). Every change is written to the activity log. */

const roleSchema = z.enum(["super_admin", "admin"]);
const permissionsFrom = (fd: FormData): Permission[] => ALL_PERMISSIONS.filter((p) => fd.get(`perm-${p}`) === "on");

const addSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z
    .string()
    .min(12, "Use at least 12 characters")
    .max(72)
    .regex(/[A-Za-z]/, "Include a letter")
    .regex(/\d/, "Include a number"),
  role: roleSchema,
});

const fail = (e: unknown, fallback: string): ActionState => {
  if (e instanceof AdminError) return { message: e.message };
  console.error("[team]", e);
  return { message: fallback };
};

export async function addAdminAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireSuperAdmin();
  const parsed = addSchema.safeParse({ email: fd.get("email"), password: fd.get("password"), role: fd.get("role") });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const permissions = permissionsFrom(fd);
  if (parsed.data.role === "admin" && permissions.length === 0) return { message: "Give this admin at least one permission." };
  try {
    await addAdmin({ ...parsed.data, permissions });
  } catch (e) {
    return fail(e, "Could not add the admin.");
  }
  await logActivity(me.email, `Added admin ${parsed.data.email} (${parsed.data.role === "super_admin" ? "Super Admin" : permissions.join(", ")})`, "team");
  revalidatePath("/team");
  return { ok: true, message: `Added ${parsed.data.email}. Share the temporary password privately. When they sign in, a 6-digit code is emailed to them.` };
}

export async function updateAdminAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireSuperAdmin();
  const userId = String(fd.get("userId") ?? "");
  const role = roleSchema.safeParse(fd.get("role"));
  if (!userId || !role.success) return { message: "Invalid request." };
  const permissions = permissionsFrom(fd);
  try {
    await updateAdmin(userId, role.data, permissions, me.id);
  } catch (e) {
    return fail(e, "Could not update the admin.");
  }
  await logActivity(me.email, `Changed admin access (${role.data === "super_admin" ? "Super Admin" : permissions.join(", ") || "no permissions"})`, userId);
  revalidatePath("/team");
  return { ok: true, message: "Saved." };
}

export async function removeAdminAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireSuperAdmin();
  const userId = String(fd.get("userId") ?? "");
  try {
    await removeAdmin(userId, me.id);
  } catch (e) {
    return fail(e, "Could not remove the admin.");
  }
  await logActivity(me.email, "Removed an admin", userId);
  revalidatePath("/team");
  return { ok: true, message: "Removed." };
}
