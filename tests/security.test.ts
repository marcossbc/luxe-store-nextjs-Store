import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { __resetRateLimit, clientIp, rateLimit } from "@/lib/security/rate-limit";
import { cjOrderSchema, searchQuerySchema, shopifyCheckoutSchema, slugSchema } from "@/lib/security/validate";
import { isAllowedCheckoutUrl, safeHttpsUrl } from "@/lib/security/url";
import { logError, redact } from "@/lib/security/logger";
import { safeEqual } from "@/lib/security/http";
import { parseCart, parseRecent, parseStylePrefs, parseWishlist } from "@/lib/security/storage";
import { cjConfig, productSources, shopifyConfig, webhookSecret } from "@/lib/env";

describe("rate limiter", () => {
  beforeEach(() => __resetRateLimit());
  it("allows up to the limit then blocks, with retry info", () => {
    for (let i = 0; i < 3; i++) expect(rateLimit("k", 3, 1000, 0).ok).toBe(true);
    const r = rateLimit("k", 3, 1000, 10);
    expect(r.ok).toBe(false);
    expect(r.remaining).toBe(0);
    expect(r.retryAfter).toBeGreaterThanOrEqual(1);
  });
  it("resets after the window and isolates keys", () => {
    for (let i = 0; i < 4; i++) rateLimit("a", 3, 1000, 0);
    expect(rateLimit("b", 3, 1000, 0).ok).toBe(true);
    expect(rateLimit("a", 3, 1000, 1500).ok).toBe(true);
  });
  it("extracts the first forwarded IP and bounds its length", () => {
    expect(clientIp(new Headers({ "x-forwarded-for": "1.2.3.4, 10.0.0.1" }))).toBe("1.2.3.4");
    expect(clientIp(new Headers())).toBe("unknown");
    expect(clientIp(new Headers({ "x-forwarded-for": "x".repeat(500) })).length).toBeLessThanOrEqual(64);
  });
});

describe("input validation", () => {
  it("slug allows only lowercase slugs", () => {
    expect(slugSchema.safeParse("minimal-watch-series-9").success).toBe(true);
    for (const bad of ["../etc/passwd", "A-B", "a b", "<script>", "", "x".repeat(121), "-leading"]) expect(slugSchema.safeParse(bad).success).toBe(false);
  });
  it("search query rejects markup / control characters / long input", () => {
    expect(searchQuerySchema.safeParse({ q: "leather bag" }).success).toBe(true);
    expect(searchQuerySchema.safeParse({}).success).toBe(true);
    for (const q of ["<img src=x onerror=1>", "a\u0000b", "x".repeat(61), "'; DROP TABLE"]) expect(searchQuerySchema.safeParse({ q }).success).toBe(false);
  });
  const item = { variantId: "gid://shopify/ProductVariant/42", quantity: 2, source: "shopify" as const };
  it("checkout accepts well-formed Shopify lines and ignores extra display fields", () => {
    const r = shopifyCheckoutSchema.safeParse({ items: [{ ...item, price: 0.01, name: "x" }] });
    expect(r.success).toBe(true);
  });
  it("checkout rejects forged ids, bad quantities, other sources, empty and oversized carts", () => {
    const bad = [
      { items: [{ ...item, variantId: "42" }] },
      { items: [{ ...item, variantId: "gid://shopify/ProductVariant/42; drop" }] },
      { items: [{ ...item, quantity: 0 }] },
      { items: [{ ...item, quantity: 1.5 }] },
      { items: [{ ...item, quantity: 100 }] },
      { items: [{ ...item, source: "cj" }] },
      { items: [] },
      { items: Array.from({ length: 51 }, () => item) },
      {},
    ];
    for (const b of bad) expect(shopifyCheckoutSchema.safeParse(b).success).toBe(false);
  });
  const order = {
    orderNumber: "ORD-1001",
    customer: { name: "Jane Doe", phone: "+1 555 123 4567", address: "1 Main St", city: "Austin", province: "TX", zip: "78701", countryCode: "US" },
    items: [{ vid: "ABCDEF12-3456", quantity: 1 }],
  };
  it("CJ order accepts a valid payload and rejects unknown fields (strict)", () => {
    expect(cjOrderSchema.safeParse(order).success).toBe(true);
    expect(cjOrderSchema.safeParse({ ...order, admin: true }).success).toBe(false);
    expect(cjOrderSchema.safeParse({ ...order, customer: { ...order.customer, extra: 1 } }).success).toBe(false);
  });
  it("CJ order rejects malformed fields", () => {
    for (const mutate of [
      (o: any) => (o.orderNumber = "bad number!"),
      (o: any) => (o.customer.countryCode = "usa"),
      (o: any) => (o.customer.phone = "call me"),
      (o: any) => (o.customer.name = "a\nb"),
      (o: any) => (o.items[0].vid = "x"),
      (o: any) => (o.items[0].quantity = -1),
      (o: any) => (o.items = []),
    ]) {
      const o = structuredClone(order);
      mutate(o);
      expect(cjOrderSchema.safeParse(o).success).toBe(false);
    }
  });
});

