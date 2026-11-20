"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Copy, Eye, EyeOff, PackageCheck, PackageX, Sparkles, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ChipNav } from "@/components/ui/ChipNav";
import { Input } from "@/components/ui/Input";
import { toast } from "@/components/ui/Toast";
import { isProductNew } from "@/lib/utils/product";

/* ------------------------------------------------------------------ shared list state */

export type QuickOp = "soldout" | "instock" | "show" | "hide" | "new-auto" | "new-on" | "new-off" | "position";
/** What the list shows per product; createdAt decides the automatic New badge. */
export type QuickRow = { stock: number; isActive: boolean; isNew: boolean | null; position: number | null; createdAt: string };
type Saved = { id: string; stock: number; isActive: boolean; isNew: boolean | null; position: number | null };
export type QuickAction = (id: string, op: QuickOp, value?: number | null) => Promise<{ ok: true; product: Saved } | { ok: false; message: string }>;

type Ctx = { rows: Record<string, QuickRow>; pending: Record<string, boolean>; run: (id: string, op: QuickOp, value?: number | null) => void };
const QuickCtx = createContext<Ctx | null>(null);
const useQuickCtx = () => {
  const c = useContext(QuickCtx);
  if (!c) throw new Error("Wrap the product list in <ProductQuickProvider>");
  return c;
};

/** The change a click makes, applied on screen before the server answers. */
function applyOp(r: QuickRow, op: QuickOp, value?: number | null): QuickRow {
  switch (op) {
    case "soldout":
      return { ...r, stock: 0 };
    case "instock":
      return { ...r, stock: value ?? 10 };
    case "show":
      return { ...r, isActive: true };
    case "hide":
      return { ...r, isActive: false };
    case "new-on":
      return { ...r, isNew: true };
    case "new-off":
      return { ...r, isNew: false };
    case "new-auto":
      return { ...r, isNew: null };
    case "position":
      return { ...r, position: value ?? null };
  }
}

/**
 * Product list state for quick actions: each click updates the row and the filter counts at once
 * (optimistic), sends one small request, then settles on the saved values the server returns.
 * A failed request rolls the row back and shows an error toast. Buttons for a product are disabled
 * (with a spinner) while its request is in flight, and an older response never overwrites a newer change.
 */
export function ProductQuickProvider({ rows: initial, action, children }: { rows: Record<string, QuickRow>; action: QuickAction; children: ReactNode }) {
  const [rows, setRows] = useState(initial);
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const latest = useRef<Record<string, number>>({});
  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  // Fresh data from the server (e.g. after a filter change or reload) replaces local state.
  useEffect(() => setRows(initial), [initial]);

  const run = useCallback(
    async (id: string, op: QuickOp, value?: number | null) => {
      const before = rowsRef.current[id];
      if (!before) return;
      const req = (latest.current[id] ?? 0) + 1;
      latest.current[id] = req;
      setRows((all) => ({ ...all, [id]: applyOp(all[id] ?? before, op, value) }));
      setPending((p) => ({ ...p, [id]: true }));
      let res: Awaited<ReturnType<QuickAction>>;
      try {
        res = await action(id, op, value ?? null);
      } catch {
        res = { ok: false, message: "No connection to the server. The change was not saved." };
      }
      if (latest.current[id] !== req) return; // a newer change for this product is in charge
      setPending((p) => ({ ...p, [id]: false }));
      if (res.ok) {
        const { stock, isActive, isNew, position } = res.product;
        setRows((all) => ({ ...all, [id]: { ...(all[id] ?? before), stock, isActive, isNew, position } }));
      } else {
        setRows((all) => ({ ...all, [id]: before }));
        toast({ tone: "error", title: "Not saved", description: res.message });
      }
    },
    [action],
  );

  return <QuickCtx.Provider value={{ rows, pending, run }}>{children}</QuickCtx.Provider>;
}

/* ------------------------------------------------------------------ pieces of the list */

/** Filter chips with live counts (sold out / hidden change the moment a button is clicked). */
export function QuickFilterChips({ hrefs, active, staleCount }: { hrefs: Record<"all" | "stale" | "soldout" | "hidden", string>; active: string; staleCount: number }) {
  const { rows } = useQuickCtx();
  const list = Object.values(rows);
  return (
    <ChipNav
      label="Filter products"
      chips={[
        { label: "All", href: hrefs.all, active: active === "all", count: list.length },
        { label: "Price check due", href: hrefs.stale, active: active === "stale", count: staleCount },
        { label: "Sold out", href: hrefs.soldout, active: active === "soldout", count: list.filter((r) => r.stock === 0).length },
        { label: "Hidden", href: hrefs.hidden, active: active === "hidden", count: list.filter((r) => !r.isActive).length },
      ]}
    />
  );
}

