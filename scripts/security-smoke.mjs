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
let pass = 0, fail = 0;
const ok = (name, cond, extra = "") => { (cond ? pass++ : fail++); console.log(`${cond ? "PASS" : "FAIL"}  ${name}${cond ? "" : "  -> " + extra}`); };
const req = (path, init = {}, ip = "198.51.100.10") => fetch(BASE + path, { redirect: "manual", ...init, headers: { "x-forwarded-for": ip, ...(init.headers || {}) } });
let COOKIE = ""; // session cookie of the smoke-test user (set below); checkout calls need a signed-in customer
const post = (path, body, headers = {}, ip) => req(path, { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body), headers: { "content-type": "application/json", origin: ORIGIN, ...(path.startsWith("/api/checkout") && COOKIE ? { cookie: COOKIE } : {}), ...headers } }, ip);
const sessionFrom = (res) => (res.headers.getSetCookie?.() || []).find((c) => c.startsWith("dahab_session="));

// ---------- headers + CSP
const home = await req("/", {}, "198.51.100.1");
const home2 = await req("/", {}, "198.51.100.1");
const csp = home.headers.get("content-security-policy") || "";
const nonce = /'nonce-([^']+)'/.exec(csp)?.[1];
const html = await home.text();
ok("CSP present with nonce + strict-dynamic", Boolean(nonce) && csp.includes("'strict-dynamic'"), csp.slice(0, 120));
ok("CSP forbids framing, objects and foreign base/forms", ["frame-ancestors 'none'", "object-src 'none'", "base-uri 'self'", "form-action 'self'"].every((d) => csp.includes(d)), csp);
ok("CSP has no unsafe-eval / unsafe-inline in script-src", !/script-src[^;]*'unsafe-(eval|inline)'/.test(csp), csp);
ok("every <script> in the HTML carries the request nonce", nonce && [...html.matchAll(/<script\b[^>]*>/g)].every((m) => m[0].includes(`nonce="${nonce}"`) || /\bsrc=/.test(m[0]) && m[0].includes("nonce=")), "script without nonce found");
ok("nonce changes on every request", nonce !== /'nonce-([^']+)'/.exec(home2.headers.get("content-security-policy") || "")?.[1]);
ok("x-frame-options DENY", home.headers.get("x-frame-options") === "DENY");
ok("x-content-type-options nosniff", home.headers.get("x-content-type-options") === "nosniff");
ok("referrer-policy set", Boolean(home.headers.get("referrer-policy")));
ok("permissions-policy blocks camera/mic/geo", /camera=\(\)/.test(home.headers.get("permissions-policy") || ""));
ok("cross-origin-opener-policy same-origin", home.headers.get("cross-origin-opener-policy") === "same-origin");
ok("X-Powered-By is not exposed", !home.headers.get("x-powered-by"));
if (process.env.SMOKE_EXPECT_PROD) ok("HSTS present (production)", /max-age=\d+/.test(home.headers.get("strict-transport-security") || ""));
const profile = await req("/profile", {}, "198.51.100.2");
ok("/profile is private + noindex", /no-store/.test(profile.headers.get("cache-control") || "") && /noindex/.test(profile.headers.get("x-robots-tag") || ""));


