import { TeamManager } from "@/components/admin/TeamManager";
import { requireSuperAdmin } from "@/lib/auth/admin";
import { listTeam } from "@/lib/data/team";
import { addAdminAction, removeAdminAction, updateAdminAction } from "../../team-actions";

export const metadata = { title: "Team" };

/** Super Admin only: who can use the admin and what they can do. */
export default async function TeamPage() {
  const me = await requireSuperAdmin();
  const team = await listTeam();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Team</h1>
        <p className="text-text-muted">Admins sign in with a password and an authenticator-app code. Admins only see the areas you allow.</p>
      </div>
      {me.mode === "dev" ? (
        <p className="rounded-md bg-warning-soft p-4 text-warning">Team management needs Supabase (local development uses a built-in Super Admin).</p>
      ) : (
        <TeamManager members={team.map((m) => ({ ...m, isMe: m.userId === me.id }))} add={addAdminAction} update={updateAdminAction} remove={removeAdminAction} />
      )}
    </div>
  );
}
