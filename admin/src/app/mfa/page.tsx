import { redirect } from "next/navigation";
import { MfaForm } from "@/components/admin/MfaForm";
import { Logo } from "@/components/layout/Logo";
import { Card } from "@/components/ui/Card";
import { getSessionState } from "@/lib/auth/admin";
import { mfaVerifyAction, resendCodeAction, signOutAction } from "../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Verify sign-in" };

/** Second sign-in step (required for every admin): 6-digit code sent by email. */
export default async function MfaPage({ searchParams }: { searchParams: Promise<{ send?: string }> }) {
  const s = await getSessionState();
  if (s.state === "ok") redirect("/");
  if (s.state !== "needs-mfa") redirect("/login");
  const { send } = await searchParams;

  return (
    <main id="main" className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card padding="lg" elevation="raised" className="w-full max-w-narrow">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <Logo />
          <h1 className="font-heading text-2xl font-semibold">Check your email</h1>
        </div>
        <MfaForm email={s.email} verify={mfaVerifyAction} resend={resendCodeAction} sendFailed={send === "failed"} />
        <form action={signOutAction} className="mt-4 text-center">
          <button type="submit" className="min-h-11 text-sm text-text-muted underline">
            Use a different account
          </button>
        </form>
      </Card>
    </main>
  );
}
