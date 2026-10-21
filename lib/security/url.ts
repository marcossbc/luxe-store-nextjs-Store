/** Returns the normalised URL only if it is plain https (no credentials), otherwise undefined. */
export function safeHttpsUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || value.length > 2048) return undefined;
  try {
    const u = new URL(value.trim());
    if (u.protocol !== "https:" || u.username || u.password) return undefined;
    return u.href;
  } catch {
    return undefined;
  }
}

/**
 * Open-redirect guard: the checkout URL returned by Shopify is only passed to the browser if it
 * points at the shop's own domain, a *.myshopify.com / *.shopify.com host, or a host the operator
 * explicitly allow-listed (SHOPIFY_CHECKOUT_HOSTS, comma separated) such as a custom checkout domain.
 */
export function isAllowedCheckoutUrl(value: string, shopDomain?: string, extraHosts: string[] = []): boolean {
  const safe = safeHttpsUrl(value);
  if (!safe) return false;
  const host = new URL(safe).hostname.toLowerCase();
  const allow = [shopDomain, ...extraHosts].filter(Boolean).map((h) => (h as string).toLowerCase());
  return allow.includes(host) || host.endsWith(".myshopify.com") || host === "shopify.com" || host.endsWith(".shopify.com");
}
