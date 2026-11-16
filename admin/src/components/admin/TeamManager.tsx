"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { Trash2, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { FormField } from "@/components/ui/FormField";
import { Input, Select } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import type { ActionState } from "@/lib/admin/forms";
import { ALL_PERMISSIONS, PERMISSION_LABELS, type AdminRole, type Permission } from "@/lib/auth/permissions";

type Action = (prev: ActionState, fd: FormData) => Promise<ActionState>;
export type TeamMemberView = { userId: string; email: string; role: AdminRole; permissions: Permission[]; isMe: boolean };

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin (chosen permissions)" },
  { value: "super_admin", label: "Super Admin (everything + team)" },
];

function Result({ state }: { state: ActionState }) {
  if (!state.message) return null;
  return (
    <p role={state.ok ? "status" : "alert"} className={state.ok ? "text-sm text-success" : "text-sm text-error"}>
      {state.message}
    </p>
  );
}

function PermissionBoxes({ idPrefix, role, initial }: { idPrefix: string; role: AdminRole; initial: Permission[] }) {
  if (role === "super_admin") return <p className="text-sm text-text-muted">Super Admins can use every part of the admin and manage the team.</p>;
  return (
    <fieldset>
      <legend className="mb-1 text-sm font-medium">Can manage</legend>
      <div className="grid md:grid-cols-2">
        {ALL_PERMISSIONS.map((p) => (
          <Checkbox key={p} id={`${idPrefix}-${p}`} name={`perm-${p}`} defaultChecked={initial.includes(p)} label={PERMISSION_LABELS[p]} />
        ))}
      </div>
    </fieldset>
  );
}

function MemberRow({ m, update, remove }: { m: TeamMemberView; update: Action; remove: Action }) {
  const [role, setRole] = useState<AdminRole>(m.role);
  const [uState, uAction, uPending] = useActionState(update, {});
  const [rState, rAction, rPending] = useActionState(remove, {});
  return (
    <Card padding="md" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold">{m.email}</span>
        {m.isMe && <Badge>You</Badge>}
        {m.role === "super_admin" ? <Badge variant="dark">Super Admin</Badge> : <Badge variant="outline">Admin</Badge>}
      </div>
      <form action={uAction} className="flex flex-col gap-3">
        <input type="hidden" name="userId" value={m.userId} />
        <FormField id={`role-${m.userId}`} label="Role">
          <Select id={`role-${m.userId}`} name="role" size="sm" value={role} onChange={(e) => setRole(e.target.value as AdminRole)} options={ROLE_OPTIONS} className="max-w-80" />
        </FormField>
        <PermissionBoxes idPrefix={`perm-${m.userId}`} role={role} initial={m.permissions} />
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" size="sm" variant="secondary" loading={uPending}>
            Save access
          </Button>
          <Result state={uState} />
        </div>
      </form>
      {!m.isMe && (
        <form
          action={rAction}
          onSubmit={(e) => {
            if (!window.confirm(`Remove ${m.email}? Their admin account is deleted and they are signed out everywhere.`)) e.preventDefault();
          }}
          className="flex items-center gap-3"
        >
          <input type="hidden" name="userId" value={m.userId} />
          <Button type="submit" size="sm" variant="ghost" className="text-error" loading={rPending} icon={<Trash2 aria-hidden className="h-4 w-4" />}>
            Remove admin
          </Button>
          <Result state={rState} />
        </form>
      )}
    </Card>
  );
}

/** Super Admin team management: add admins (new accounts only), set role/permissions, remove. */
export function TeamManager({ members, add, update, remove }: { members: TeamMemberView[]; add: Action; update: Action; remove: Action }) {
  const [state, action, pending] = useActionState(add, {});
  const [role, setRole] = useState<AdminRole>("admin");
  const formRef = useRef<HTMLFormElement>(null);
  const e = state.errors ?? {};
  // Submit without React's automatic form reset, so a rejected entry stays on screen to fix; clear only on success.
  const submit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const fd = new FormData(ev.currentTarget);
    startTransition(() => action(fd));
  };
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);
  return (
    <div className="flex flex-col gap-6">
      <Card padding="md">
        <h2 className="mb-1 font-heading text-xl font-semibold">Add an admin</h2>
        <p className="mb-4 text-sm text-text-muted">This creates a new, separate sign-in account. Existing accounts (like shop customer accounts) can&apos;t be made admins.</p>
        <form ref={formRef} onSubmit={submit} className="flex flex-col gap-4" noValidate>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField id="team-email" label="Email" error={e.email} required>
              <Input id="team-email" name="email" type="email" autoComplete="off" invalid={Boolean(e.email)} />
            </FormField>
            <FormField id="team-password" label="Temporary password" hint="At least 12 characters with letters and numbers" error={e.password} required>
              <PasswordInput id="team-password" name="password" autoComplete="new-password" invalid={Boolean(e.password)} />
            </FormField>
          </div>
          <FormField id="team-role" label="Role">
            <Select id="team-role" name="role" value={role} onChange={(ev) => setRole(ev.target.value as AdminRole)} options={ROLE_OPTIONS} className="max-w-80" />
          </FormField>
          <PermissionBoxes idPrefix="new" role={role} initial={["orders"]} />
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" variant="secondary" loading={pending} icon={<UserPlus aria-hidden className="h-4 w-4" />}>
              Add admin
            </Button>
            <Result state={state} />
          </div>
        </form>
      </Card>

      <div className="flex flex-col gap-3">
        <h2 className="font-heading text-xl font-semibold">Team ({members.length})</h2>
        {members.map((m) => (
          <MemberRow key={m.userId} m={m} update={update} remove={remove} />
        ))}
      </div>
    </div>
  );
}
