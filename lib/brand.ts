/**
 * Single source of truth for the store's identity.
 * "Dahab" = "gold" (Somali / Arabic): short, easy to say worldwide, and it matches the gold accent of the UI.
 * To rename the store later, change `name` / `wordmark` here (visible text reads from this file).
 * Internal identifiers (localStorage keys such as "luxe-cart", CSS class names, folder names) are intentionally
 * left as they are so customers keep their saved carts and settings.
 */
export const BRAND = {
  name: "Dahab",
  wordmark: "DAHAB",
  tagline: "Luxury, delivered.",
  descriptor: "Premium Marketplace",
  description: "Discover curated products that blend exceptional craftsmanship with modern design.",
} as const;
