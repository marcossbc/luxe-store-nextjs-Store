# Security

## Reporting a vulnerability
Please report it privately through GitHub's **"Report a vulnerability"** (Security tab) rather than a public issue.

## What is enforced in this codebase
| Area | Control | Where |
|---|---|---|
| Headers | CSP with per-request nonce + `strict-dynamic`, HSTS (prod), `X-Frame-Options`, `nosniff`, Referrer/Permissions/COOP/CORP policies, no `X-Powered-By` | `middleware.ts`, `next.config.js` |
| Input validation | Zod schemas for slugs, search, checkout cart, CJ orders (strict, size-capped, control chars rejected) | `lib/security/validate.ts` |
| CSRF | Origin / `Sec-Fetch-Site` check on every write to `/api/*` | `middleware.ts` |
| Rate limiting | Per-IP: 120/min API, 10/min checkout, 30/min orders; `429` + `Retry-After` | `middleware.ts`, `lib/security/rate-limit.ts` |
| Order webhook | Shared secret (>=24 chars, timing-safe compare), fail-closed when unset, idempotent by order number, no PII in logs | `app/api/orders/cj/route.ts` |
| Checkout | Prices never trusted from the browser; redirect URL allow-listed (open-redirect guard) | `app/api/checkout/shopify/route.ts`, `lib/security/url.ts` |
| Secrets | Server-only config validated at use, `server-only` imports, secrets redacted from logs, `.env*` git-ignored | `lib/env.ts`, `lib/security/logger.ts` |
| Upstream calls | Fixed hosts, 8s timeouts, https-only image URLs, validated Shopify domain (SSRF guard) | `lib/providers/*` |
| Client storage | Cart/wishlist/preferences validated and size-limited when read back | `lib/security/storage.ts` |
| Supply chain | Dependabot, weekly audit + CodeQL, `audit:prod` gate in CI | `.github/` |

## Operating rules
* Rotate any key that has ever been committed, pasted in chat, or shared. Treat `.env` files as secrets.
* Behind a proxy/CDN, make sure it overwrites `X-Forwarded-For` so rate limiting sees real client IPs.
* Rate-limit state is in-process. On serverless or multiple instances, back it with a shared store (e.g. Upstash Redis).
* Run `npm test`, `npm run audit:prod` and `npm run test:smoke` before each release.

## Not implemented yet (by design: there is no backend for them)
User accounts, sessions, database and payment processing do not exist in this project. When added:
use a maintained auth library with httpOnly/secure/sameSite cookies, hash passwords with Argon2id/bcrypt,
verify payment-provider webhook signatures (e.g. Stripe `constructEvent`) before calling `/api/orders/cj`,
and recompute all prices server-side.
