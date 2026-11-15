import { SettingsForm } from "@/components/admin/SettingsForm";
import { getSettings } from "@/lib/data/content-repo";
import { saveContentAction } from "../../cms-actions";
import { requirePermission } from "@/lib/auth/admin";

export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  await requirePermission("settings");
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Settings</h1>
        <p className="text-text-muted">Contact details, social links, the promo strip, delivery and returns.</p>
      </div>
      <SettingsForm initial={await getSettings()} action={saveContentAction} />
    </div>
  );
}
