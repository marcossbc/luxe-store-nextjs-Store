import type { Product } from "../types";

const BASE = "https://developers.cjdropshipping.com/api2.0/v1";
const API_KEY = process.env.CJ_API_KEY;
const MARKUP = parseFloat(process.env.CJ_PRICE_MARKUP || "1.8");

export const cjEnabled = () => Boolean(API_KEY);

// Token is valid ~15 days; cache in memory (CJ limits token requests).
let cached: { token: string; exp: number } | null = null;

async function getToken(): Promise<string> {
  if (cached && cached.exp > Date.now()) return cached.token;
  const res = await fetch(`${BASE}/authentication/getAccessToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey: API_KEY }),
  });
  const json = await res.json();
  if (!json?.data?.accessToken) throw new Error(`CJ auth failed: ${json?.message}`);
  cached = { token: json.data.accessToken, exp: Date.now() + 10 * 24 * 3600 * 1000 };
  return cached.token;
}

async function cjFetch(path: string, init: RequestInit = {}, revalidate = 600) {
  const token = await getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", "CJ-Access-Token": token, ...(init.headers || {}) },
    next: { revalidate },
  } as any);
  const json = await res.json();
  if (!json?.result && json?.code !== 200) throw new Error(`CJ ${path}: ${json?.message}`);
  return json.data;
}

const toSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);

function parsePrice(v: unknown): number {
  // CJ sometimes returns a range like "3.20 -- 5.10"
  const first = String(v ?? "0").split("--")[0].trim();
  return parseFloat(first) || 0;
}

function parseImages(v: unknown): string[] {
  if (Array.isArray(v)) return v as string[];
  if (typeof v === "string") {
    try { const a = JSON.parse(v); if (Array.isArray(a)) return a; } catch { /* plain url */ }
    return [v];
  }
  return [];
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
      image: v.variantImage as string | undefined,
      inStock: true,
    };
  });
}

function mapListItem(p: any): Product {
  const cost = parsePrice(p.sellPrice);
  const price = Math.round(cost * MARKUP * 100) / 100;
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
    variants: mapCjVariants(p.variants, MARKUP),
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
  if (!cjEnabled()) return undefined;
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
