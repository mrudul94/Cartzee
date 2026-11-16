"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { ActionState } from "@/lib/admin/forms";

export type DeleteProductCardProps = {
  id: string;
  title: string;
  /** Orders that contain this product; when above 0 the product can only be hidden. */
  orderCount: number;
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
};

/** "Remove product" panel at the bottom of the product editor, with a confirmation step. */
export function DeleteProductCard({ id, title, orderCount, action }: DeleteProductCardProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const blocked = orderCount > 0;
  return (
    <Card padding="md" className="flex flex-col gap-3 border-error">
      <h2 className="font-heading text-lg font-semibold">Remove product</h2>
      <p className="text-sm text-text-muted">
        {blocked
          ? `This product is in ${orderCount} order(s), so it can't be removed: the order history needs it. Untick “Visible in store” (or use Hide in the product list) to take it off the shop.`
          : "Deletes the product and its reviews from the shop. This can't be undone. To take it off the shop temporarily, hide it instead."}
      </p>
      <form
        action={formAction}
        onSubmit={(ev) => {
          if (!window.confirm(`Remove “${title}” permanently? This can't be undone.`)) ev.preventDefault();
        }}
      >
        <input type="hidden" name="id" value={id} />
        <Button type="submit" variant="danger" size="sm" loading={pending} disabled={blocked} icon={<Trash2 aria-hidden className="h-4 w-4" />}>
          Remove product
        </Button>
      </form>
      {state.message && (
        <p role="alert" className="text-sm text-error">
          {state.message}
        </p>
      )}
    </Card>
  );
}
