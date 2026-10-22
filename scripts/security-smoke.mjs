#!/usr/bin/env node
/**
 * End-to-end security smoke test against a RUNNING server (production mode recommended).
 *   npm run build && npm start &      # then:
 *   BASE_URL=http://localhost:3000 node scripts/security-smoke.mjs
 * Optional: SMOKE_ORDER_SECRET=<same value as the server's ORDER_WEBHOOK_SECRET> to also test the authenticated order path.
 * Optional: SMOKE_EXPECT_PROD=1 to require the HSTS header.
 */
const BASE = process.env.BASE_URL || "http://localhost:3000";
const ORIGIN = new URL(BASE).origin;
const SECRET = process.env.SMOKE_ORDER_SECRET;
let pass = 0,
  fail = 0;
const ok = (name, cond, extra = "") => {
  cond ? pass++ : fail++;
  console.log(
    `${cond ? "PASS" : "FAIL"}  ${name}${cond ? "" : "  -> " + extra}`,
  );
};
const req = (path, init = {}, ip = "198.51.100.10") =>
  fetch(BASE + path, {
    redirect: "manual",
    ...init,
    headers: { "x-forwarded-for": ip, ...(init.headers || {}) },
  });
const post = (path, body, headers = {}, ip) =>
  req(
    path,
    {
      method: "POST",
      body: typeof body === "string" ? body : JSON.stringify(body),
      headers: {
        "content-type": "application/json",
        origin: ORIGIN,
        ...headers,
      },
    },
    ip,
  );

// ---------- headers + CSP
const home = await req("/", {}, "198.51.100.1");
const home2 = await req("/", {}, "198.51.100.1");
const csp = home.headers.get("content-security-policy") || "";
const nonce = /'nonce-([^']+)'/.exec(csp)?.[1];
const html = await home.text();
ok(
  "CSP present with nonce + strict-dynamic",
  Boolean(nonce) && csp.includes("'strict-dynamic'"),
  csp.slice(0, 120),
);
ok(
  "CSP forbids framing, objects and foreign base/forms",
  [
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].every((d) => csp.includes(d)),
  csp,
);
ok(
  "CSP has no unsafe-eval / unsafe-inline in script-src",
  !/script-src[^;]*'unsafe-(eval|inline)'/.test(csp),
  csp,
);
ok(
  "every <script> in the HTML carries the request nonce",
  nonce &&
    [...html.matchAll(/<script\b[^>]*>/g)].every(
      (m) =>
        m[0].includes(`nonce="${nonce}"`) ||
        (/\bsrc=/.test(m[0]) && m[0].includes("nonce=")),
    ),
  "script without nonce found",
);
ok(
  "nonce changes on every request",
  nonce !==
    /'nonce-([^']+)'/.exec(
      home2.headers.get("content-security-policy") || "",
    )?.[1],
);
ok("x-frame-options DENY", home.headers.get("x-frame-options") === "DENY");
ok(
  "x-content-type-options nosniff",
  home.headers.get("x-content-type-options") === "nosniff",
);
ok("referrer-policy set", Boolean(home.headers.get("referrer-policy")));
ok(
  "permissions-policy blocks camera/mic/geo",
  /camera=\(\)/.test(home.headers.get("permissions-policy") || ""),
);
ok(
  "cross-origin-opener-policy same-origin",
  home.headers.get("cross-origin-opener-policy") === "same-origin",
);
ok("X-Powered-By is not exposed", !home.headers.get("x-powered-by"));
if (process.env.SMOKE_EXPECT_PROD)
  ok(
    "HSTS present (production)",
    /max-age=\d+/.test(home.headers.get("strict-transport-security") || ""),
  );
const profile = await req("/profile", {}, "198.51.100.2");
ok(
  "/profile is private + noindex",
  /no-store/.test(profile.headers.get("cache-control") || "") &&
    /noindex/.test(profile.headers.get("x-robots-tag") || ""),
);

