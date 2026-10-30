/**
 * Brute-force protection per (email, IP): 5 failed sign-ins lock that pair for 15 minutes.
 * Keyed by IP as well, so an attacker cannot lock a real customer out of their own account from elsewhere.
 * In-memory (single instance). Use a shared store (Redis) if you scale out.
 */
interface Rec { count: number; first: number; lockedUntil: number }
const g = globalThis as unknown as { __dahabLockout?: Map<string, Rec> };
const fails = (g.__dahabLockout ??= new Map<string, Rec>());

export const MAX_FAILS = 5;
export const WINDOW_MS = 15 * 60_000;
export const LOCK_MS = 15 * 60_000;

export function checkLock(key: string, now = Date.now()): { locked: boolean; retryAfter: number } {
  const r = fails.get(key);
  if (r && r.lockedUntil > now) return { locked: true, retryAfter: Math.ceil((r.lockedUntil - now) / 1000) };
  return { locked: false, retryAfter: 0 };
}

export function recordFailure(key: string, now = Date.now()): void {
  let r = fails.get(key);
  if (!r || now - r.first > WINDOW_MS) r = { count: 0, first: now, lockedUntil: 0 };
  r.count += 1;
  if (r.count >= MAX_FAILS) r.lockedUntil = now + LOCK_MS;
  fails.set(key, r);
  if (fails.size > 10_000) for (const [k, v] of fails) { if (v.lockedUntil < now && now - v.first > WINDOW_MS) fails.delete(k); }
}

export const clearFailures = (key: string) => void fails.delete(key);
export const __resetLockout = () => fails.clear();
