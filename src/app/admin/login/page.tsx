import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { Logo } from "@/components/layout/Logo";
import { Card } from "@/components/ui/Card";
import { adminAuthAvailable, getAdmin } from "@/lib/auth/admin";
import { signInAction } from "../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sign in" };

export default async function AdminLoginPage() {
  if (await getAdmin()) redirect("/admin");
  return (
    <main id="main" className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card padding="lg" elevation="raised" className="w-full max-w-narrow">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <Logo />
          <h1 className="font-heading text-2xl font-semibold">Admin sign in</h1>
          <p className="text-sm text-text-muted">For City Seller partners only.</p>
        </div>
        {adminAuthAvailable ? (
          <LoginForm action={signInAction} />
        ) : (
          <p role="alert" className="rounded-md bg-warning-soft p-4 text-warning">
            Admin sign-in is not configured. Set the Supabase environment variables and add partner accounts to the
            <code> admins</code> table (see README).
          </p>
        )}
      </Card>
    </main>
  );
}