/** Status badges under the product name. */
export function QuickBadges({ id, isBestseller, isFlashSale, isDemo = false }: { id: string; isBestseller: boolean; isFlashSale: boolean; isDemo?: boolean }) {
  const r = useQuickCtx().rows[id];
  if (!r) return null;
  return (
    <span className="mt-1 flex flex-wrap gap-1">
      {isDemo && <Badge variant="warning">Demo</Badge>}
      {!r.isActive && <Badge variant="neutral">Hidden</Badge>}
      {isBestseller && <Badge variant="outline">Bestseller</Badge>}
      {isFlashSale && <Badge variant="sale">Flash sale</Badge>}
      {isProductNew(r) && <Badge variant="success">New</Badge>}
      {r.stock === 0 && <Badge variant="dark">Sold out</Badge>}
    </span>
  );
}

/** Stock number (red when sold out). */
export function QuickStock({ id }: { id: string }) {
  const r = useQuickCtx().rows[id];
  return <span className={r?.stock === 0 ? "font-semibold text-error" : undefined}>{r?.stock ?? 0}</span>;
}

/** Position box: Enter or Set saves; empty = automatic. */
export function QuickPosition({ id, title }: { id: string; title: string }) {
  const { rows, pending, run } = useQuickCtx();
  const saved = rows[id]?.position ?? null;
  const [text, setText] = useState(saved === null ? "" : String(saved));
  useEffect(() => setText(saved === null ? "" : String(saved)), [saved]);
  const save = () => {
    const raw = text.trim();
    const n = Number(raw);
    if (raw !== "" && (!Number.isInteger(n) || n < 1 || n > 9999)) {
      toast({ tone: "error", title: "Position not saved", description: "Use a whole number from 1 to 9999, or leave it empty for automatic." });
      return;
    }
    const next = raw === "" ? null : n;
    if (next !== saved) run(id, "position", next);
  };
  return (
    <form
      className="flex items-center justify-end gap-1"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <label htmlFor={`pos-${id}`} className="sr-only">
        Position of {title}
      </label>
      <Input id={`pos-${id}`} size="sm" type="number" inputMode="numeric" min={1} max={9999} value={text} onChange={(e) => setText(e.target.value)} placeholder="Auto" className="w-20" />
      <Button type="submit" size="sm" variant="ghost" loading={pending[id]}>
        Set
      </Button>
    </form>
  );
}

export type ProductQuickActionsProps = {
  id: string;
  title: string;
  /** Orders containing this product; ordered products can't be removed (only hidden). */
  orderCount?: number;
  /** Server action for Duplicate / Remove (they navigate, so they stay form posts). */
  action: (fd: FormData) => Promise<void>;
};

/** One-click product changes in a list row: sold out / in stock, hide / show, New badge, duplicate, remove. */
export function ProductQuickActions({ id, title, orderCount = 0, action }: ProductQuickActionsProps) {
  const { rows, pending, run } = useQuickCtx();
  const r = rows[id];
  if (!r) return null;
  const busy = Boolean(pending[id]);
  const quick = (op: QuickOp, label: string, icon: ReactNode, value?: number) => (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      icon={icon}
      loading={busy}
      onClick={() => run(id, op, value)}
      aria-label={`${label}: ${title}`}
      className="whitespace-nowrap"
    >
      {label}
    </Button>
  );
  const showsNew = isProductNew(r);
  const nextNew: QuickOp = r.isNew === null ? (showsNew ? "new-off" : "new-on") : "new-auto";
  const newLabel = r.isNew === null ? (showsNew ? "New: auto (on)" : "New: auto (off)") : r.isNew ? "New: on" : "New: off";
  return (
    <div className="flex flex-wrap justify-end gap-1" aria-busy={busy || undefined}>
      {r.stock > 0 ? quick("soldout", "Sold out", <PackageX aria-hidden className="h-4 w-4" />) : quick("instock", "In stock", <PackageCheck aria-hidden className="h-4 w-4" />, 10)}
      {r.isActive ? quick("hide", "Hide", <EyeOff aria-hidden className="h-4 w-4" />) : quick("show", "Show", <Eye aria-hidden className="h-4 w-4" />)}
      <span title="Click to cycle: automatic → on/off → automatic">{quick(nextNew, newLabel, <Sparkles aria-hidden className="h-4 w-4" />)}</span>
      <form action={action}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="op" value="duplicate" />
        <Button type="submit" size="sm" variant="ghost" disabled={busy} icon={<Copy aria-hidden className="h-4 w-4" />} aria-label={`Duplicate: ${title}`} className="whitespace-nowrap">
          Duplicate
        </Button>
      </form>
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
            disabled={orderCount > 0 || busy}
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
