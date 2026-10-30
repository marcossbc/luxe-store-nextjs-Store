import { cookies } from "next/headers";
import { cookieOptions, destroySession, SESSION_COOKIE } from "@/lib/auth/session";
import { jsonResponse, requestId } from "@/lib/security/http";
import { logError } from "@/lib/security/logger";

/** Idempotent: always ends with the cookie cleared. The server-side session is really deleted (not just forgotten by the browser). */
export async function POST(req: Request) {
  const rid = requestId(req);
  try {
    await destroySession((await cookies()).get(SESSION_COOKIE)?.value);
  } catch (e) {
    logError("logout_failed", e, { requestId: rid });
  }
  const res = jsonResponse({ ok: true }, 200, { "x-request-id": rid });
  res.cookies.set(SESSION_COOKIE, "", { ...cookieOptions(false), maxAge: 0 });
  return res;
}
