/**
 * Fixed-window rate limiter. Edge-safe (no Node APIs) so it can run in middleware.
 *
 * NOTE: state lives in process memory. That is correct for a single Node server, but on
 * serverless / multi-instance deployments each instance counts separately. For those, swap
 * `rateLimit` for a shared store (e.g. Upstash Redis) behind the same signature.
 */
interface Entry { count: number; reset: number }

const store = new Map<string, Entry>();
const MAX_KEYS = 10_000;
let lastSweep = 0;

export interface RateResult {
  ok: boolean;
  limit: number;
  remaining: number;
  /** epoch seconds when the window resets */
  reset: number;
  retryAfter: number;
}

function sweep(now: number) {
  lastSweep = now;
  for (const [k, e] of store) if (e.reset <= now) store.delete(k);
  // hard cap so an attacker rotating keys cannot grow memory without bound
  if (store.size > MAX_KEYS) {
    let drop = store.size - MAX_KEYS + 1000;
    for (const k of store.keys()) { store.delete(k); if (--drop <= 0) break; }
  }
}

export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()): RateResult {
  if (now - lastSweep > 30_000 || store.size > MAX_KEYS) sweep(now);
  let e = store.get(key);
  if (!e || e.reset <= now) {
    e = { count: 0, reset: now + windowMs };
    store.set(key, e);
  }
  e.count += 1;
  const ok = e.count <= limit;
  return {
    ok,
    limit,
    remaining: Math.max(0, limit - e.count),
    reset: Math.ceil(e.reset / 1000),
    retryAfter: Math.max(1, Math.ceil((e.reset - now) / 1000)),
  };
}

/** Test helper */
export function __resetRateLimit() { store.clear(); lastSweep = 0; }

/**
 * Best-effort client IP. x-forwarded-for is only trustworthy behind a proxy you control
 * (Vercel, Cloudflare, nginx). If the app is exposed directly, clients can spoof it.
 */
export function clientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = xff || headers.get("x-real-ip") || headers.get("cf-connecting-ip") || "unknown";
  return ip.slice(0, 64);
}
