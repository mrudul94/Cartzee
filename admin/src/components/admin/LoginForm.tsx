"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import type { ActionState } from "@/lib/admin/forms";

export type LoginFormProps = { action: (prev: ActionState, fd: FormData) => Promise<ActionState> };

/** Email + password sign-in for partners listed in public.admins. */
export function LoginForm({ action }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <FormField id="login-email" label="Email" error={state.errors?.email} required>
        <Input id="login-email" name="email" type="email" autoComplete="username" invalid={Boolean(state.errors?.email)} />
      </FormField>
      <FormField id="login-password" label="Password" error={state.errors?.password} required>
        <PasswordInput id="login-password" name="password" autoComplete="current-password" invalid={Boolean(state.errors?.password)} />
      </FormField>
      {state.message && (
        <p role="alert" className="rounded-md bg-error-soft p-3 text-sm text-error">
          {state.message}
        </p>
      )}
      <Button type="submit" variant="secondary" size="lg" fullWidth loading={pending}>
        Sign in
      </Button>
    </form>
  );
}
