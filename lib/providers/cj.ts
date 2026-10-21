import "server-only";
import type { Product } from "../types";
import { cjConfig } from "../env";
import { safeHttpsUrl } from "../security/url";

const BASE = "https://developers.cjdropshipping.com/api2.0/v1";
const TIMEOUT_MS = 8000;
const markup = () => cjConfig()?.markup ?? 1.8;

export const cjEnabled = () => cjConfig() !== null;

// Token is valid ~15 days; cache in memory (CJ limits token requests).
let cached: { token: string; exp: number } | null = null;

async function getToken(): Promise<string> {
  if (cached && cached.exp > Date.now()) return cached.token;
  const res = await fetch(`${BASE}/authentication/getAccessToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey: cjConfig()?.apiKey }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const json = await res.json();
  if (!json?.data?.accessToken) throw new Error("CJ authentication failed");
  cached = { token: json.data.accessToken, exp: Date.now() + 10 * 24 * 3600 * 1000 };
  return cached.token;
}

async function cjFetch(path: string, init: RequestInit = {}, revalidate = 600) {
  const token = await getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", "CJ-Access-Token": token, ...(init.headers || {}) },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    next: { revalidate },
  } as any);
  const json = await res.json();
  if (!json?.result && json?.code !== 200) throw new Error(`CJ request failed (${String(path).split("?")[0]})`);
  return json.data;
}

const toSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);

function parsePrice(v: unknown): number {
  // CJ sometimes returns a range like "3.20 -- 5.10"
  const first = String(v ?? "0").split("--")[0].trim();
  const n = parseFloat(first);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function parseImages(v: unknown): string[] {
  let list: unknown[] = [];
  if (Array.isArray(v)) list = v;
  else if (typeof v === "string") {
    try { const a = JSON.parse(v); list = Array.isArray(a) ? a : [v]; } catch { list = [v]; }
  }
  return list.map(safeHttpsUrl).filter(Boolean) as string[]; // https only, no javascript:/data: URLs from upstream
}

const SIZE_RE = /^(xxs|xs|s|m|l|xl|xxl|xxxl|[2-5]xl|\d+(\.\d+)?\s?(cm|mm|in|inch|ml|g|kg)?)$/i;

// CJ returns variantKey like "Black-XL". Splitting colour/size is a heuristic.
function mapCjVariants(list: any, markup: number) {
  if (!Array.isArray(list) || list.length === 0) return undefined;
  return list.map((v: any) => {
    const key = String(v.variantKey || v.variantNameEn || "").trim();
    let color: string | undefined;
    let size: string | undefined;
    key.split("-").map((x) => x.trim()).filter(Boolean).forEach((part) => {
      if (SIZE_RE.test(part)) size = part;
      else color = color ? `${color} ${part}` : part;
    });
    const cost = parsePrice(v.variantSellPrice);
    return {
      id: String(v.vid),
      title: key || String(v.vid),
      color,
      size,
      sku: v.variantSku as string | undefined,
      price: cost ? Math.round(cost * markup * 100) / 100 : undefined,
      image: safeHttpsUrl(v.variantImage),
      inStock: true,
    };
  });
}

function mapListItem(p: any): Product {
  const cost = parsePrice(p.sellPrice);
  const price = Math.round(cost * markup() * 100) / 100;
  const category = toSlug(p.categoryName || "general");
  return {
    id: `cj-${p.pid}`,
    externalId: p.pid,
    variantId: p.variants?.[0]?.vid,
    source: "cj",
    name: p.productNameEn || p.productName,
    slug: `cj-${p.pid}`,
    description: p.description || "",
    shortDescription: (p.productNameEn || "").slice(0, 120),
    price,
    originalPrice: Math.round(price * 1.25 * 100) / 100,
    rating: 4.4,
    reviewCount: 0,
    images: parseImages(p.productImage),
    category,
    categoryName: p.categoryName || "General",
    tags: [],
    badge: "new",
    inStock: true,
    stockCount: 99,
    sku: p.productSku || p.pid,
    features: [],
    specifications: p.productWeight ? { Weight: `${p.productWeight} g` } : {},
    variants: mapCjVariants(p.variants, markup()),
    createdAt: p.createTime ? new Date(Number(p.createTime) || p.createTime).toISOString() : new Date().toISOString(),
  };
}

export async function getCjProducts(limit = 40, keyword = ""): Promise<Product[]> {
  if (!cjEnabled()) return [];
  const qs = new URLSearchParams({ pageNum: "1", pageSize: String(Math.min(limit, 100)) });
  if (keyword) qs.set("productNameEn", keyword);
  const data = await cjFetch(`/product/list?${qs}`);
  return (data?.list || []).map(mapListItem);
}

export async function getCjProductByPid(pid: string): Promise<Product | undefined> {
  if (!cjEnabled() || !/^[A-Za-z0-9-]{8,64}$/.test(pid)) return undefined;
  const p = await cjFetch(`/product/query?pid=${encodeURIComponent(pid)}`);
  return p ? mapListItem(p) : undefined;
}

export interface CjOrderInput {
  orderNumber: string;
  customer: { name: string; phone: string; address: string; city: string; province: string; zip: string; countryCode: string };
  items: { vid: string; quantity: number }[];
}

/** Forward a PAID order to CJ for fulfilment. Verify field names against CJ docs for your account. */
export async function createCjOrder(o: CjOrderInput) {
  return cjFetch(
    `/shopping/order/createOrderV2`,
    {
      method: "POST",
      body: JSON.stringify({
        orderNumber: o.orderNumber,
        shippingZip: o.customer.zip,
        shippingCountryCode: o.customer.countryCode,
        shippingProvince: o.customer.province,
        shippingCity: o.customer.city,
        shippingAddress: o.customer.address,
        shippingCustomerName: o.customer.name,
        shippingPhone: o.customer.phone,
        logisticName: "CJPacket Ordinary",
        fromCountryCode: "CN",
        products: o.items.map((i) => ({ vid: i.vid, quantity: i.quantity })),
      }),
    },
    0
  );
}
