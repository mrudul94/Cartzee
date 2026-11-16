import "server-only";
import { isSupabaseConfigured } from "@/lib/config";
import { svc } from "@/lib/data/supabase-clients";
import { AdminError } from "./admin-repo";
import type { AdminRole, Permission } from "@/lib/auth/permissions";

export type TeamMember = { userId: string; email: string; role: AdminRole; permissions: Permission[]; createdAt: string };

async function allUsers() {
  const { data, error } = await svc().auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw new Error(`List users failed: ${error.message}`);
  return data.users;
}

export async function listTeam(): Promise<TeamMember[]> {
  if (!isSupabaseConfigured) return [];
  const [{ data, error }, users] = await Promise.all([svc().from("admins").select("user_id, role, permissions, created_at").order("created_at"), allUsers()]);
  if (error) throw new Error(`List admins failed: ${error.message}`);
  return (data as { user_id: string; role: AdminRole; permissions: Permission[]; created_at: string }[]).map((r) => {
    const u = users.find((x) => x.id === r.user_id);
    return { userId: r.user_id, email: u?.email ?? "(deleted user)", role: r.role, permissions: r.permissions ?? [], createdAt: r.created_at };
  });
}

async function superAdminCount() {
  const { count, error } = await svc().from("admins").select("user_id", { count: "exact", head: true }).eq("role", "super_admin");
  if (error) throw new Error(error.message);
  return count ?? 0;
}

/**
 * Creates a NEW sign-in account and makes it an admin. Existing accounts (including shop customer
 * accounts) are refused, so a customer account can never be turned into an admin.
 */
export async function addAdmin(input: { email: string; password: string; role: AdminRole; permissions: Permission[] }): Promise<void> {
  if (!isSupabaseConfigured) throw new AdminError("Team management needs Supabase.");
  const email = input.email.toLowerCase();
  if ((await allUsers()).some((u) => u.email?.toLowerCase() === email)) {
    throw new AdminError("An account with this email already exists (it may be a shop customer account). Admins must use a new, separate account.");
  }
  const created = await svc().auth.admin.createUser({ email, password: input.password, email_confirm: true, app_metadata: { kind: "admin" } });
  if (created.error || !created.data.user) throw new AdminError(created.error?.message ?? "Could not create the account.");
  const ins = await svc().from("admins").insert({ user_id: created.data.user.id, role: input.role, permissions: input.role === "super_admin" ? [] : input.permissions });
  if (ins.error) {
    await svc().auth.admin.deleteUser(created.data.user.id);
    throw new AdminError(`Could not add the admin: ${ins.error.message}`);
  }
}

export async function updateAdmin(userId: string, role: AdminRole, permissions: Permission[], actorId: string): Promise<void> {
  const { data } = await svc().from("admins").select("role").eq("user_id", userId).maybeSingle();
  if (!data) throw new AdminError("Admin not found.");
  if ((data as { role: AdminRole }).role === "super_admin" && role !== "super_admin" && (await superAdminCount()) <= 1) {
    throw new AdminError("There must always be at least one Super Admin.");
  }
  if (userId === actorId && role !== "super_admin") throw new AdminError("You can't remove your own Super Admin role. Ask another Super Admin.");
  const { error } = await svc().from("admins").update({ role, permissions: role === "super_admin" ? [] : permissions }).eq("user_id", userId);
  if (error) throw new AdminError(error.message);
}

/** Removes admin access and deletes the admin's sign-in account (signs them out everywhere). */
export async function removeAdmin(userId: string, actorId: string): Promise<void> {
  if (userId === actorId) throw new AdminError("You can't remove yourself.");
  const { data } = await svc().from("admins").select("role").eq("user_id", userId).maybeSingle();
  if (!data) throw new AdminError("Admin not found.");
  if ((data as { role: AdminRole }).role === "super_admin" && (await superAdminCount()) <= 1) throw new AdminError("There must always be at least one Super Admin.");
  const del = await svc().from("admins").delete().eq("user_id", userId);
  if (del.error) throw new AdminError(del.error.message);
  await svc().auth.admin.deleteUser(userId);
}
