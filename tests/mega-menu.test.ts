import { describe, expect, it } from "vitest";
import { buildMenu, matchesTerm } from "@/lib/luxe/mega-menu-data";
import type { Product } from "@/lib/types";

const mk = (o: Partial<Product>): Product => ({
  id: "p", name: "Item", slug: "item", description: "", shortDescription: "", price: 100, originalPrice: 100, rating: 4, reviewCount: 10,
  images: ["https://x.com/a.png"], category: "fashion", categoryName: "Fashion", tags: [], inStock: true, stockCount: 5, sku: "S", features: [], specifications: {}, createdAt: "2026-01-01", ...o,
} as Product);

describe("mega menu data", () => {
  const products = [
    mk({ id: "1", name: "Luxe Leather Jacket", category: "fashion", price: 80, originalPrice: 120, rating: 4.9, reviewCount: 50 }),
    mk({ id: "2", name: "Cashmere Scarf", category: "fashion", badge: "new", rating: 4.2, reviewCount: 5 }),
    mk({ id: "3", name: "Mechanical Keyboard", category: "electronics" }),
  ];
  const menu = buildMenu(products);
  const fashion = menu.find((c) => c.slug === "fashion")!;

  it("only links to terms that have real products (no dead ends) and counts them", () => {
    const labels = fashion.groups.flatMap((g) => g.links.map((l) => l.label));
    expect(labels).toEqual(expect.arrayContaining(["Jackets", "Scarves"]));
    expect(labels).not.toContain("Jeans");
    expect(fashion.groups.flatMap((g) => g.links).every((l) => l.count > 0)).toBe(true);
  });
  it("badges come from real data", () => {
    const links = fashion.groups.flatMap((g) => g.links);
    expect(links.find((l) => l.label === "Jackets")?.badge).toBe("Sale");
    expect(links.find((l) => l.label === "Scarves")?.badge).toBe("New");
  });
  it("hrefs match the shop page filters and are URL-encoded", () => {
    expect(fashion.groups[0].links[0].href).toMatch(/^\/shop\?category=fashion&q=[a-z%0-9]+$/);
    expect(fashion.pinned.map((p) => p.href)).toEqual(["/shop?category=fashion&sort=bestselling", "/shop?category=fashion&sort=newest"]);
  });
  it("picks the top-rated in-stock product as featured", () => expect(fashion.featured?.id).toBe("1"));
  it("a category with no products yields an empty but valid entry", () => {
    const beauty = menu.find((c) => c.slug === "beauty")!;
    expect(beauty.groups).toEqual([]); expect(beauty.featured).toBeUndefined(); expect(beauty.pinned).toEqual([]);
  });
  it("matchesTerm mirrors the shop filter (name, description, tags, case-insensitive)", () => {
    expect(matchesTerm(mk({ name: "Red JACKET" }), "jacket")).toBe(true);
    expect(matchesTerm(mk({ tags: ["Winter"] }), "winter")).toBe(true);
    expect(matchesTerm(mk({ description: "warm coat" }), "coat")).toBe(true);
    expect(matchesTerm(mk({}), "zzz")).toBe(false);
  });
});
