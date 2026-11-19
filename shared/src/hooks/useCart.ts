"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { shippingFor, type DeliveryRules } from "@/lib/utils/delivery";

export type CartLine = {
  productId: string;
  slug: string;
  path: string;
  title: string;
  image: string;
  /** Display price only — the server re-prices every order from the catalogue. */
  price: number;
  mrp: number;
  quantity: number;
  maxQty: number;
  /** Chosen clothing size; the same product in two sizes is two lines. */
  size?: string;
};

/** Identifies a cart line: product + size. */
export const lineKey = (l: Pick<CartLine, "productId" | "size">) => (l.size ? `${l.productId}::${l.size}` : l.productId);

type CartState = {
  items: CartLine[];
  isOpen: boolean;
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  /** `key` is lineKey(line) (product id, plus "::size" for sized items). */
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  setOpen: (open: boolean) => void;
};

const MAX_PER_LINE = 10;

/** Cart store persisted to localStorage (items only). */
export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      add: (line, quantity = 1) =>
        set((s) => {
          const cap = Math.min(MAX_PER_LINE, line.maxQty);
          const key = lineKey(line);
          const existing = s.items.find((i) => lineKey(i) === key);
          if (existing) {
            return {
              items: s.items.map((i) => (lineKey(i) === key ? { ...i, ...line, quantity: Math.min(cap, i.quantity + quantity) } : i)),
            };
          }
          return { items: [...s.items, { ...line, quantity: Math.min(cap, quantity) }] };
        }),
      setQuantity: (key, quantity) =>
        set((s) => ({
          items: s.items.map((i) => (lineKey(i) === key ? { ...i, quantity: Math.max(1, Math.min(Math.min(MAX_PER_LINE, i.maxQty), quantity)) } : i)),
        })),
      remove: (key) => set((s) => ({ items: s.items.filter((i) => lineKey(i) !== key) })),
      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      setOpen: (isOpen) => set({ isOpen }),
    }),
    {
      name: "cartzee-cart",
      version: 1,
      storage: createJSONStorage(() => {
        try {
          return localStorage;
        } catch {
          return { getItem: () => null, setItem: () => {}, removeItem: () => {} };
        }
      }),
      partialize: (s) => ({ items: s.items }),
    },
  ),
);

/** Derived totals; pass `items` from useCart and `useSettings().delivery`. */
export function cartTotals(items: CartLine[], delivery: DeliveryRules) {
  const count = items.reduce((n, i) => n + i.quantity, 0);
  const subtotal = items.reduce((n, i) => n + i.price * i.quantity, 0);
  const mrpTotal = items.reduce((n, i) => n + i.mrp * i.quantity, 0);
  const shipping = shippingFor(subtotal, delivery);
  return { count, subtotal, mrpTotal, savings: Math.max(0, mrpTotal - subtotal), shipping, total: subtotal + shipping };
}
