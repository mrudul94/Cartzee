"use client";

import { useActionState, useEffect, useState } from "react";
import { MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { FormField } from "@/components/ui/FormField";
import { Input, Select } from "@/components/ui/Input";
import { MAX_SAVED_ADDRESSES, type SavedAddress } from "@/lib/account";
import { INDIAN_STATES } from "@/lib/utils/validators";

type State = { ok?: boolean; message?: string; errors?: Record<string, string> };
type Action = (prev: State, fd: FormData) => Promise<State>;

export type AddressBookProps = { addresses: SavedAddress[]; save: Action; remove: Action; makeDefault: Action };

const STATE_OPTIONS = INDIAN_STATES.map((s) => ({ value: s, label: s }));

function Notice({ state }: { state: State }) {
  if (!state.message) return null;
  return (
    <p role={state.ok ? "status" : "alert"} className={state.ok ? "text-sm text-success" : "text-sm text-error"}>
      {state.message}
    </p>
  );
}

function AddressForm({ address, save, onDone }: { address?: SavedAddress; save: Action; onDone: () => void }) {
  const [state, action, pending] = useActionState(save, {});
  const e = state.errors ?? {};
  const p = address?.id ?? "new";
  useEffect(() => {
    if (state.ok) onDone();
  }, [state, onDone]);
  const field = (name: keyof SavedAddress, label: string, opts: { required?: boolean; autoComplete?: string; inputMode?: "tel" | "numeric"; hint?: string } = {}) => (
    <FormField id={`${p}-${name}`} label={label} error={e[name]} required={opts.required} hint={opts.hint}>
      <Input id={`${p}-${name}`} name={name} defaultValue={String(address?.[name] ?? "")} autoComplete={opts.autoComplete} inputMode={opts.inputMode} invalid={Boolean(e[name])} />
    </FormField>
  );
  return (
    <Card padding="md">
      <form action={action} className="flex flex-col gap-4" noValidate>
        <input type="hidden" name="id" value={address?.id ?? ""} />
        <h3 className="font-heading text-lg font-semibold">{address ? "Edit address" : "Add a new address"}</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {field("name", "Full name", { required: true, autoComplete: "name" })}
          {field("phone", "Mobile number", { required: true, autoComplete: "tel-national", inputMode: "tel" })}
          <div className="md:col-span-2">{field("line1", "House no., building, street", { required: true, autoComplete: "address-line1" })}</div>
          <div className="md:col-span-2">{field("line2", "Area, locality (optional)", { autoComplete: "address-line2" })}</div>
          {field("landmark", "Landmark (optional)")}
          {field("city", "City", { required: true, autoComplete: "address-level2" })}
          <FormField id={`${p}-state`} label="State" error={e.state} required>
            <Select id={`${p}-state`} name="state" defaultValue={address?.state ?? ""} placeholder="Select state" options={STATE_OPTIONS} invalid={Boolean(e.state)} />
          </FormField>
          {field("pincode", "PIN code", { required: true, autoComplete: "postal-code", inputMode: "numeric" })}
          {field("label", "Label (optional)", { hint: "e.g. Home, Office" })}
        </div>
        <Checkbox id={`${p}-default`} name="isDefault" label="Use as my default address" defaultChecked={address?.isDefault} />
        <Notice state={state} />
        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="secondary" loading={pending}>
            Save address
          </Button>
          <Button type="button" variant="ghost" onClick={onDone}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}

function AddressCard({ a, onEdit, remove, makeDefault }: { a: SavedAddress; onEdit: () => void; remove: Action; makeDefault: Action }) {
  const [rState, rAction, rPending] = useActionState(remove, {});
  const [dState, dAction, dPending] = useActionState(makeDefault, {});
  return (
    <Card padding="md" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <MapPin aria-hidden className="h-5 w-5 text-text-muted" />
        <span className="font-semibold">{a.name}</span>
        {a.label && <Badge variant="outline">{a.label}</Badge>}
        {a.isDefault && <Badge variant="success">Default</Badge>}
      </div>
      <p className="text-text">
        {[a.line1, a.line2, a.landmark].filter(Boolean).join(", ")}
        <br />
        {a.city}, {a.state} {a.pincode}
        <br />
        <span className="text-text-muted">Mobile: {a.phone}</span>
      </p>
      <div className="flex flex-wrap gap-1">
        <Button type="button" size="sm" variant="ghost" icon={<Pencil aria-hidden className="h-4 w-4" />} onClick={onEdit}>
          Edit
        </Button>
        {!a.isDefault && (
          <form action={dAction}>
            <input type="hidden" name="id" value={a.id} />
            <Button type="submit" size="sm" variant="ghost" loading={dPending} icon={<Star aria-hidden className="h-4 w-4" />}>
              Make default
            </Button>
          </form>
        )}
        <form
          action={rAction}
          onSubmit={(ev) => {
            if (!window.confirm("Delete this address?")) ev.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={a.id} />
          <Button type="submit" size="sm" variant="ghost" loading={rPending} icon={<Trash2 aria-hidden className="h-4 w-4" />} className="text-error">
            Delete
          </Button>
        </form>
      </div>
      <Notice state={rState.message ? rState : dState} />
    </Card>
  );
}

/** My account → Saved addresses: add, edit, delete and choose the default (prefilled at checkout). */
export function AddressBook({ addresses, save, remove, makeDefault }: AddressBookProps) {
  const [editing, setEditing] = useState<string | "new" | null>(addresses.length === 0 ? "new" : null);
  const done = () => setEditing(null);
  const full = addresses.length >= MAX_SAVED_ADDRESSES;
  return (
    <div className="flex flex-col gap-4">
      {editing === "new" ? (
        <AddressForm save={save} onDone={done} />
      ) : (
        <Button type="button" variant="outline" className="self-start" disabled={full} icon={<Plus aria-hidden className="h-4 w-4" />} onClick={() => setEditing("new")}>
          {full ? `Address book full (${MAX_SAVED_ADDRESSES})` : "Add a new address"}
        </Button>
      )}
      {addresses.length === 0 && editing !== "new" && <p className="text-text-muted">You haven&apos;t saved an address yet.</p>}
      <ul className="grid gap-4 md:grid-cols-2">
        {addresses.map((a) => (
          <li key={a.id} className={editing === a.id ? "md:col-span-2" : undefined}>
            {editing === a.id ? (
              <AddressForm address={a} save={save} onDone={done} />
            ) : (
              <AddressCard a={a} onEdit={() => setEditing(a.id)} remove={remove} makeDefault={makeDefault} />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
