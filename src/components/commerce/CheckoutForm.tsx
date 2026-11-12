"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { Input, Select } from "@/components/ui/Input";
import { toast } from "@/components/ui/Toast";
import { cartTotals, useCart } from "@/hooks/useCart";
import { useHydrated } from "@/hooks/useHydrated";
import { PaymentDismissedError, useRazorpay } from "@/hooks/useRazorpay";
import { color } from "@/design-system/tokens";
import { formatINR } from "@/lib/utils/format";
import { paths } from "@/lib/utils/paths";
import { addressSchema, INDIAN_STATES } from "@/lib/utils/validators";
import { OrderSummary } from "./OrderSummary";
import { PrepaidNotice } from "./PrepaidNotice";

type In = z.input<typeof addressSchema>;
type Out = z.output<typeof addressSchema>;

const stateOptions = INDIAN_STATES.map((s) => ({ value: s, label: s }));

/** Delivery address (RHF + Zod: Indian PIN and mobile validation) and prepaid payment. */
export function CheckoutForm() {
  const hydrated = useHydrated();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const router = useRouter();
  const openRazorpay = useRazorpay();
  const [submitting, setSubmitting] = useState(false);
  const totals = cartTotals(items);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<In, unknown, Out>({ resolver: zodResolver(addressSchema), mode: "onBlur", defaultValues: { state: "" as In["state"] } });

  const onSubmit = async (address: Out) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not place order");

      if (data.mode === "mock") {
        const pay = await fetch("/api/checkout/mock-pay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: data.orderId }),
        });
        if (!pay.ok) throw new Error("Payment failed. You have not been charged.");
      } else {
        const result = await openRazorpay(data.checkout, { color: color.primary });
        // Payment succeeded at Razorpay. Confirm fast via signature check; the webhook confirms
        // independently, so a failed verify call still lands on the success page (which polls).
        await fetch("/api/checkout/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: data.orderId, ...result }),
        }).catch(() => undefined);
      }
      clear();
      router.push(paths.orderSuccess(data.orderId));
    } catch (e) {
      const dismissed = e instanceof PaymentDismissedError;
      toast({
        tone: dismissed ? "info" : "error",
        title: dismissed ? "Payment cancelled" : "Payment not completed",
        description: e instanceof Error ? e.message : undefined,
      });
      setSubmitting(false);
    }
  };

  if (!hydrated) return <p className="py-16 text-center text-text-muted">Loading your cart…</p>;
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-lg font-semibold">Your cart is empty</p>
        <Button href={paths.bestsellers()} variant="secondary">
          Shop bestsellers
        </Button>
      </div>
    );
  }

  const field = (name: keyof In, label: string, props: Parameters<typeof Input>[0] = {}, required = true) => {
    const id = `checkout-${name}`;
    const error = errors[name]?.message;
    return (
      <FormField id={id} label={label} error={error} required={required}>
        <Input id={id} invalid={Boolean(error)} aria-describedby={error ? `${id}-desc` : undefined} {...register(name)} {...props} />
      </FormField>
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-8 lg:grid-cols-5">
      <div className="flex flex-col gap-6 lg:col-span-3">
        <Card as="fieldset" padding="md">
          <legend className="sr-only">Contact details</legend>
          <h2 className="mb-4 font-heading text-xl font-semibold">Contact</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {field("name", "Full name", { autoComplete: "name" })}
            {field("phone", "Mobile number", { autoComplete: "tel-national", inputMode: "tel", placeholder: "10-digit mobile" })}
            <div className="md:col-span-2">{field("email", "Email (for order updates)", { type: "email", autoComplete: "email" })}</div>
          </div>
        </Card>
        <Card as="fieldset" padding="md">
          <legend className="sr-only">Delivery address</legend>
          <h2 className="mb-4 font-heading text-xl font-semibold">Delivery address</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">{field("line1", "House no., building, street", { autoComplete: "address-line1" })}</div>
            <div className="md:col-span-2">{field("line2", "Area, locality (optional)", { autoComplete: "address-line2" }, false)}</div>
            {field("landmark", "Landmark (optional)", {}, false)}
            {field("pincode", "PIN code", { inputMode: "numeric", autoComplete: "postal-code", maxLength: 6 })}
            {field("city", "City / Town", { autoComplete: "address-level2" })}
            <FormField id="checkout-state" label="State" error={errors.state?.message} required>
              <Select
                id="checkout-state"
                placeholder="Select state"
                options={stateOptions}
                invalid={Boolean(errors.state)}
                autoComplete="address-level1"
                {...register("state")}
              />
            </FormField>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card padding="md" className="flex flex-col gap-4 lg:sticky lg:top-24">
          <h2 className="font-heading text-xl font-semibold">Your order</h2>
          <ul className="flex flex-col gap-3">
            {items.map((i) => (
              <li key={i.productId} className="flex items-center gap-3">
                <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-background">
                  <Image src={i.image} alt="" fill sizes="56px" className="object-cover" />
                </span>
                <span className="flex-1 text-sm">
                  {i.title} <span className="text-text-muted">× {i.quantity}</span>
                </span>
                <span className="text-sm font-semibold">{formatINR(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <OrderSummary subtotal={totals.subtotal} shipping={totals.shipping} total={totals.total} savings={totals.savings} />
          <PrepaidNotice />
          <Button type="submit" size="lg" fullWidth loading={submitting} icon={<Lock aria-hidden className="h-4 w-4" />}>
            Pay {formatINR(totals.total)} securely
          </Button>
          <p className="text-center text-sm text-text-muted">
            By placing this order you agree to our{" "}
            <a className="underline" href={paths.policy("terms")}>
              terms
            </a>{" "}
            and{" "}
            <a className="underline" href={paths.policy("returns")}>
              return policy
            </a>
            .
          </p>
        </Card>
      </div>
    </form>
  );
}
