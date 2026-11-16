"use client";

import { useActionState, useState } from "react";
import { RotateCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { Select, Textarea } from "@/components/ui/Input";
import { CANCEL_REASONS, RETURN_REASONS } from "@/lib/orders/status";
import { formatDate } from "@/lib/utils/format";

type State = { ok?: boolean; message?: string };
type Action = (prev: State, fd: FormData) => Promise<State>;

export type OrderSelfServiceProps = {
  orderId: string;
  options: { cancel: boolean; requestCancel: boolean; cancelRequested: boolean; requestReturn: boolean; returnUntil: string | null };
  cancel: Action;
  requestCancel: Action;
  requestReturn: Action;
};

function ReasonForm({ orderId, kind, action, onClose }: { orderId: string; kind: "cancel" | "requestCancel" | "return"; action: Action; onClose: () => void }) {
  const [state, formAction, pending] = useActionState(action, {});
  const reasons = kind === "return" ? RETURN_REASONS : CANCEL_REASONS;
  const copy = {
    cancel: { title: "Cancel this order", note: "It hasn't been packed yet, so it's cancelled straight away and refunded in full.", submit: "Cancel order" },
    requestCancel: { title: "Request cancellation", note: "Your order is already being packed. We'll try to stop it and refund you in full if it hasn't shipped.", submit: "Send request" },
    return: { title: "Request a return", note: "Returns are for damaged, wrong, defective or incomplete items. Keep the item and its packaging; we may ask for photos.", submit: "Request return" },
  }[kind];
  if (state.ok) {
    return (
      <p role="status" className="rounded-md bg-success-soft p-3 text-sm text-success">
        {state.message}
      </p>
    );
  }
  return (
    <form
      action={formAction}
      className="flex flex-col gap-3"
      onSubmit={(ev) => {
        if (kind === "cancel" && !window.confirm("Cancel this order? This can't be undone.")) ev.preventDefault();
      }}
    >
      <h3 className="font-heading text-lg font-semibold">{copy.title}</h3>
      <p className="text-sm text-text-muted">{copy.note}</p>
      <input type="hidden" name="orderId" value={orderId} />
      <FormField id={`${kind}-reason`} label="Reason" required>
        <Select id={`${kind}-reason`} name="reason" defaultValue="" placeholder="Choose a reason" options={reasons.map((r) => ({ value: r, label: r }))} />
      </FormField>
      <FormField id={`${kind}-details`} label="Anything else? (optional)">
        <Textarea id={`${kind}-details`} name="details" rows={2} maxLength={500} />
      </FormField>
      {state.message && (
        <p role="alert" className="text-sm text-error">
          {state.message}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant={kind === "return" ? "secondary" : "danger"} loading={pending}>
          {copy.submit}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          Keep my order
        </Button>
      </div>
    </form>
  );
}

/** Shopper's own order: cancel (before packing), request cancellation (while packing) or request a return (after delivery). */
export function OrderSelfService({ orderId, options, cancel, requestCancel, requestReturn }: OrderSelfServiceProps) {
  const [open, setOpen] = useState<"cancel" | "requestCancel" | "return" | null>(null);
  const close = () => setOpen(null);
  if (!options.cancel && !options.requestCancel && !options.requestReturn && !options.cancelRequested) return null;
  return (
    <Card padding="md" className="flex flex-col gap-3">
      {options.cancelRequested && (
        <p role="status" className="text-sm text-text">
          <strong>Cancellation requested.</strong> We&apos;re trying to stop this order and will email you once it&apos;s sorted.
        </p>
      )}
      {open ? (
        <ReasonForm orderId={orderId} kind={open} action={open === "cancel" ? cancel : open === "requestCancel" ? requestCancel : requestReturn} onClose={close} />
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          {options.cancel && (
            <Button variant="outline" icon={<XCircle aria-hidden className="h-4 w-4" />} onClick={() => setOpen("cancel")}>
              Cancel order
            </Button>
          )}
          {options.requestCancel && (
            <Button variant="outline" icon={<XCircle aria-hidden className="h-4 w-4" />} onClick={() => setOpen("requestCancel")}>
              Request cancellation
            </Button>
          )}
          {options.requestReturn && (
            <>
              <Button variant="outline" icon={<RotateCcw aria-hidden className="h-4 w-4" />} onClick={() => setOpen("return")}>
                Request a return
              </Button>
              {options.returnUntil && <span className="text-sm text-text-muted">Return available until {formatDate(options.returnUntil)}</span>}
            </>
          )}
        </div>
      )}
    </Card>
  );
}
