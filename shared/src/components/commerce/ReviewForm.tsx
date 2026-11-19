"use client";

import { useActionState, useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input, Textarea } from "@/components/ui/Input";
import { cn } from "@/lib/utils/cn";

type State = { ok?: boolean; message?: string; errors?: Record<string, string> };

export type ReviewFormProps = {
  orderId: string;
  productId: string;
  productTitle: string;
  action: (prev: State, fd: FormData) => Promise<State>;
};

const WORDS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

/** Star rating + title + review for one delivered item (verified purchase, shown after approval). */
export function ReviewForm({ orderId, productId, productTitle, action }: ReviewFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const e = state.errors ?? {};
  const id = `rv-${productId}`;

  if (state.ok) {
    return (
      <p role="status" className="rounded-md bg-success-soft p-3 text-sm text-success">
        {state.message}
      </p>
    );
  }
  const shown = hover || rating;
  return (
    <form action={formAction} className="flex flex-col gap-3" noValidate>
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="productId" value={productId} />
      <fieldset>
        <legend className="mb-1 text-sm font-medium">
          Your rating for {productTitle} <span className="text-error">*</span>
        </legend>
        <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer" onMouseEnter={() => setHover(n)}>
              <input type="radio" name="rating" value={n} checked={rating === n} onChange={() => setRating(n)} className="peer sr-only" />
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-md peer-focus-visible:shadow-focus">
                <Star aria-hidden className={cn("h-8 w-8", n <= shown ? "text-warning" : "text-border-strong")} fill="currentColor" strokeWidth={0} />
              </span>
              <span className="sr-only">
                {n} star{n > 1 ? "s" : ""}, {WORDS[n]}
              </span>
            </label>
          ))}
          <span className="ml-2 text-sm text-text-muted" aria-live="polite">
            {WORDS[shown]}
          </span>
        </div>
        {e.rating && (
          <p role="alert" className="mt-1 text-sm text-error">
            {e.rating}
          </p>
        )}
      </fieldset>
      <FormField id={`${id}-title`} label="Title (optional)" error={e.title}>
        <Input id={`${id}-title`} name="title" maxLength={120} placeholder="e.g. Sturdy and easy to clean" invalid={Boolean(e.title)} />
      </FormField>
      <FormField id={`${id}-body`} label="Your review" hint="How is the quality, size and finish? Would you recommend it?" error={e.body} required>
        <Textarea id={`${id}-body`} name="body" rows={4} maxLength={2000} invalid={Boolean(e.body)} />
      </FormField>
      {state.message && (
        <p role="alert" className="text-sm text-error">
          {state.message}
        </p>
      )}
      <Button type="submit" variant="secondary" loading={pending} className="self-start">
        Submit review
      </Button>
    </form>
  );
}
