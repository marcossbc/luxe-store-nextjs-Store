import "server-only";
import { logSecurity } from "./security/logger";

/**
 * Validated server configuration. Invalid or weak values never crash the build and are never
 * logged: the affected integration is simply disabled (fail closed) and a warning names the variable.
 */
const warned = new Set<string>();
const warnOnce = (name: string, reason: string) => {
  if (warned.has(name)) return;
  warned.add(name);
  logSecurity("config_invalid", { variable: name, reason });
};

export function shopifyConfig(): { domain: string; token: string } | null {
  const domain = process.env.SHOPIFY_STORE_DOMAIN?.trim().toLowerCase();
  const token = process.env.SHOPIFY_STOREFRONT_TOKEN?.trim();
  if (!domain && !token) return null;
  // Only <shop>.myshopify.com is accepted: prevents the server being pointed at arbitrary hosts (SSRF).
  if (!domain || !/^[a-z0-9][a-z0-9-]{0,60}\.myshopify\.com$/.test(domain)) { warnOnce("SHOPIFY_STORE_DOMAIN", "must look like your-store.myshopify.com"); return null; }
  if (!token || !/^[A-Za-z0-9_-]{16,128}$/.test(token)) { warnOnce("SHOPIFY_STOREFRONT_TOKEN", "missing or malformed"); return null; }
  return { domain, token };
}

export function shopifyCheckoutHosts(): string[] {
  return (process.env.SHOPIFY_CHECKOUT_HOSTS || "").split(",").map((h) => h.trim().toLowerCase()).filter((h) => /^[a-z0-9.-]{3,253}$/.test(h));
}

export function cjConfig(): { apiKey: string; markup: number } | null {
  const apiKey = process.env.CJ_API_KEY?.trim();
  if (!apiKey) return null;
  if (apiKey.length > 256 || /[\r\n]/.test(apiKey)) { warnOnce("CJ_API_KEY", "malformed"); return null; }
  const raw = parseFloat(process.env.CJ_PRICE_MARKUP || "1.8");
  const markup = Number.isFinite(raw) && raw >= 1 && raw <= 10 ? raw : 1.8; // never sell below cost or NaN
  if (markup !== raw) warnOnce("CJ_PRICE_MARKUP", "out of range 1-10, using 1.8");
  return { apiKey, markup };
}

/** Webhook secret must be at least 24 chars; otherwise the order endpoint stays disabled. */
export function webhookSecret(): string | null {
  const s = process.env.ORDER_WEBHOOK_SECRET;
  if (!s) return null;
  if (s.length < 24) { warnOnce("ORDER_WEBHOOK_SECRET", "shorter than 24 characters, endpoint disabled"); return null; }
  return s;
}

const ALLOWED_SOURCES = new Set(["static", "shopify", "cj"]);
export function productSources(): string[] {
  return (process.env.PRODUCT_SOURCES || "static").split(",").map((s) => s.trim().toLowerCase()).filter((s) => ALLOWED_SOURCES.has(s));
}
