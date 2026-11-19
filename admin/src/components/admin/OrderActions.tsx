"use client";

import { keepFormValues } from "@/hooks/useKeepFormValues";
import { useActionState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { FormField } from "@/components/ui/FormField";
import { Input, Textarea } from "@/components/ui/Input";
import type { ActionState } from "@/lib/admin/forms";
import { ACTION_LABEL } from "@/lib/orders/status";
import type { OrderStatus } from "@/lib/types";

export type OrderActionsProps = {
  orderId: string;
  /** Allowed next statuses (from adminTransitions). */
  next: OrderStatus[];
  defaults: { meeshoOrderId?: string; meeshoCost?: number; trackingUrl?: string };
  canRefund: boolean;
  whatsappHref: string;
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
};

const DESTRUCTIVE: OrderStatus[] = ["cancelled_refunded", "returned_refunded"];

/**
 * Fulfilment form: Meesho order ID + cost, courier tracking link, internal note, and one
 * submit button per allowed status. Each change logs an event and emails the customer.
 */
export function OrderActions({ orderId, next, defaults, canRefund, whatsappHref, action }: OrderActionsProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const e = state.errors ?? {};

  if (next.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-text-muted">This order is closed. No further status changes.</p>
        <Button href={whatsappHref} variant="outline" icon={<MessageCircle aria-hidden className="h-4 w-4" />} className="self-start">
          Message customer on WhatsApp
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} onSubmit={keepFormValues(formAction)} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="orderId" value={orderId} />
      <div className="grid gap-4 md:grid-cols-2">
        <FormField id="meeshoOrderId" label="Meesho order ID" error={e.meeshoOrderId} hint="From Meesho → My Orders after placing the order">
          <Input id="meeshoOrderId" name="meeshoOrderId" defaultValue={defaults.meeshoOrderId} invalid={Boolean(e.meeshoOrderId)} />
        </FormField>
        <FormField id="meeshoCost" label="Paid on Meesho (₹)" error={e.meeshoCost}>
          <Input id="meeshoCost" name="meeshoCost" inputMode="decimal" defaultValue={defaults.meeshoCost} invalid={Boolean(e.meeshoCost)} />
        </FormField>
        <FormField id="trackingUrl" label="Courier tracking link" error={e.trackingUrl} className="md:col-span-2">
          <Input id="trackingUrl" name="trackingUrl" type="url" placeholder="https://…" defaultValue={defaults.trackingUrl} invalid={Boolean(e.trackingUrl)} />
        </FormField>
        <FormField id="note" label="Internal note (optional)" className="md:col-span-2">
          <Textarea id="note" name="note" rows={2} />
        </FormField>
      </div>
      {canRefund && next.some((s) => DESTRUCTIVE.includes(s)) && (
        <div>
          <Checkbox id="refund" name="refund" defaultChecked label="Refund the full amount via Razorpay when cancelling or closing a return" />
          <p className="text-sm text-text-muted">Untick to refund manually from the Razorpay dashboard.</p>
        </div>
      )}
      {state.message && (
        <p role={state.ok ? "status" : "alert"} className={state.ok ? "rounded-md bg-success-soft p-3 text-sm text-success" : "rounded-md bg-error-soft p-3 text-sm text-error"}>
          {state.message}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {next.map((s) => (
          <Button
            key={s}
            type="submit"
            name="to"
            value={s}
            variant={DESTRUCTIVE.includes(s) ? "outline" : "secondary"}
            className={DESTRUCTIVE.includes(s) ? "text-error" : undefined}
            disabled={pending}
            onClick={(ev) => {
              if (DESTRUCTIVE.includes(s) && !window.confirm(`${ACTION_LABEL[s]}? The customer will be emailed.`)) ev.preventDefault();
            }}
          >
            {ACTION_LABEL[s] ?? s}
          </Button>
        ))}
        <Button href={whatsappHref} variant="outline" icon={<MessageCircle aria-hidden className="h-4 w-4" />}>
          WhatsApp customer
        </Button>
      </div>
    </form>
  );
}
