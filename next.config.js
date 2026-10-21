/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'

// Content-Security-Policy is set per request (with a nonce) in middleware.ts.
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), usb=(), interest-cohort=(), payment=(self)' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-site' },
  { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
  ...(isProd ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }] : []),
]

// Account / cart / checkout pages: never cached by shared caches, never indexed.
const privatePage = [
  { key: 'Cache-Control', value: 'private, no-store' },
  { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
]

const nextConfig = {
  poweredByHeader: false, // do not advertise the framework
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  images: {
    // the optimiser is an image proxy: keep the allow-list as small as possible (no wildcard bucket hosts)
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'cdn.shopify.com' },
      { protocol: 'https', hostname: '**.cjdropshipping.com' },
      { protocol: 'https', hostname: '**.cjcdn.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      ...['/profile', '/cart', '/checkout', '/wishlist', '/login', '/register'].map((source) => ({ source, headers: privatePage })),
    ]
  },
}

module.exports = nextConfig
