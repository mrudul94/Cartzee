import { redirect } from "next/navigation";
import { MfaForm } from "@/components/admin/MfaForm";
import { Logo } from "@/components/layout/Logo";
import { Card } from "@/components/ui/Card";
import { getSessionState, supabaseAuthClient } from "@/lib/auth/admin";
import { mfaEnrollAction, mfaVerifyAction, signOutAction } from "../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Verify sign-in" };

/** Second sign-in step (required for every admin): authenticator-app code. */
export default async function MfaPage() {
  const s = await getSessionState();
  if (s.state === "ok") redirect("/");
  if (s.state !== "needs-mfa") redirect("/login");
  const factors = await (await supabaseAuthClient()).auth.mfa.listFactors();
  const verified = factors.data?.totp.find((f) => f.status === "verified");

  return (
    <main id="main" className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card padding="lg" elevation="raised" className="w-full max-w-narrow">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <Logo />
          <h1 className="font-heading text-2xl font-semibold">{verified ? "Enter your code" : "Set up two-step sign-in"}</h1>
          <p className="text-sm text-text-muted">Signed in as {s.email}</p>
        </div>
        <MfaForm factorId={verified?.id} enroll={mfaEnrollAction} verify={mfaVerifyAction} />
        <form action={signOutAction} className="mt-4 text-center">
          <button type="submit" className="min-h-11 text-sm text-text-muted underline">
            Use a different account
          </button>
        </form>
      </Card>
    </main>
  );
}