describe("URL safety", () => {
  it("only plain https URLs pass", () => {
    expect(safeHttpsUrl("https://cdn.shopify.com/a.png")).toBeTruthy();
    for (const u of ["http://x.com/a.png", "javascript:alert(1)", "data:text/html,<script>", "https://user:pw@x.com/", "//evil.com/a", "not a url", 42, undefined]) expect(safeHttpsUrl(u)).toBeUndefined();
  });
  it("checkout redirect is allow-listed (open-redirect guard)", () => {
    expect(isAllowedCheckoutUrl("https://my-shop.myshopify.com/cart/c/abc", "my-shop.myshopify.com")).toBe(true);
    expect(isAllowedCheckoutUrl("https://checkout.shopify.com/x", "my-shop.myshopify.com")).toBe(true);
    expect(isAllowedCheckoutUrl("https://pay.brand.com/x", "my-shop.myshopify.com", ["pay.brand.com"])).toBe(true);
    for (const u of ["https://evil.com/x", "https://my-shop.myshopify.com.evil.com/x", "http://my-shop.myshopify.com/x", "javascript:alert(1)", "https://notshopify.com/"]) expect(isAllowedCheckoutUrl(u, "my-shop.myshopify.com")).toBe(false);
  });
});

describe("logging & comparison", () => {
  it("redacts secrets and truncates long strings", () => {
    const out = redact({ ok: 1, token: "abc", nested: { Authorization: "Bearer x", apiKey: "k", fine: "v" }, big: "z".repeat(1000) }) as any;
    expect(out.token).toBe("[REDACTED]");
    expect(out.nested.Authorization).toBe("[REDACTED]");
    expect(out.nested.apiKey).toBe("[REDACTED]");
    expect(out.nested.fine).toBe("v");
    expect(out.big.length).toBeLessThan(400);
  });
  it("logError never prints stack traces", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logError("x", new Error("boom"), { token: "secret-value" });
    const line = String(spy.mock.calls[0][0]);
    spy.mockRestore();
    expect(line).toContain("boom");
    expect(line).not.toContain("secret-value");
    expect(line).not.toMatch(/\bat .*\(/);
  });
  it("safeEqual is exact and length-independent", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abd")).toBe(false);
    expect(safeEqual("abc", "abcd")).toBe(false);
    expect(safeEqual("", "x")).toBe(false);
  });
});

describe("localStorage validation", () => {
  const good = { id: "p1", productId: "p1", name: "A", slug: "a", price: 10, originalPrice: 12, image: "https://x.com/a.png", category: "c", quantity: 2, maxQuantity: 5 };
  it("accepts a valid cart", () => expect(parseCart(JSON.stringify([good]))).toHaveLength(1));
  it("drops tampered carts entirely", () => {
    for (const bad of [
      [{ ...good, image: "javascript:alert(1)" }],
      [{ ...good, quantity: -5 }],
      [{ ...good, quantity: 1e9 }],
      [{ ...good, price: "free" }],
      [{ ...good, price: -1 }],
      Array.from({ length: 101 }, () => good),
    ]) expect(parseCart(JSON.stringify(bad))).toEqual([]);
    expect(parseCart("{not json")).toEqual([]);
    expect(parseCart(null)).toEqual([]);
    expect(parseCart("x".repeat(300_000))).toEqual([]);
  });
  it("wishlist / recent / prefs fall back safely", () => {
    expect(parseWishlist('["a","b"]')).toEqual(["a", "b"]);
    expect(parseWishlist('{"a":1}')).toEqual([]);
    expect(parseRecent('["ok-slug","<script>"]')).toEqual([]);
    expect(parseStylePrefs("garbage")).toEqual({ top: "", shoe: "", colors: [], boards: [] });
    expect(parseStylePrefs('{"top":"M","colors":["Black"]}').colors).toEqual(["Black"]);
  });
});

describe("server configuration (fail closed)", () => {
  const saved = { ...process.env };
  afterEach(() => { process.env = { ...saved }; });
  it("Shopify domain must be <shop>.myshopify.com (SSRF guard)", () => {
    process.env.SHOPIFY_STOREFRONT_TOKEN = "a".repeat(32);
    for (const d of ["evil.com", "169.254.169.254", "shop.myshopify.com.evil.com", "localhost:3000", "https://shop.myshopify.com"]) {
      process.env.SHOPIFY_STORE_DOMAIN = d;
      expect(shopifyConfig()).toBeNull();
    }
    process.env.SHOPIFY_STORE_DOMAIN = "My-Shop.myshopify.com";
    expect(shopifyConfig()?.domain).toBe("my-shop.myshopify.com");
  });
  it("CJ markup is clamped; never below cost or NaN", () => {
    process.env.CJ_API_KEY = "key";
    for (const m of ["abc", "0.2", "-3", "99"]) { process.env.CJ_PRICE_MARKUP = m; expect(cjConfig()?.markup).toBe(1.8); }
    process.env.CJ_PRICE_MARKUP = "2.5";
    expect(cjConfig()?.markup).toBe(2.5);
  });
  it("order webhook secret must be strong, otherwise the endpoint is disabled", () => {
    delete process.env.ORDER_WEBHOOK_SECRET; expect(webhookSecret()).toBeNull();
    process.env.ORDER_WEBHOOK_SECRET = "short"; expect(webhookSecret()).toBeNull();
    process.env.ORDER_WEBHOOK_SECRET = "x".repeat(24); expect(webhookSecret()).toBeTruthy();
  });
  it("product sources are an allow-list", () => {
    process.env.PRODUCT_SOURCES = "shopify, evil ,cj,,STATIC";
    expect(productSources()).toEqual(["shopify", "cj", "static"]);
  });
});
