import { createCjOrder } from "@/lib/providers/cj";
import { webhookSecret } from "@/lib/env";
import { cjOrderSchema } from "@/lib/security/validate";
import { apiError, jsonResponse, readJsonBody, requestId, safeEqual } from "@/lib/security/http";
import { clientIp } from "@/lib/security/rate-limit";
import { logError, logInfo, logSecurity } from "@/lib/security/logger";

/**
 * Server-to-server only. Call it from your payment provider's webhook handler AFTER the payment is
 * verified (e.g. Stripe signature check). It never accepts browser traffic: no CORS, shared secret required.
 */

// Idempotency: webhook retries must not fulfil the same order twice. (In-memory: use a DB/Redis in multi-instance setups.)
const processed = new Set<string>();
const MAX_REMEMBERED = 5000;

export async function POST(req: Request) {
  const rid = requestId(req);

  const secret = webhookSecret();
  if (!secret) {
    // fail closed: an unset or weak secret disables the endpoint instead of leaving it open
    return apiError(503, "not_configured", "Order endpoint is not available.", rid);
  }
  const provided = req.headers.get("x-order-secret") ?? "";
  if (!safeEqual(provided, secret)) {
    logSecurity("orders_auth_failed", { requestId: rid, ip: clientIp(req.headers) });
    return apiError(401, "unauthorized", "Unauthorized.", rid);
  }

  const body = await readJsonBody(req);
  if (!body.ok) return apiError(body.status, body.code, body.message, rid);

  const parsed = cjOrderSchema.safeParse(body.data);
  if (!parsed.success) {
    logSecurity("validation_failed", { route: "/api/orders/cj", requestId: rid }); // body is never logged (contains PII)
    return apiError(400, "invalid_order", "Order payload is invalid.", rid);
  }
  const order = parsed.data;

  if (processed.has(order.orderNumber)) {
    return jsonResponse({ ok: true, duplicate: true }, 200, { "x-request-id": rid });
  }

  try {
    await createCjOrder({ orderNumber: order.orderNumber, customer: order.customer, items: order.items });
    processed.add(order.orderNumber);
    if (processed.size > MAX_REMEMBERED) processed.delete(processed.values().next().value as string);
    logInfo("cj_order_created", { requestId: rid, orderNumber: order.orderNumber, lines: order.items.length });
    return jsonResponse({ ok: true }, 200, { "x-request-id": rid });
  } catch (e) {
    logError("cj_order_failed", e, { requestId: rid, orderNumber: order.orderNumber });
    return apiError(502, "fulfilment_unavailable", "Could not forward the order.", rid);
  }
}
