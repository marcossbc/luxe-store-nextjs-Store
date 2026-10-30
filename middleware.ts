import { NextRequest, NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/security/rate-limit";
import { logSecurity } from "@/lib/security/logger";

const isProd = process.env.NODE_ENV === "production";
const MAX_API_BODY = 16_384;
const PROTECTED_PAGES = ["/profile", "/checkout"];
const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/** First matching rule wins. Counted per client IP. */
const LIMITS = [
  // sign-in / sign-up: strict, on top of the per-account lockout and per-IP sign-up cap inside the routes
  { name: "auth", test: (p: string) => p.startsWith("/api/auth/") && p !== "/api/auth/me", limit: 20, windowMs: 60_000 },
  { name: "orders", test: (p: string) => p.startsWith("/api/orders"), limit: 30, windowMs: 60_000 },
  { name: "checkout", test: (p: string) => p.startsWith("/api/checkout"), limit: 10, windowMs: 60_000 },
  { name: "api", test: (p: string) => p.startsWith("/api/"), limit: 120, windowMs: 60_000 },
];

function buildCsp(nonce: string): string {
  // optional external explainer video: allow only its origin for <video>
  let mediaExtra = "";
  try {
    const v = process.env.NEXT_PUBLIC_EXPLAINER_VIDEO_URL;
    if (v && /^https:\/\//i.test(v)) mediaExtra = ` ${new URL(v).origin}`;
  } catch { /* ignore */ }

  const d: Record<string, string[]> = {
    "default-src": ["'self'"],
    // nonce + strict-dynamic: only scripts Next.js itself emits (and what they load) can run; injected inline scripts cannot
    "script-src": ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", ...(isProd ? [] : ["'unsafe-eval'"])],
    // inline style *attributes* (framer-motion, React style props) cannot be nonced
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:", "https:"], // product photos come from Shopify / CJ / CDN hosts
    "font-src": ["'self'", "data:"],
    "connect-src": ["'self'", ...(isProd ? [] : ["ws:", "wss:"])],
    "media-src": [`'self' blob:${mediaExtra}`.trim()],
    "frame-src": ["'none'"],
    "worker-src": ["'self'", "blob:"],
    "manifest-src": ["'self'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  };
  const parts = Object.entries(d).map(([k, v]) => `${k} ${v.join(" ")}`);
  if (isProd) parts.push("upgrade-insecure-requests");
  return parts.join("; ");
}

function deny(status: number, code: string, message: string, rid: string, extra: Record<string, string> = {}) {
  return NextResponse.json({ error: { code, message }, requestId: rid }, { status, headers: { "Cache-Control": "no-store", "x-request-id": rid, ...extra } });
}

export function middleware(req: NextRequest) {
  const rid = crypto.randomUUID();
  const { pathname } = req.nextUrl;
  const ip = clientIp(req.headers);

  if (pathname.startsWith("/api/")) {
    // 1) rate limiting
    const rule = LIMITS.find((r) => r.test(pathname))!;
    const rl = rateLimit(`${rule.name}:${ip}`, rule.limit, rule.windowMs);
    const rlHeaders = { "RateLimit-Limit": String(rl.limit), "RateLimit-Remaining": String(rl.remaining), "RateLimit-Reset": String(rl.reset) };
    if (!rl.ok) {
      logSecurity("rate_limited", { requestId: rid, ip, path: pathname, bucket: rule.name });
      return deny(429, "rate_limited", "Too many requests. Please slow down.", rid, { ...rlHeaders, "Retry-After": String(rl.retryAfter) });
    }

    if (MUTATING.has(req.method)) {
      // 2) CSRF: browser-originated writes must come from this site. The server-to-server order webhook is
      //    exempt from the Origin check because it is authenticated by a shared secret instead.
      if (!pathname.startsWith("/api/orders/")) {
        const origin = req.headers.get("origin");
        const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
        const extra = (process.env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
        let ok = false;
        if (origin) {
          try { ok = new URL(origin).host === host || extra.includes(origin); } catch { ok = false; }
        } else {
          const site = req.headers.get("sec-fetch-site");
          ok = site === "same-origin" || site === "none";
        }
        if (!ok) {
          logSecurity("csrf_blocked", { requestId: rid, ip, path: pathname, origin });
          return deny(403, "forbidden_origin", "Cross-site requests are not allowed.", rid);
        }
      }
      // 3) early body-size cap (route handlers enforce it again while reading)
      const len = Number(req.headers.get("content-length"));
      if (Number.isFinite(len) && len > MAX_API_BODY) {
        logSecurity("payload_too_large", { requestId: rid, ip, path: pathname, bytes: len });
        return deny(413, "payload_too_large", "Request body too large.", rid);
      }
    }
  }

  // Fast path for signed-out visitors: no session cookie at all -> a real HTTP 307 to sign-in.
  // (This is only an early exit. Whether a cookie is VALID is decided on the server by the page layouts and the APIs.)
  if (PROTECTED_PAGES.some((p) => pathname === p || pathname.startsWith(p + "/")) && !req.cookies.get("dahab_session")?.value) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + req.nextUrl.search)}`;
    const res = NextResponse.redirect(url, 307);
    res.headers.set("Cache-Control", "no-store");
    return res;
  }

  // CSP with a fresh nonce per request. A client-supplied x-nonce is never trusted.
  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce);
  const headers = new Headers(req.headers);
  headers.set("x-request-id", rid);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", csp);

  const res = NextResponse.next({ request: { headers } });
  res.headers.set("Content-Security-Policy", csp);
  res.headers.set("x-request-id", rid);
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|avif|ico|woff2?|mp4|webm)$).*)"],
};