// ---------- accounts: register / login / session / guards
const email = `smoke+${Date.now()}@example.com`;
const goodPw = "Sunrise-Garoowe-7";
const reg = { name: "Smoke Tester", email, password: goodPw, acceptTerms: true, remember: true };
const r1 = await post("/api/auth/register", reg, {}, "198.51.100.20");
const set1 = sessionFrom(r1);
ok("register creates an account (201) and signs in", r1.status === 201 && Boolean(set1), String(r1.status));
ok("session cookie is HttpOnly + SameSite=Lax + Path=/", /HttpOnly/i.test(set1 || "") && /SameSite=Lax/i.test(set1 || "") && /Path=\//.test(set1 || ""), set1);
if (process.env.SMOKE_EXPECT_PROD) ok("session cookie is Secure in production", /;\s*Secure/i.test(set1 || ""), set1);
ok("response never contains the password or its hash", !/passwordHash|scrypt\$|Sunrise-Garoowe/.test(await r1.clone().text().catch(() => "")));
COOKIE = set1 ? set1.split(";")[0] : "";
const me1 = await (await req("/api/auth/me", { headers: { cookie: COOKIE } }, "198.51.100.20")).json();
ok("/api/auth/me returns the signed-in user", me1.user?.email === email && me1.user?.name === "Smoke Tester", JSON.stringify(me1));
const meGuest = await (await req("/api/auth/me", {}, "198.51.100.21")).json();
ok("/api/auth/me is null for visitors", meGuest.user === null);
ok("duplicate email rejected (409)", (await post("/api/auth/register", reg, {}, "198.51.100.22")).status === 409);
const weak = await post("/api/auth/register", { ...reg, email: `w${Date.now()}@example.com`, password: "password123" }, {}, "198.51.100.23");
ok("weak/common password rejected with field errors (400)", weak.status === 400 && Boolean((await weak.json()).error?.fields?.password));
ok("register without accepting terms rejected (400)", (await post("/api/auth/register", { ...reg, email: `t${Date.now()}@example.com`, acceptTerms: false }, {}, "198.51.100.23")).status === 400);
ok("extra fields (e.g. role=admin) rejected (400)", (await post("/api/auth/register", { ...reg, email: `x${Date.now()}@example.com`, role: "admin" }, {}, "198.51.100.23")).status === 400);
ok("cross-site register blocked (403)", (await post("/api/auth/register", reg, { origin: "https://evil.example" }, "198.51.100.24")).status === 403);
ok("login with wrong password -> 401, generic message", await (async () => { const r = await post("/api/auth/login", { email, password: "wrong-password-1" }, {}, "198.51.100.25"); const j = await r.json(); return r.status === 401 && j.error.message === "Invalid email or password."; })());
ok("login with unknown email -> identical 401 (no account enumeration)", await (async () => { const r = await post("/api/auth/login", { email: `nobody${Date.now()}@example.com`, password: "wrong-password-1" }, {}, "198.51.100.26"); const j = await r.json(); return r.status === 401 && j.error.message === "Invalid email or password."; })());
const li = await post("/api/auth/login", { email: email.toUpperCase(), password: goodPw, remember: false }, {}, "198.51.100.27");
const set2 = sessionFrom(li);
ok("login works (email is case-insensitive); session-only cookie when 'remember' is off", li.status === 200 && Boolean(set2) && !/Max-Age|Expires/i.test(set2 || ""), set2);
ok("each login issues a different session token", Boolean(set1) && Boolean(set2) && set1.split(";")[0] !== set2.split(";")[0]);
let lock = 0, retry = null;
for (let i = 0; i < 7; i++) { const r = await post("/api/auth/login", { email, password: "wrong-password-" + i }, {}, "203.0.113.90"); if (r.status === 429) { lock++; retry = r.headers.get("retry-after"); } }
ok("brute force is locked out after 5 failures (429 + Retry-After)", lock >= 1 && Boolean(retry), `locked=${lock}`);
ok("...even with the right password while locked", (await post("/api/auth/login", { email, password: goodPw }, {}, "203.0.113.90")).status === 429);
ok("...but the real customer on another network is not locked out", (await post("/api/auth/login", { email, password: goodPw }, {}, "203.0.113.91")).status === 200);
const redir = async (path, cookie) => { const r = await req(path, { headers: cookie ? { cookie } : {} }, "198.51.100.28"); return { status: r.status, loc: r.headers.get("location") || "" }; };
const gp = await redir("/profile"), gc = await redir("/checkout");
ok("guest opening /profile is sent to sign in", [302, 303, 307, 308].includes(gp.status) && gp.loc.includes("/login") && gp.loc.includes("next=%2Fprofile"), JSON.stringify(gp));
{ // a forged cookie passes the middleware fast path, so the server-side guard must stop it: no content, redirect instructions only
  const fr = await req("/profile", { headers: { cookie: "dahab_session=" + "A".repeat(43) } }, "198.51.100.28");
  const body = await fr.text();
  ok("forged session cookie on /profile: redirected to sign in and NO profile content is sent", (([302, 303, 307, 308].includes(fr.status)) || /\/login\?next=/.test(body)) && !/Member since|No orders yet|Member Vault/.test(body), String(fr.status));
}
ok("guest opening /checkout is sent to sign in", [302, 303, 307, 308].includes(gc.status) && gc.loc.includes("/login") && gc.loc.includes("next=%2Fcheckout"), JSON.stringify(gc));
ok("signed-in customer can open /profile and /checkout", (await redir("/profile", COOKIE)).status === 200 && (await redir("/checkout", COOKIE)).status === 200);
const evil = await redir("/login?next=https%3A%2F%2Fevil.com", COOKIE);
ok("post-login redirect ignores external URLs (open-redirect guard)", !evil.loc.includes("evil.com"), JSON.stringify(evil));
const noCookieCheckout = await req("/api/checkout/shopify", { method: "POST", body: JSON.stringify({ items: [{ variantId: "gid://shopify/ProductVariant/1234567890", quantity: 1, source: "shopify" }] }), headers: { "content-type": "application/json", origin: ORIGIN } }, "198.51.100.29");
ok("GUEST cannot place an order: checkout API answers 401", noCookieCheckout.status === 401, String(noCookieCheckout.status));
ok("a forged / garbage session cookie is treated as a guest", (await req("/api/checkout/shopify", { method: "POST", body: "{}", headers: { "content-type": "application/json", origin: ORIGIN, cookie: "dahab_session=" + "A".repeat(43) } }, "198.51.100.29")).status === 401);

// ---------- input validation
ok("search query with markup rejected (400)", (await req("/api/products?q=" + encodeURIComponent("<script>alert(1)</script>"), {}, "198.51.100.3")).status === 400);
ok("over-long search query rejected (400)", (await req("/api/products?q=" + "a".repeat(200), {}, "198.51.100.3")).status === 400);
ok("valid search query accepted (200)", (await req("/api/products?q=watch", {}, "198.51.100.3")).status === 200);
ok("bad slug rejected (400)", (await req("/api/products/Bad_Slug%3Cx%3E", {}, "198.51.100.3")).status === 400);
ok("unknown slug is 404 (not 500)", (await req("/api/products/does-not-exist", {}, "198.51.100.3")).status === 404);
const notFound = await (await req("/api/products/does-not-exist", {}, "198.51.100.3")).text();
ok("error body is generic (no stack / internals)", !/at \w+.*\(|node_modules|\.ts:\d+/.test(notFound) && notFound.includes("requestId"), notFound.slice(0, 200));

// ---------- CSRF, content-type, size, schema on checkout
const validItem = { variantId: "gid://shopify/ProductVariant/1234567890", quantity: 1, source: "shopify" };
ok("cross-site POST blocked (403)", (await post("/api/checkout/shopify", { items: [validItem] }, { origin: "https://evil.example" }, "198.51.100.4")).status === 403);
ok("POST without Origin/Sec-Fetch-Site blocked (403)", (await req("/api/checkout/shopify", { method: "POST", body: "{}", headers: { "content-type": "application/json" } }, "198.51.100.4")).status === 403);
ok("wrong content-type rejected (415)", (await post("/api/checkout/shopify", "x=1", { "content-type": "text/plain" }, "198.51.100.5")).status === 415);
ok("malformed JSON rejected (400)", (await post("/api/checkout/shopify", "{not json", {}, "198.51.100.5")).status === 400);
ok("oversized body rejected (413)", (await post("/api/checkout/shopify", { items: [validItem], pad: "x".repeat(20000) }, {}, "198.51.100.5")).status === 413);
ok("negative / huge quantity rejected (400)", (await post("/api/checkout/shopify", { items: [{ ...validItem, quantity: -1 }] }, {}, "198.51.100.6")).status === 400 && (await post("/api/checkout/shopify", { items: [{ ...validItem, quantity: 100000 }] }, {}, "198.51.100.6")).status === 400);
ok("non-Shopify / forged variant id rejected (400)", (await post("/api/checkout/shopify", { items: [{ ...validItem, variantId: "1; DROP TABLE" }] }, {}, "198.51.100.6")).status === 400 && (await post("/api/checkout/shopify", { items: [validItem, { variantId: "cj-123", quantity: 1, source: "cj" }] }, {}, "198.51.100.6")).status === 400);
const unconfigured = await post("/api/checkout/shopify", { items: [validItem] }, {}, "198.51.100.7");
ok("valid cart passes validation (503 not-configured or 200/502 when Shopify is set)", [200, 502, 503].includes(unconfigured.status), String(unconfigured.status));

// ---------- order webhook auth (server-to-server)
const noSecret = await post("/api/orders/cj", {}, { origin: "" }, "198.51.100.8");
ok("order endpoint closed without secret header (401, or 503 when not configured)", [401, 503].includes(noSecret.status), String(noSecret.status));
const wrong = await post("/api/orders/cj", {}, { "x-order-secret": "wrong-secret-value" }, "198.51.100.8");
ok("order endpoint rejects wrong secret", [401, 503].includes(wrong.status), String(wrong.status));
if (SECRET) {
  ok("correct secret + invalid body -> 400 (validated)", (await post("/api/orders/cj", { orderNumber: "bad number!" }, { "x-order-secret": SECRET }, "198.51.100.9")).status === 400);
  ok("correct secret + unknown fields -> 400 (strict schema)", (await post("/api/orders/cj", { orderNumber: "A1", customer: {}, items: [], evil: true }, { "x-order-secret": SECRET }, "198.51.100.9")).status === 400);
}


// ---------- logout really ends the session (server-side)
const staleCookie = COOKIE;
const lo = await post("/api/auth/logout", {}, { cookie: staleCookie }, "198.51.100.30");
ok("logout clears the cookie", lo.status === 200 && /dahab_session=;?/.test((lo.headers.getSetCookie?.() || []).join(";")) && /Max-Age=0|Expires=/i.test((lo.headers.getSetCookie?.() || []).join(";")));
const meAfter = await (await req("/api/auth/me", { headers: { cookie: staleCookie } }, "198.51.100.30")).json();
ok("the old cookie is dead after logout (session deleted on the server)", meAfter.user === null);
const checkoutAfter = await req("/api/checkout/shopify", { method: "POST", body: "{}", headers: { "content-type": "application/json", origin: ORIGIN, cookie: staleCookie } }, "198.51.100.30");
ok("the old cookie can no longer place an order (401)", checkoutAfter.status === 401);
// sign back in for the rate-limit section below
{ const re = await post("/api/auth/login", { email, password: goodPw }, {}, "203.0.113.92"); const sc = sessionFrom(re); if (sc) COOKIE = sc.split(";")[0]; }
// per-IP sign-up cap
let capped = 0; for (let i = 0; i < 7; i++) { const r = await post("/api/auth/register", { ...reg, email: `cap${i}-${Date.now()}@example.com` }, {}, "203.0.113.99"); if (r.status === 429) capped++; }
ok("sign-ups are capped per IP (429 after 5/hour)", capped >= 1, `capped=${capped}`);

// ---------- rate limiting (last: it exhausts a bucket)
let limited = 0, retryAfter = null;
for (let i = 0; i < 16; i++) {
  const r = await post("/api/checkout/shopify", { items: [validItem] }, {}, "203.0.113.77");
  if (r.status === 429) { limited++; retryAfter = r.headers.get("retry-after"); }
}
ok("checkout is rate limited (429 + Retry-After after 10/min)", limited >= 5 && Boolean(retryAfter), `limited=${limited}`);
ok("another client is not affected by that limit", (await post("/api/checkout/shopify", { items: [validItem] }, {}, "203.0.113.78")).status !== 429);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
