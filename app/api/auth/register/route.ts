import { randomUUID } from "node:crypto";
import { getAuthStore } from "@/lib/auth/store";
import { hashPassword } from "@/lib/auth/password";
import { createSession, cookieOptions, SESSION_COOKIE } from "@/lib/auth/session";
import { fieldErrors, registerSchema } from "@/lib/auth/schemas";
import { toPublicUser } from "@/lib/auth/types";
import { apiError, jsonResponse, readJsonBody, requestId } from "@/lib/security/http";
import { clientIp, rateLimit } from "@/lib/security/rate-limit";
import { logError, logInfo, logSecurity } from "@/lib/security/logger";

export async function POST(req: Request) {
  const rid = requestId(req);
  const ip = clientIp(req.headers);

  // account-creation abuse: 5 sign-ups per IP per hour (on top of the generic API limiter in middleware)
  const rl = rateLimit(`register:${ip}`, 5, 3_600_000);
  if (!rl.ok) {
    logSecurity("register_rate_limited", { requestId: rid, ip });
    return jsonResponse({ error: { code: "rate_limited", message: "Too many sign-ups from this network. Please try again later." }, requestId: rid }, 429, { "Retry-After": String(rl.retryAfter) });
  }

  const body = await readJsonBody(req, 4096);
  if (!body.ok) return apiError(body.status, body.code, body.message, rid);

  const parsed = registerSchema.safeParse(body.data);
  if (!parsed.success) {
    // validation messages are safe to show (they describe the rule, never echo values)
    return jsonResponse({ error: { code: "invalid_input", message: "Please correct the highlighted fields.", fields: fieldErrors(parsed.error) }, requestId: rid }, 400);
  }
  const { name, email, password, remember } = parsed.data;

  try {
    const store = getAuthStore();
    const taken = () => jsonResponse({ error: { code: "email_taken", message: "An account with this email already exists.", fields: { email: "An account with this email already exists. Try signing in." } }, requestId: rid }, 409);
    if (await store.findUserByEmail(email)) return taken();

    const now = new Date().toISOString();
    const created = await store.createUser({ id: randomUUID(), name, email, passwordHash: await hashPassword(password), createdAt: now, termsAcceptedAt: now });
    if (!created.ok) return taken(); // lost a race with a parallel sign-up for the same email

    const token = await createSession(created.user.id, Boolean(remember));
    const res = jsonResponse({ user: toPublicUser(created.user) }, 201, { "x-request-id": rid });
    res.cookies.set(SESSION_COOKIE, token, cookieOptions(Boolean(remember)));
    logInfo("auth.register", { requestId: rid, userId: created.user.id });
    return res;
  } catch (e) {
    logError("register_failed", e, { requestId: rid });
    return apiError(500, "internal_error", "We could not create your account. Please try again.", rid);
  }
}
