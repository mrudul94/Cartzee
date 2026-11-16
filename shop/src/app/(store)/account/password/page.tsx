import { SetPasswordForm } from "@/components/commerce/SetPasswordForm";
import { buildMetadata } from "@/lib/seo/metadata";
import { setPasswordAction } from "../../login/actions";

export const metadata = buildMetadata({ title: "Change password", description: "Choose a new password for your account.", path: "/account/password", noindex: true });

/** Change password (also where password-reset email links land, already signed in by /auth/callback). */
export default function ChangePasswordPage() {
  return (
    <>
      <h1 className="font-heading text-2xl font-semibold">Change password</h1>
      <SetPasswordForm action={setPasswordAction} />
    </>
  );
}
