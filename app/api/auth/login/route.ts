import { getAuthStore } from "@/lib/auth/store";
import { dummyVerify, verifyPassword } from "@/lib/auth/password";
import { cookieOptions, createSession, hashToken, SESSION_COOKIE } from "@/lib/auth/session";
import { loginSchema } from "@/lib/auth/schemas";
import { checkLock, clearFailures, recordFailure } from "@/lib/auth/lockout";
import { toPublicUser } from "@/lib/auth/types";
import { apiError, jsonResponse, readJsonBody, requestId } from "@/lib/security/http";
import { clientIp } from "@/lib/security/rate-limit";
import { logError, logInfo, logSecurity } from "@/lib/security/logger";

const INVALID = "Invalid email or password."; // one message for every failure: never reveal which part was wrong

export async function POST(req: Request) {
  const rid = requestId(req);
  const ip = clientIp(req.headers);

  const body = await readJsonBody(req, 2048);
  if (!body.ok) return apiError(body.status, body.code, body.message, rid);

  const parsed = loginSchema.safeParse(body.data);
  if (!parsed.success) return apiError(401, "invalid_credentials", INVALID, rid);
  const { email, password, remember } = parsed.data;

  const key = `${email}|${ip}`;
  const lock = checkLock(key);
  if (lock.locked) {
    logSecurity("login_locked", { requestId: rid, ip, account: hashToken(email).slice(0, 12) });
    return jsonResponse({ error: { code: "too_many_attempts", message: "Too many failed attempts. Please wait and try again." }, requestId: rid }, 429, { "Retry-After": String(lock.retryAfter) });
  }

  try {
    const store = getAuthStore();
    const user = await store.findUserByEmail(email);
    let ok = false;
    if (user) ok = await verifyPassword(password, user.passwordHash);
    else await dummyVerify(password); // same work as a real check: response time does not reveal unknown emails

    if (!user || !ok) {
      recordFailure(key);
      logSecurity("login_failed", { requestId: rid, ip, account: hashToken(email).slice(0, 12) });
      return apiError(401, "invalid_credentials", INVALID, rid);
    }

    clearFailures(key);
    const token = await createSession(user.id, Boolean(remember)); // fresh token per login
    const res = jsonResponse({ user: toPublicUser(user) }, 200, { "x-request-id": rid });
    res.cookies.set(SESSION_COOKIE, token, cookieOptions(Boolean(remember)));
    logInfo("auth.login", { requestId: rid, userId: user.id });
    return res;
  } catch (e) {
    logError("login_failed_internal", e, { requestId: rid });
    return apiError(500, "internal_error", "We could not sign you in right now. Please try again.", rid);
  }
}