// ---------- input validation
ok(
  "search query with markup rejected (400)",
  (
    await req(
      "/api/products?q=" + encodeURIComponent("<script>alert(1)</script>"),
      {},
      "198.51.100.3",
    )
  ).status === 400,
);
ok(
  "over-long search query rejected (400)",
  (await req("/api/products?q=" + "a".repeat(200), {}, "198.51.100.3"))
    .status === 400,
);
ok(
  "valid search query accepted (200)",
  (await req("/api/products?q=watch", {}, "198.51.100.3")).status === 200,
);
ok(
  "bad slug rejected (400)",
  (await req("/api/products/Bad_Slug%3Cx%3E", {}, "198.51.100.3")).status ===
    400,
);
ok(
  "unknown slug is 404 (not 500)",
  (await req("/api/products/does-not-exist", {}, "198.51.100.3")).status ===
    404,
);
const notFound = await (
  await req("/api/products/does-not-exist", {}, "198.51.100.3")
).text();
ok(
  "error body is generic (no stack / internals)",
  !/at \w+.*\(|node_modules|\.ts:\d+/.test(notFound) &&
    notFound.includes("requestId"),
  notFound.slice(0, 200),
);

// ---------- CSRF, content-type, size, schema on checkout
const validItem = {
  variantId: "gid://shopify/ProductVariant/1234567890",
  quantity: 1,
  source: "shopify",
};
ok(
  "cross-site POST blocked (403)",
  (
    await post(
      "/api/checkout/shopify",
      { items: [validItem] },
      { origin: "https://evil.example" },
      "198.51.100.4",
    )
  ).status === 403,
);
ok(
  "POST without Origin/Sec-Fetch-Site blocked (403)",
  (
    await req(
      "/api/checkout/shopify",
      {
        method: "POST",
        body: "{}",
        headers: { "content-type": "application/json" },
      },
      "198.51.100.4",
    )
  ).status === 403,
);
ok(
  "wrong content-type rejected (415)",
  (
    await post(
      "/api/checkout/shopify",
      "x=1",
      { "content-type": "text/plain" },
      "198.51.100.5",
    )
  ).status === 415,
);
ok(
  "malformed JSON rejected (400)",
  (await post("/api/checkout/shopify", "{not json", {}, "198.51.100.5"))
    .status === 400,
);
ok(
  "oversized body rejected (413)",
  (
    await post(
      "/api/checkout/shopify",
      { items: [validItem], pad: "x".repeat(20000) },
      {},
      "198.51.100.5",
    )
  ).status === 413,
);
ok(
  "negative / huge quantity rejected (400)",
  (
    await post(
      "/api/checkout/shopify",
      { items: [{ ...validItem, quantity: -1 }] },
      {},
      "198.51.100.6",
    )
  ).status === 400 &&
    (
      await post(
        "/api/checkout/shopify",
        { items: [{ ...validItem, quantity: 100000 }] },
        {},
        "198.51.100.6",
      )
    ).status === 400,
);
ok(
  "non-Shopify / forged variant id rejected (400)",
  (
    await post(
      "/api/checkout/shopify",
      { items: [{ ...validItem, variantId: "1; DROP TABLE" }] },
      {},
      "198.51.100.6",
    )
  ).status === 400 &&
    (
      await post(
        "/api/checkout/shopify",
        {
          items: [
            validItem,
            { variantId: "cj-123", quantity: 1, source: "cj" },
          ],
        },
        {},
        "198.51.100.6",
      )
    ).status === 400,
);
const unconfigured = await post(
  "/api/checkout/shopify",
  { items: [validItem] },
  {},
  "198.51.100.7",
);
ok(
  "valid cart passes validation (503 not-configured or 200/502 when Shopify is set)",
  [200, 502, 503].includes(unconfigured.status),
  String(unconfigured.status),
);

// ---------- order webhook auth (server-to-server)
const noSecret = await post(
  "/api/orders/cj",
  {},
  { origin: "" },
  "198.51.100.8",
);
ok(
  "order endpoint closed without secret header (401, or 503 when not configured)",
  [401, 503].includes(noSecret.status),
  String(noSecret.status),
);
const wrong = await post(
  "/api/orders/cj",
  {},
  { "x-order-secret": "wrong-secret-value" },
  "198.51.100.8",
);
ok(
  "order endpoint rejects wrong secret",
  [401, 503].includes(wrong.status),
  String(wrong.status),
);
if (SECRET) {
  ok(
    "correct secret + invalid body -> 400 (validated)",
    (
      await post(
        "/api/orders/cj",
        { orderNumber: "bad number!" },
        { "x-order-secret": SECRET },
        "198.51.100.9",
      )
    ).status === 400,
  );
  ok(
    "correct secret + unknown fields -> 400 (strict schema)",
    (
      await post(
        "/api/orders/cj",
        { orderNumber: "A1", customer: {}, items: [], evil: true },
        { "x-order-secret": SECRET },
        "198.51.100.9",
      )
    ).status === 400,
  );
}

// ---------- rate limiting (last: it exhausts a bucket)
let limited = 0,
  retryAfter = null;
for (let i = 0; i < 16; i++) {
  const r = await post(
    "/api/checkout/shopify",
    { items: [validItem] },
    {},
    "203.0.113.77",
  );
  if (r.status === 429) {
    limited++;
    retryAfter = r.headers.get("retry-after");
  }
}
ok(
  "checkout is rate limited (429 + Retry-After after 10/min)",
  limited >= 5 && Boolean(retryAfter),
  `limited=${limited}`,
);
ok(
  "another client is not affected by that limit",
  (
    await post(
      "/api/checkout/shopify",
      { items: [validItem] },
      {},
      "203.0.113.78",
    )
  ).status !== 429,
);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
