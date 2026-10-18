import type { Product } from "../types";

/** Dynamic brand accents for split panels (electric blue / olive dark / ...). */
export const ACCENTS = ["#2563eb", "#4d5a24", "#9a4a22", "#0f766e", "#5b3fb3", "#475569"];

export function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export const accentFor = (key: string) => ACCENTS[hashString(key) % ACCENTS.length];

/**
 * Edition micro-copy. "Limited Allocation" is only used when real stock is low,
 * so scarcity messaging never contradicts inventory.
 */
export function editionTag(p: Pick<Product, "id" | "stockCount" | "inStock" | "badge">): string {
  if (p.inStock && p.stockCount > 0 && p.stockCount <= 10) return "Limited Allocation";
  if (p.badge === "new" || p.badge === "sale") return "Special Edition";
  return hashString(p.id) % 2 === 0 ? "Special Edition" : "Bespoke Batch";
}
