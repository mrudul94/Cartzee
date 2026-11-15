"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { PasswordInput } from "@/components/ui/PasswordInput";

type State = { ok?: boolean; message?: string; errors?: Record<string, string> };

/** New-password form shown after a password-reset email link. */
export function SetPasswordForm({ action }: { action: (prev: State, fd: FormData) => Promise<State> }) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <Card padding="lg" elevation="raised">
      <form action={formAction} className="flex flex-col gap-4" noValidate>
        <FormField id="new-password" label="New password" hint="At least 8 characters" error={state.errors?.password} required>
          <PasswordInput id="new-password" name="password" autoComplete="new-password" invalid={Boolean(state.errors?.password)} />
        </FormField>
        {state.message && (
          <p role={state.ok ? "status" : "alert"} className={state.ok ? "rounded-md bg-success-soft p-3 text-sm text-success" : "rounded-md bg-error-soft p-3 text-sm text-error"}>
            {state.message}
          </p>
        )}
        <Button type="submit" variant="secondary" size="lg" fullWidth loading={pending}>
          Save password
        </Button>
        {state.ok && (
          <Button href="/account" variant="link" className="self-center">
            Go to my account
          </Button>
        )}
      </form>
    </Card>
  );
}
