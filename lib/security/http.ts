import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";

export const requestId = (req: Request) => {
  const id = req.headers.get("x-request-id");
  return id && /^[A-Za-z0-9-]{8,64}$/.test(id) ? id : crypto.randomUUID();
};

/** JSON response that is never cached unless the caller says so. */
export function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

/** Client-safe error: stable code + generic message + request id (details go to the server log only). */
export function apiError(status: number, code: string, message: string, rid: string) {
  return jsonResponse({ error: { code, message }, requestId: rid }, status, { "x-request-id": rid });
}

export type BodyResult = { ok: true; data: unknown } | { ok: false; status: number; code: string; message: string };

/** Reads a JSON body with a hard size cap and content-type check. */
export async function readJsonBody(req: Request, maxBytes = 16_384): Promise<BodyResult> {
  const ct = (req.headers.get("content-type") || "").toLowerCase();
  if (!ct.startsWith("application/json")) return { ok: false, status: 415, code: "unsupported_media_type", message: "Content-Type must be application/json." };
  const declared = Number(req.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes) return { ok: false, status: 413, code: "payload_too_large", message: "Request body too large." };
  const text = await req.text();
  if (new TextEncoder().encode(text).length > maxBytes) return { ok: false, status: 413, code: "payload_too_large", message: "Request body too large." };
  try {
    return { ok: true, data: JSON.parse(text) };
  } catch {
    return { ok: false, status: 400, code: "invalid_json", message: "Body is not valid JSON." };
  }
}

/** Constant-time string comparison (hashes first so lengths do not leak). */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}
