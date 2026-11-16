"use client";

import { Copy, Eye, EyeOff, PackageCheck, PackageX, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export type ProductQuickActionsProps = {
  id: string;
  title: string;
  inStock: boolean;
  isActive: boolean;
  /** null = automatic New badge */
  isNew: boolean | null;
  /** Whether the badge currently shows (automatic or manual). */
  showsNew: boolean;
  /** Orders containing this product; ordered products can't be removed (only hidden). */
  orderCount?: number;
  action: (fd: FormData) => Promise<void>;
};

/** One-click product changes from the product list (each is a tiny form → server action, logged). */
export function ProductQuickActions({ id, title, inStock, isActive, isNew, showsNew, orderCount = 0, action }: ProductQuickActionsProps) {
  const btn = (op: string, label: string, icon: React.ReactNode, extra?: React.ReactNode) => (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="op" value={op} />
      {extra}
      <Button type="submit" size="sm" variant="ghost" icon={icon} aria-label={`${label}: ${title}`} className="whitespace-nowrap">
        {label}
      </Button>
    </form>
  );
  const nextNew = isNew === null ? (showsNew ? "new-off" : "new-on") : "new-auto";
  const newLabel = isNew === null ? (showsNew ? "New: auto (on)" : "New: auto (off)") : isNew ? "New: on" : "New: off";
  return (
    <div className="flex flex-wrap justify-end gap-1">
      {inStock
        ? btn("soldout", "Sold out", <PackageX aria-hidden className="h-4 w-4" />)
        : btn("instock", "In stock", <PackageCheck aria-hidden className="h-4 w-4" />, <input type="hidden" name="restock" value="10" />)}
      {isActive ? btn("hide", "Hide", <EyeOff aria-hidden className="h-4 w-4" />) : btn("show", "Show", <Eye aria-hidden className="h-4 w-4" />)}
      <span title="Click to cycle: automatic → on/off → automatic">{btn(nextNew, newLabel, <Sparkles aria-hidden className="h-4 w-4" />)}</span>
      {btn("duplicate", "Duplicate", <Copy aria-hidden className="h-4 w-4" />)}
      <form
        action={action}
        onSubmit={(ev) => {
          if (!window.confirm(`Remove “${title}” permanently? This can't be undone.`)) ev.preventDefault();
        }}
      >
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="op" value="delete" />
        <span title={orderCount > 0 ? `In ${orderCount} order(s): can't be removed. Use Hide instead.` : undefined}>
          <Button
            type="submit"
            size="sm"
            variant="ghost"
            disabled={orderCount > 0}
            icon={<Trash2 aria-hidden className="h-4 w-4" />}
            aria-label={`Remove: ${title}`}
            className="whitespace-nowrap text-error"
          >
            Remove
          </Button>
        </span>
      </form>
    </div>
  );
}
