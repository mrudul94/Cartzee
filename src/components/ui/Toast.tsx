"use client";

import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { create } from "zustand";
import { cn } from "@/lib/utils/cn";

type ToastTone = "success" | "error" | "info";
type ToastItem = { id: number; title: string; description?: string; tone: ToastTone };

const useToastStore = create<{ items: ToastItem[]; push: (t: Omit<ToastItem, "id">) => void; dismiss: (id: number) => void }>(
  (set) => ({
    items: [],
    push: (t) => {
      const id = Date.now() + Math.random();
      set((s) => ({ items: [...s.items.slice(-2), { ...t, id }] }));
      setTimeout(() => set((s) => ({ items: s.items.filter((i) => i.id !== id) })), 4000);
    },
    dismiss: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
  }),
);

/** Fire a toast from anywhere on the client: toast({ title: "Added to cart" }). */
export function toast(t: { title: string; description?: string; tone?: ToastTone }) {
  useToastStore.getState().push({ tone: "success", ...t });
}

const icons = { success: CheckCircle2, error: XCircle, info: Info };
const tones = { success: "text-success", error: "text-error", info: "text-text" };

/** Mount once in the root layout. Announces messages politely to screen readers. */
export function Toaster() {
  const { items, dismiss } = useToastStore();
  return (
    <div
      aria-live="polite"
      role="status"
      className="pointer-events-none fixed inset-x-4 bottom-24 z-toast flex flex-col items-center gap-2 md:bottom-6 md:left-auto md:right-6 md:items-end"
    >
      {items.map((t) => {
        const Glyph = icons[t.tone];
        return (
          <div
            key={t.id}
            className="pointer-events-auto flex w-full max-w-96 items-start gap-3 rounded-md border border-border bg-surface p-4 shadow-lg"
          >
            <Glyph aria-hidden className={cn("mt-0.5 h-5 w-5 shrink-0", tones[t.tone])} />
            <div className="flex-1">
              <p className="font-semibold text-text">{t.title}</p>
              {t.description && <p className="text-sm text-text-muted">{t.description}</p>}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="-m-2 inline-flex h-11 w-11 items-center justify-center rounded-md text-text-muted hover:text-text focus-visible:outline-none focus-visible:shadow-focus"
            >
              <X aria-hidden className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
