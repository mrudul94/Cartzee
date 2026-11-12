"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { CheckCircle2, Circle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { TRACKING_STEPS, STATUS_LABEL } from "@/lib/orders/status";
import type { OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { formatDate, formatINR } from "@/lib/utils/format";
import { trackOrderSchema } from "@/lib/utils/validators";

type In = z.input<typeof trackOrderSchema>;
type Out = z.output<typeof trackOrderSchema>;
type Result = {
  number: string;
  status: OrderStatus;
  statusLabel: string;
  createdAt: string;
  total: number;
  trackingUrl: string | null;
  items: { title: string; quantity: number; path: string }[];
  events: { status: OrderStatus; label: string; at: string }[];
};

/** Order number + phone lookup (no login) with a status timeline. */
export function TrackOrderForm({ defaultOrder = "" }: { defaultOrder?: string }) {
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<In, unknown, Out>({ resolver: zodResolver(trackOrderSchema), defaultValues: { orderNumber: defaultOrder } });

  const onSubmit = async (v: Out) => {
    setError(null);
    const res = await fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(v) });
    const data = await res.json();
    if (!res.ok) {
      setResult(null);
      setError(data.error ?? "Something went wrong");
      return;
    }
    setResult(data);
  };

  const reached = (s: OrderStatus) => result?.events.find((e) => e.status === s);
  const offPath = result && !TRACKING_STEPS.includes(result.status) && result.status !== "pending_payment";

  return (
    <div className="flex flex-col gap-6">
      <Card padding="md">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 md:grid-cols-3 md:items-end">
          <FormField id="track-order" label="Order number" error={errors.orderNumber?.message} required>
            <Input id="track-order" placeholder="e.g. CS1001" autoCapitalize="characters" invalid={Boolean(errors.orderNumber)} {...register("orderNumber")} />
          </FormField>
          <FormField id="track-phone" label="Mobile number used at checkout" error={errors.phone?.message} required>
            <Input id="track-phone" inputMode="tel" autoComplete="tel-national" invalid={Boolean(errors.phone)} {...register("phone")} />
          </FormField>
          <Button type="submit" variant="secondary" loading={isSubmitting} className="md:mb-0">
            Track order
          </Button>
        </form>
      </Card>

      <div aria-live="polite">
        {error && <p className="rounded-md bg-error-soft p-4 text-error">{error}</p>}
        {result && (
          <Card padding="md" className="flex flex-col gap-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-heading text-2xl font-semibold">Order {result.number}</h2>
              <p className="text-text-muted">
                Placed {formatDate(result.createdAt)} · {formatINR(result.total)}
              </p>
            </div>
            <p className="text-lg">
              Status: <strong>{result.statusLabel}</strong>
            </p>
            {offPath ? (
              <p className="text-text-muted">If you have questions about this order, contact customer care with your order number.</p>
            ) : (
              <ol className="grid gap-4 md:grid-cols-4">
                {TRACKING_STEPS.map((s) => {
                  const ev = reached(s);
                  return (
                    <li key={s} className={cn("flex items-start gap-3 md:flex-col", !ev && "text-text-muted")}>
                      {ev ? <CheckCircle2 aria-hidden className="h-6 w-6 text-success" /> : <Circle aria-hidden className="h-6 w-6" />}
                      <span>
                        <span className="block font-semibold">{STATUS_LABEL[s]}</span>
                        {ev && <span className="text-sm text-text-muted">{formatDate(ev.at)}</span>}
                        <span className="sr-only">{ev ? "completed" : "pending"}</span>
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}
            {result.trackingUrl && (
              <Button href={result.trackingUrl} variant="outline" icon={<ExternalLink aria-hidden className="h-4 w-4" />} iconPosition="right" className="self-start">
                Track with courier
              </Button>
            )}
            <ul className="flex flex-col gap-1 border-t border-border pt-4">
              {result.items.map((i) => (
                <li key={i.path}>
                  <Link href={i.path} className="hover:underline">
                    {i.title}
                  </Link>{" "}
                  <span className="text-text-muted">× {i.quantity}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
