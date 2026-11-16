import { ProfileForm } from "@/components/account/ProfileForm";
import { getCustomer } from "@/lib/customer";
import { buildMetadata } from "@/lib/seo/metadata";
import { saveProfileAction } from "../actions";

export const metadata = buildMetadata({ title: "Profile", description: "Your name and mobile number.", path: "/account/profile", noindex: true });

export default async function ProfilePage() {
  const c = await getCustomer();
  return (
    <>
      <h1 className="font-heading text-2xl font-semibold">Profile</h1>
      <ProfileForm name={c?.name ?? ""} phone={c?.phone ?? ""} email={c?.email ?? ""} action={saveProfileAction} />
    </>
  );
}
