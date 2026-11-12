import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/admin";
import { adminRepo } from "@/lib/data/admin-repo";
import { signOutAction } from "../actions";

export const dynamic = "force-dynamic";

/** Every page under /admin (except /admin/login) requires an admin session. */
export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const counts = await adminRepo.orderCounts();
  return (
    <AdminShell email={admin.email} devMode={admin.mode === "dev"} pendingCount={counts.paid} signOut={admin.mode === "dev" ? undefined : signOutAction}>
      {children}
    </AdminShell>
  );
}
