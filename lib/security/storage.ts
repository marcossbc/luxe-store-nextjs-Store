import { z } from "zod";
import type { CartItem } from "../types";

/**
 * localStorage is attacker-controllable (other tabs, browser extensions, XSS elsewhere on the origin).
 * Everything read from it is validated and size-limited; malformed data is dropped, never trusted.
 */
const str = (max: number) => z.string().max(max);
const money = z.number().finite().min(0).max(1_000_000);
const imageUrl = z.string().max(2048).regex(/^(https:\/\/|\/)/, "image must be https or a site path");

const cartItemSchema = z.object({
  id: str(200),
  productId: str(200),
  name: str(300),
  slug: str(160),
  price: money,
  originalPrice: money,
  image: imageUrl,
  category: str(100),
  quantity: z.number().int().min(1).max(99),
  maxQuantity: z.number().int().min(1).max(9999),
  source: z.enum(["static", "shopify", "cj"]).optional(),
  variantId: str(200).optional(),
});

function parseJson(raw: string | null): unknown {
  if (!raw || raw.length > 200_000) return undefined;
  try { return JSON.parse(raw); } catch { return undefined; }
}

export function parseCart(raw: string | null): CartItem[] {
  const r = z.array(cartItemSchema).max(100).safeParse(parseJson(raw));
  return r.success ? (r.data as CartItem[]) : [];
}

export function parseWishlist(raw: string | null): string[] {
  const r = z.array(str(200)).max(300).safeParse(parseJson(raw));
  return r.success ? r.data : [];
}

const prefsSchema = z.object({
  top: str(10).default(""),
  shoe: str(10).default(""),
  colors: z.array(str(20)).max(12).default([]),
  boards: z.array(z.object({ id: str(40), name: str(60), productIds: z.array(str(200)).max(100) })).max(30).default([]),
});
export type StylePrefs = z.infer<typeof prefsSchema>;

export function parseStylePrefs(raw: string | null): StylePrefs {
  const r = prefsSchema.safeParse(parseJson(raw) ?? {});
  return r.success ? r.data : { top: "", shoe: "", colors: [], boards: [] };
}

export function parseRecent(raw: string | null): string[] {
  const r = z.array(z.string().regex(/^[a-z0-9-]{1,120}$/)).max(20).safeParse(parseJson(raw));
  return r.success ? r.data : [];
}
