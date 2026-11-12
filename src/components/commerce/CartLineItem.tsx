"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { QuantityStepper } from "@/components/ui/Misc";
import { useCart, type CartLine } from "@/hooks/useCart";
import { cn } from "@/lib/utils/cn";
import { formatINR } from "@/lib/utils/format";

export type CartLineItemProps = { line: CartLine; size?: "sm" | "md"; className?: string };

/** One cart row: thumbnail, title link, unit price, quantity stepper, remove. */
export function CartLineItem({ line, size = "sm", className }: CartLineItemProps) {
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const close = useCart((s) => s.close);
  return (
    <li className={cn("flex gap-3 py-4", className)}>
      <div className={cn("relative shrink-0 overflow-hidden rounded-md bg-background", size === "sm" ? "h-20 w-20" : "h-24 w-24")}>
        <Image src={line.image} alt="" fill sizes="96px" className="object-cover" />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <Link href={line.path} onClick={close} className="line-clamp-2 text-base font-medium text-text hover:underline">
          {line.title}
        </Link>
        <p className="text-sm text-text-muted">
          <span className="font-semibold text-text">{formatINR(line.price)}</span>
          {line.mrp > line.price && <s className="ml-2">{formatINR(line.mrp)}</s>}
        </p>
        <div className="flex items-center justify-between gap-2">
          <QuantityStepper
            size="sm"
            value={line.quantity}
            max={Math.min(10, line.maxQty)}
            onChange={(q) => setQuantity(line.productId, q)}
            label={`Quantity for ${line.title}`}
          />
          <button
            type="button"
            onClick={() => remove(line.productId)}
            className="inline-flex h-11 items-center gap-1 px-2 text-sm text-text-muted hover:text-error focus-visible:outline-none focus-visible:shadow-focus"
            aria-label={`Remove ${line.title}`}
          >
            <Trash2 aria-hidden className="h-4 w-4" /> Remove
          </button>
        </div>
      </div>
    </li>
  );
}
