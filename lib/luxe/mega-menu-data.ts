import type { Product } from "../types";

/**
 * Mega-menu content model.
 *
 * UX principles baked into the data (see components/layout/mega-menu.tsx for the UI side):
 *  - Hick's law / Miller's law: 6 top categories, max 3 groups per category, max 6 links per group.
 *  - Information scent: a link only exists if it leads to at least one real product, and it shows that count.
 *    (No dead ends, no empty result pages.)
 *  - Truthful social proof: "New" / "Sale" badges are derived from real product data, never invented.
 *  - Serial position effect: pinned "Best sellers" and "New arrivals" come first, "Shop all" comes last.
 */
export interface MenuCategory { slug: string; name: string; icon: "Zap" | "Shirt" | "Home" | "Dumbbell" | "Gem" | "Sparkles"; tagline: string; groups: { title: string; terms: [string, string][] }[] }

// term = [label shown, search term sent to /shop?q=]
export const MENU_CATEGORIES: MenuCategory[] = [
  { slug: "electronics", name: "Electronics", icon: "Zap", tagline: "Tech essentials", groups: [
    { title: "Audio", terms: [["Headphones", "headphone"], ["Earbuds", "earbud"], ["Speakers", "speaker"]] },
    { title: "Smart tech", terms: [["Smart home", "smart"], ["Chargers", "charger"], ["Keyboards", "keyboard"]] },
    { title: "Computing", terms: [["Laptops", "laptop"], ["Tablets", "tablet"], ["Monitors", "monitor"]] },
  ] },
  { slug: "fashion", name: "Fashion", icon: "Shirt", tagline: "Style & apparel", groups: [
    { title: "Outerwear", terms: [["Jackets", "jacket"], ["Coats", "coat"], ["Hoodies", "hoodie"]] },
    { title: "Essentials", terms: [["Shirts & tees", "shirt"], ["Knitwear", "sweater"], ["Scarves", "scarf"]] },
    { title: "Bottoms & sets", terms: [["Jeans", "jeans"], ["Trousers", "trouser"], ["Sleepwear", "sleep"]] },
  ] },
  { slug: "home", name: "Home & Living", icon: "Home", tagline: "Interior design", groups: [
    { title: "Kitchen", terms: [["Coffee", "coffee"], ["Cookware", "pan"], ["Mugs", "mug"]] },
    { title: "Decor", terms: [["Vases", "vase"], ["Lighting", "lamp"], ["Candles", "candle"]] },
    { title: "Smart living", terms: [["Smart home", "smart"], ["Cleaning", "vacuum"]] },
  ] },
  { slug: "sports", name: "Sports", icon: "Dumbbell", tagline: "Active lifestyle", groups: [
    { title: "Footwear", terms: [["Running shoes", "shoe"], ["Sneakers", "sneaker"]] },
    { title: "Training", terms: [["Yoga", "yoga"], ["Fitness", "fitness"], ["Weights", "dumbbell"]] },
    { title: "Outdoor", terms: [["Backpacks", "backpack"], ["Bottles", "bottle"], ["Cycling", "bike"]] },
  ] },
  { slug: "accessories", name: "Accessories", icon: "Gem", tagline: "Finishing touches", groups: [
    { title: "Watches & eyewear", terms: [["Watches", "watch"], ["Sunglasses", "sunglass"]] },
    { title: "Bags", terms: [["Bags", "bag"], ["Backpacks", "backpack"], ["Wallets", "wallet"]] },
    { title: "Jewellery", terms: [["Necklaces", "necklace"], ["Rings", "ring"], ["Bracelets", "bracelet"]] },
  ] },
  { slug: "beauty", name: "Beauty", icon: "Sparkles", tagline: "Self-care essentials", groups: [
    { title: "Skincare", terms: [["Serums", "serum"], ["Moisturisers", "cream"], ["Masks", "mask"]] },
    { title: "Makeup", terms: [["Lipstick", "lip"], ["Palettes", "palette"]] },
    { title: "Self-care", terms: [["Sleep", "sleep"], ["Fragrance", "perfume"], ["Hair", "hair"]] },
  ] },
];

export interface MenuLink { label: string; href: string; count: number; badge?: "New" | "Sale" }
export interface MenuGroup { title: string; links: MenuLink[] }
export interface BuiltCategory {
  slug: string; name: string; icon: MenuCategory["icon"]; tagline: string;
  count: number; href: string; pinned: { label: string; href: string; kind: "hot" | "new" }[];
  groups: MenuGroup[]; featured?: Product; popular: Product[];
}

/** Same matching rule as the shop page's ?q= filter, so counts always equal what the visitor will see. */
export function matchesTerm(p: Product, term: string): boolean {
  const t = term.toLowerCase();
  return p.name.toLowerCase().includes(t) || p.description.toLowerCase().includes(t) || p.tags.some((x) => x.toLowerCase().includes(t));
}

export function buildMenu(products: Product[]): BuiltCategory[] {
  return MENU_CATEGORIES.map((c) => {
    const items = products.filter((p) => p.category === c.slug);
    const base = `/shop?category=${c.slug}`;

    const groups = c.groups
      .map((g): MenuGroup => ({
        title: g.title,
        links: g.terms
          .map(([label, term]): MenuLink | null => {
            const m = items.filter((p) => matchesTerm(p, term));
            if (!m.length) return null; // information scent: never link to an empty result
            const badge = m.some((p) => p.badge === "new") ? "New" : m.some((p) => p.originalPrice > p.price) ? "Sale" : undefined;
            return { label, href: `${base}&q=${encodeURIComponent(term)}`, count: m.length, badge };
          })
          .filter((l): l is MenuLink => l !== null)
          .slice(0, 6),
      }))
      .filter((g) => g.links.length > 0);

    const inStock = items.filter((p) => p.inStock && p.images[0]);
    const featured = [...inStock].sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)[0];
    const popular = [...inStock].filter((p) => p.id !== featured?.id).sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 4);

    return {
      slug: c.slug, name: c.name, icon: c.icon, tagline: c.tagline, count: items.length, href: base,
      pinned: items.length > 1 ? [{ label: "Best sellers", href: `${base}&sort=bestselling`, kind: "hot" as const }, { label: "New arrivals", href: `${base}&sort=newest`, kind: "new" as const }] : [],
      groups, featured, popular,
    };
  });
}
