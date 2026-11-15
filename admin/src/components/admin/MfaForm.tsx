"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import type { ActionState } from "@/lib/admin/forms";

export type MfaFormProps = {
  /** Existing verified authenticator; when missing, the form first enrolls a new one. */
  factorId?: string;
  enroll: () => Promise<{ factorId?: string; qr?: string; secret?: string; error?: string }>;
  verify: (prev: ActionState, fd: FormData) => Promise<ActionState>;
};

/** Two-step sign-in: scan the QR once with an authenticator app, then enter the 6-digit code each time. */
export function MfaForm({ factorId: existing, enroll, verify }: MfaFormProps) {
  const [state, action, pending] = useActionState(verify, {});
  const [setup, setSetup] = useState<{ factorId?: string; qr?: string; secret?: string; error?: string } | null>(null);

  useEffect(() => {
    if (!existing) enroll().then(setSetup);
  }, [existing, enroll]);

  const factorId = existing ?? setup?.factorId;

  return (
    <div className="flex flex-col gap-4">
      {!existing && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-text-muted">
            First time: open an authenticator app (Google Authenticator, Microsoft Authenticator or 1Password), scan this code, then enter the 6-digit code it shows.
          </p>
          {setup?.error && (
            <p role="alert" className="text-sm text-error">
              {setup.error}
            </p>
          )}
          {setup?.qr ? (
            <>
              {/* Supabase returns the QR as an SVG data URL; next/image doesn't optimise data URLs. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={setup.qr} alt="QR code for your authenticator app" className="mx-auto h-48 w-48 rounded-md bg-surface p-2" />
              <p className="break-all text-center text-xs text-text-muted">Can&apos;t scan? Enter this key: {setup.secret}</p>
            </>
          ) : (
            !setup?.error && <p className="text-sm text-text-muted">Preparing your QR code…</p>
          )}
        </div>
      )}
      <form action={action} className="flex flex-col gap-4" noValidate>
        <input type="hidden" name="factorId" value={factorId ?? ""} />
        <FormField id="mfa-code" label="6-digit code" error={state.errors?.code} required>
          <Input id="mfa-code" name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} invalid={Boolean(state.errors?.code)} autoFocus />
        </FormField>
        {state.message && (
          <p role="alert" className="rounded-md bg-error-soft p-3 text-sm text-error">
            {state.message}
          </p>
        )}
        <Button type="submit" variant="secondary" size="lg" fullWidth loading={pending} disabled={!factorId}>
          Verify and continue
        </Button>
      </form>
    </div>
  );
}
