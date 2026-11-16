"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";

type State = { ok?: boolean; message?: string; errors?: Record<string, string> };

export type ProfileFormProps = {
  name: string;
  phone: string;
  email: string;
  action: (prev: State, fd: FormData) => Promise<State>;
};

/** My account → Profile: name and mobile number (email is the sign-in and shown read-only). */
export function ProfileForm({ name, phone, email, action }: ProfileFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <Card padding="lg" className="flex flex-col gap-4">
      <form action={formAction} className="flex flex-col gap-4" noValidate>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField id="profile-name" label="Full name" error={state.errors?.name} required>
            <Input id="profile-name" name="name" defaultValue={name} autoComplete="name" invalid={Boolean(state.errors?.name)} />
          </FormField>
          <FormField id="profile-phone" label="Mobile number" hint="Used for delivery updates" error={state.errors?.phone}>
            <Input id="profile-phone" name="phone" defaultValue={phone} inputMode="tel" autoComplete="tel-national" invalid={Boolean(state.errors?.phone)} />
          </FormField>
        </div>
        <FormField id="profile-email" label="Email address" hint="This is how you sign in, so it can't be changed here.">
          <Input id="profile-email" value={email} readOnly disabled />
        </FormField>
        {state.message && (
          <p role={state.ok ? "status" : "alert"} className={state.ok ? "text-sm text-success" : "text-sm text-error"}>
            {state.message}
          </p>
        )}
        <Button type="submit" variant="secondary" loading={pending} className="self-start">
          Save details
        </Button>
      </form>
    </Card>
  );
}
