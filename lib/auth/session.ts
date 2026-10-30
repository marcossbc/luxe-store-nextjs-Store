import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { getAuthStore } from "./store";
import { toPublicUser, type PublicUser } from "./types";

export const SESSION_COOKIE = "dahab_session";
const REMEMBER_MS = 30 * 24 * 3600_000;   // "Remember me": 30 days
const SHORT_MS = 12 * 3600_000;           // otherwise: browser-session cookie, valid for 12 hours server-side

/** Only a SHA-256 hash of the token is stored, so a leaked database/file cannot be used to hijack sessions. */
export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
const newToken = () => randomBytes(32).toString("base64url");

export function cookieOptions(remember: boolean) {
  const insecureOk = process.env.AUTH_INSECURE_COOKIES === "1"; // explicit opt-out for plain-http deployments only
  return {
    httpOnly: true,                                            // not readable by scripts (XSS cannot steal it)
    secure: process.env.NODE_ENV === "production" && !insecureOk,
    sameSite: "lax" as const,                                  // not sent on cross-site POSTs (CSRF)
    path: "/",
    ...(remember ? { maxAge: REMEMBER_MS / 1000 } : {}),
  };
}

/** Creates a fresh session (a new token on every login: no session fixation). */
export async function createSession(userId: string, remember: boolean): Promise<string> {
  const token = newToken();
  const now = Date.now();
  await getAuthStore().saveSession({
    tokenHash: hashToken(token),
    userId,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + (remember ? REMEMBER_MS : SHORT_MS)).toISOString(),
  });
  return token;
}

export async function destroySession(token: string | undefined): Promise<void> {
  if (token) await getAuthStore().deleteSession(hashToken(token));
}

/** Resolves the signed-in user from the request cookie, or null. Cached per request. */
export const getCurrentUser = cache(async (): Promise<PublicUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || token.length < 20 || token.length > 100) return null;
  try {
    const store = getAuthStore();
    const session = await store.findSession(hashToken(token));
    if (!session) return null;
    const user = await store.findUserById(session.userId);
    return user ? toPublicUser(user) : null;
  } catch {
    return null; // storage trouble must never turn a page into a 500; the visitor is simply treated as signed out
  }
});
