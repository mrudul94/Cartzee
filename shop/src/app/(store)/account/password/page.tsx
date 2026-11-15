import { redirect } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { SetPasswordForm } from "@/components/commerce/SetPasswordForm";
import { getCustomer } from "@/lib/customer";
import { buildMetadata } from "@/lib/seo/metadata";
import { setPasswordAction } from "../../login/actions";

export const dynamic = "force-dynamic";
export const metadata = buildMetadata({ title: "Set a new password", description: "Choose a new password for your account.", path: "/account/password", noindex: true });

export default async function SetPasswordPage() {
  if (!(await getCustomer())) redirect("/login?next=/account/password");
  return (
    <Container width="narrow" className="flex flex-col gap-6 py-10">
      <h1 className="text-center font-heading text-3xl font-semibold">Set a new password</h1>
      <SetPasswordForm action={setPasswordAction} />
    </Container>
  );
}
