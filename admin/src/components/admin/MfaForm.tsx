"use client";

import { keepFormValues } from "@/hooks/useKeepFormValues";
import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import type { ActionState } from "@/lib/admin/forms";

type Action = (prev: ActionState, fd: FormData) => Promise<ActionState>;

export type MfaFormProps = {
  /** Where the code was sent (shown to the admin). */
  email: string;
  verify: Action;
  resend: Action;
  /** The first email could not be sent (shown until a resend succeeds). */
  sendFailed?: boolean;
};

/** Second sign-in step: enter the 6-digit code emailed to the admin, or ask for a new one. */
export function MfaForm({ email, verify, resend, sendFailed }: MfaFormProps) {
  const [state, action, pending] = useActionState(verify, {});
  const [sent, resendAction, resending] = useActionState(resend, {});
  const notice = sent.message ?? (sendFailed ? "We couldn't send the email. Use \"Send a new code\" to try again." : undefined);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-text-muted">
        We emailed a 6-digit code to <span className="font-semibold text-text">{email}</span>. It expires in 10 minutes.
      </p>
      <form action={action} onSubmit={keepFormValues(action)} className="flex flex-col gap-4" noValidate>
        <FormField id="mfa-code" label="6-digit code" error={state.errors?.code} required>
          <Input id="mfa-code" name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} invalid={Boolean(state.errors?.code)} autoFocus />
        </FormField>
        {state.message && (
          <p role="alert" className="rounded-md bg-error-soft p-3 text-sm text-error">
            {state.message}
          </p>
        )}
        <Button type="submit" variant="secondary" size="lg" fullWidth loading={pending}>
          Verify and continue
        </Button>
      </form>
      <form action={resendAction} className="flex flex-col items-center gap-2">
        {notice && (
          <p role="status" className={sent.ok ? "text-sm text-success" : "text-sm text-text-muted"}>
            {notice}
          </p>
        )}
        <Button type="submit" variant="ghost" size="sm" loading={resending}>
          Send a new code
        </Button>
      </form>
    </div>
  );
}
