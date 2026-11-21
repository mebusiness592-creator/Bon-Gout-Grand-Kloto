"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Section } from "@/lib/types";

export type CartLine = { lineId: string; productId: string; variantId?: string; variantLabel?: string; name: string; price: number; image?: string; section: Section; quantity: number };
type Ctx = {
  lines: CartLine[]; count: number; subtotal: number; ready: boolean;
  add: (l: Omit<CartLine, "quantity" | "lineId">, qty?: number) => void;
  setQty: (lineId: string, qty: number) => void; remove: (lineId: string) => void; clear: () => void;
};
const CartContext = createContext<Ctx | null>(null);
const KEY = "bg_cart_v2";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setLines(JSON.parse(raw)); } catch { /* panier vide */ }
    setReady(true);
  }, []);
  useEffect(() => { if (ready) try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch { /* ignoré */ } }, [lines, ready]);

  const add = useCallback((l: Omit<CartLine, "quantity" | "lineId">, qty = 1) => {
    const lineId = `${l.productId}:${l.variantId || ""}:${l.price}`;
    setLines((prev) => {
      const found = prev.find((x) => x.lineId === lineId);
      if (found) return prev.map((x) => x.lineId === lineId ? { ...x, quantity: Math.min(30, x.quantity + qty) } : x);
      return [...prev, { ...l, lineId, quantity: Math.min(30, qty) }];
    });
  }, []);
  const setQty = useCallback((id: string, qty: number) => setLines((p) => qty <= 0 ? p.filter((x) => x.lineId !== id) : p.map((x) => x.lineId === id ? { ...x, quantity: Math.min(30, qty) } : x)), []);
  const remove = useCallback((id: string) => setLines((p) => p.filter((x) => x.lineId !== id)), []);
  const clear = useCallback(() => setLines([]), []);
  const value = useMemo<Ctx>(() => ({
    lines, ready, add, setQty, remove, clear,
    count: lines.reduce((s, x) => s + x.quantity, 0),
    subtotal: lines.reduce((s, x) => s + x.quantity * x.price, 0),
  }), [lines, ready, add, setQty, remove, clear]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart doit être utilisé dans CartProvider");
  return c;
}
