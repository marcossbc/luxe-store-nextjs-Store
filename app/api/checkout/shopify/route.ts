import { createShopifyCheckout } from "@/lib/providers/shopify";
import { shopifyConfig, shopifyCheckoutHosts } from "@/lib/env";
import { shopifyCheckoutSchema } from "@/lib/security/validate";
import { apiError, jsonResponse, readJsonBody, requestId } from "@/lib/security/http";
import { isAllowedCheckoutUrl } from "@/lib/security/url";
import { logError, logSecurity } from "@/lib/security/logger";

export async function POST(req: Request) {
  const rid = requestId(req);

  const body = await readJsonBody(req);
  if (!body.ok) return apiError(body.status, body.code, body.message, rid);

  const parsed = shopifyCheckoutSchema.safeParse(body.data);
  if (!parsed.success) {
    // The cart must be 100% Shopify lines: silently dropping CJ/demo lines would charge for a partial order.
    logSecurity("validation_failed", { route: "/api/checkout/shopify", requestId: rid });
    return apiError(400, "invalid_cart", "Your cart could not be validated.", rid);
  }

  // Only variant id + quantity are used. Prices always come from Shopify, never from the browser.
  const merged = new Map<string, number>();
  for (const i of parsed.data.items) merged.set(i.variantId, Math.min(99, (merged.get(i.variantId) ?? 0) + i.quantity));
  const lines = [...merged].map(([variantId, quantity]) => ({ variantId, quantity }));

  const cfg = shopifyConfig();
  if (!cfg) return apiError(503, "not_configured", "Checkout is not available right now.", rid);

  try {
    const url = await createShopifyCheckout(lines);
    if (!isAllowedCheckoutUrl(url, cfg.domain, shopifyCheckoutHosts())) {
      logSecurity("checkout_url_rejected", { requestId: rid, host: safeHost(url) });
      return apiError(502, "checkout_unavailable", "Checkout is temporarily unavailable.", rid);
    }
    return jsonResponse({ url }, 200, { "x-request-id": rid });
  } catch (e) {
    logError("checkout_failed", e, { requestId: rid });
    return apiError(502, "checkout_unavailable", "Checkout is temporarily unavailable.", rid);
  }
}

function safeHost(u: string) {
  try { return new URL(u).hostname; } catch { return "invalid"; }
}
