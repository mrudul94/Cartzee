"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { QuantityStepper } from "@/components/ui/Misc";
import { toast } from "@/components/ui/Toast";

/** Stateful demos that need client-side handlers (style guide only). */
export function QuantityStepperDemo() {
  const [q, setQ] = useState(2);
  return (
    <div className="flex items-center gap-4">
      <QuantityStepper value={q} onChange={setQ} />
      <QuantityStepper value={q} onChange={setQ} size="sm" />
    </div>
  );
}

export function ToastDemo() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="outline" onClick={() => toast({ title: "Added to cart", description: "Airtight Storage Jar Set" })}>
        Success toast
      </Button>
      <Button variant="outline" onClick={() => toast({ tone: "error", title: "Payment not completed" })}>
        Error toast
      </Button>
      <Button variant="outline" onClick={() => toast({ tone: "info", title: "Prices include all taxes" })}>
        Info toast
      </Button>
    </div>
  );
}
