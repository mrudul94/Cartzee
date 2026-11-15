"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { cn } from "@/lib/utils/cn";

type State = { ok?: boolean; message?: string; errors?: Record<string, string> };
type Action = (prev: State, fd: FormData) => Promise<State>;

export type CustomerAuthFormProps = {
  /** Where to go after signing in (e.g. /checkout). */
  next: string;
  signIn: Action;
  signUp: Action;
  forgot: Action;
  initialMode?: "signin" | "signup";
};

function Message({ state }: { state: State }) {
  if (!state.message) return null;
  return (
    <p role={state.ok ? "status" : "alert"} className={cn("rounded-md p-3 text-sm", state.ok ? "bg-success-soft text-success" : "bg-error-soft text-error")}>
      {state.message}
    </p>
  );
}

/** Shopper sign in / create account (email + password, show/hide password, forgot password). */
export function CustomerAuthForm({ next, signIn, signUp, forgot, initialMode = "signin" }: CustomerAuthFormProps) {
  const [mode, setMode] = useState(initialMode);
  const [inState, inAction, inPending] = useActionState(signIn, {});
  const [upState, upAction, upPending] = useActionState(signUp, {});
  const [fState, fAction, fPending] = useActionState(forgot, {});
  const tab = (m: typeof mode, label: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={mode === m}
      onClick={() => setMode(m)}
      className={cn("min-h-11 flex-1 border-b-2 px-4 font-semibold focus-visible:outline-none focus-visible:shadow-focus", mode === m ? "border-ink text-text" : "border-transparent text-text-muted hover:text-text")}
    >
      {label}
    </button>
  );

  return (
    <Card padding="lg" elevation="raised" className="flex flex-col gap-5">
      <div role="tablist" aria-label="Account" className="flex border-b border-border">
        {tab("signin", "Sign in")}
        {tab("signup", "Create account")}
      </div>

      {mode === "signin" ? (
        <>
          <form action={inAction} className="flex flex-col gap-4" noValidate>
            <input type="hidden" name="next" value={next} />
            <FormField id="in-email" label="Email" error={inState.errors?.email} required>
              <Input id="in-email" name="email" type="email" autoComplete="email" invalid={Boolean(inState.errors?.email)} />
            </FormField>
            <FormField id="in-password" label="Password" error={inState.errors?.password} required>
              <PasswordInput id="in-password" name="password" autoComplete="current-password" invalid={Boolean(inState.errors?.password)} />
            </FormField>
            <Message state={inState} />
            <Button type="submit" variant="secondary" size="lg" fullWidth loading={inPending}>
              Sign in
            </Button>
          </form>
          <form action={fAction} className="flex flex-col gap-2">
            <p className="text-sm text-text-muted">Forgot your password? Enter your email and we&apos;ll send a reset link.</p>
            <div className="flex gap-2">
              <label htmlFor="forgot-email" className="sr-only">
                Email for password reset
              </label>
              <Input id="forgot-email" name="email" type="email" size="sm" autoComplete="email" placeholder="you@example.com" invalid={Boolean(fState.errors?.email)} />
              <Button type="submit" size="sm" variant="outline" loading={fPending}>
                Send link
              </Button>
            </div>
            <Message state={fState.errors?.email ? { message: fState.errors.email } : fState} />
          </form>
        </>
      ) : (
        <form action={upAction} className="flex flex-col gap-4" noValidate>
          <input type="hidden" name="next" value={next} />
          <FormField id="up-name" label="Full name" error={upState.errors?.name} required>
            <Input id="up-name" name="name" autoComplete="name" invalid={Boolean(upState.errors?.name)} />
          </FormField>
          <FormField id="up-email" label="Email" error={upState.errors?.email} required>
            <Input id="up-email" name="email" type="email" autoComplete="email" invalid={Boolean(upState.errors?.email)} />
          </FormField>
          <FormField id="up-password" label="Password" hint="At least 8 characters" error={upState.errors?.password} required>
            <PasswordInput id="up-password" name="password" autoComplete="new-password" invalid={Boolean(upState.errors?.password)} />
          </FormField>
          <Message state={upState} />
          <Button type="submit" variant="secondary" size="lg" fullWidth loading={upPending}>
            Create account
          </Button>
        </form>
      )}
    </Card>
  );
}
