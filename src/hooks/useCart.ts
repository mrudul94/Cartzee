"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { shippingFor } from "@/lib/utils/delivery";

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
};

type CartState = {
  items: CartLine[];
  isOpen: boolean;
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
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
          const existing = s.items.find((i) => i.productId === line.productId);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.productId === line.productId ? { ...i, ...line, quantity: Math.min(cap, i.quantity + quantity) } : i,
              ),
            };
          }
          return { items: [...s.items, { ...line, quantity: Math.min(cap, quantity) }] };
        }),
      setQuantity: (productId, quantity) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.productId === productId ? { ...i, quantity: Math.max(1, Math.min(Math.min(MAX_PER_LINE, i.maxQty), quantity)) } : i,
          ),
        })),
      remove: (productId) => set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      setOpen: (isOpen) => set({ isOpen }),
    }),
    {
      name: "city-seller-cart",
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

/** Derived totals; pass `items` from useCart. */
export function cartTotals(items: CartLine[]) {
  const count = items.reduce((n, i) => n + i.quantity, 0);
  const subtotal = items.reduce((n, i) => n + i.price * i.quantity, 0);
  const mrpTotal = items.reduce((n, i) => n + i.mrp * i.quantity, 0);
  const shipping = shippingFor(subtotal);
  return { count, subtotal, mrpTotal, savings: Math.max(0, mrpTotal - subtotal), shipping, total: subtotal + shipping };
}
