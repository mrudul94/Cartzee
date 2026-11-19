import { AdminShell } from "@/components/admin/AdminShell";
import { hasPermission, requireAdmin } from "@/lib/auth/admin";
import { emailCodePaused } from "@/lib/auth/email-code";
import { adminRepo } from "@/lib/data/admin-repo";
import { signOutAction } from "../actions";

export const dynamic = "force-dynamic";

/** Every admin page (except /login and /mfa) requires a signed-in, email-code verified admin. */
export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const counts = hasPermission(admin, "orders") ? await adminRepo.orderCounts() : null;
  return (
    <AdminShell
      email={admin.email}
      codePaused={admin.mode === "supabase" && emailCodePaused()}
      role={admin.role}
      permissions={admin.permissions}
      devMode={admin.mode === "dev"}
      pendingCount={counts?.paid ?? 0}
      signOut={admin.mode === "dev" ? undefined : signOutAction}
    >
      {children}
    </AdminShell>
  );
}
