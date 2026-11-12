import type { ReactNode } from "react";
import { Badge, type BadgeProps } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import { ADMIN_STATUS_LABEL } from "@/lib/orders/status";
import type { OrderEvent, OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { calcMargin, formatDate, formatINR } from "@/lib/utils/format";

/* ---------------------------------------------------------------- OrderStatusBadge */

const STATUS_VARIANT: Record<OrderStatus, NonNullable<BadgeProps["variant"]>> = {
  pending_payment: "neutral",
  paid: "warning",
  placed_on_meesho: "outline",
  shipped: "dark",
  delivered: "success",
  cancelled_refunded: "error",
  return_requested: "warning",
  returned_refunded: "neutral",
};

/** Admin status pill; "needs action" states use the warning tone. */
export function OrderStatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <Badge variant={STATUS_VARIANT[status]} className={cn("normal-case tracking-normal", className)}>
      {ADMIN_STATUS_LABEL[status]}
    </Badge>
  );
}

/* ---------------------------------------------------------------- StatCard */

export function StatCard({ label, value, hint, tone = "default" }: { label: string; value: ReactNode; hint?: ReactNode; tone?: "default" | "warning" | "success" }) {
  return (
    <Card padding="md" className={cn(tone === "warning" && "border-warning", tone === "success" && "border-success")}>
      <p className="text-sm text-text-muted">{label}</p>
      <p className="mt-1 font-heading text-3xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-sm text-text-muted">{hint}</p>}
    </Card>
  );
}

/* ---------------------------------------------------------------- MarginText */

/** Margin in ₹ and %: green ≥ 25%, amber below, red when negative. */
export function MarginText({ price, cost, quantity = 1, className }: { price: number; cost: number; quantity?: number; className?: string }) {
  const m = calcMargin(price, cost);
  const tone = m.amount < 0 ? "text-error" : m.percent >= 25 ? "text-success" : "text-warning";
  return (
    <span className={cn("font-semibold", tone, className)}>
      {formatINR(m.amount * quantity)} <span className="font-regular text-sm">({m.percent}%)</span>
    </span>
  );
}

/* ---------------------------------------------------------------- CopyField */

/** Label + value + copy button: customer name, phone and address for pasting into Meesho. */
export function CopyField({ label, value, multiline = false }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border py-3 last:border-0">
      <div className="min-w-0">
        <p className="text-sm text-text-muted">{label}</p>
        <p className={cn("break-words font-medium text-text", multiline && "whitespace-pre-line")}>{value || "–"}</p>
      </div>
      {value && <CopyButton value={value} label={label} />}
    </div>
  );
}

/* ---------------------------------------------------------------- OrderTimeline */

export function OrderTimeline({ events }: { events: OrderEvent[] }) {
  return (
    <ol className="flex flex-col gap-3">
      {[...events].reverse().map((e, i) => (
        <li key={`${e.at}-${i}`} className="flex gap-3">
          <span aria-hidden className="mt-2 h-2 w-2 shrink-0 rounded-full bg-ink" />
          <div>
            <p className="font-medium">{ADMIN_STATUS_LABEL[e.status]}</p>
            <p className="text-sm text-text-muted">
              <time dateTime={e.at}>
                {formatDate(e.at)}, {new Date(e.at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })}
              </time>
              {e.note && ` · ${e.note}`}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
