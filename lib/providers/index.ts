import "server-only";
import type { Product } from "../types";
import { productSources } from "../env";
import { products as staticProducts, getProductBySlug as staticBySlug } from "../data";
import { getShopifyProducts, shopifyEnabled } from "./shopify";
import { getCjProducts, getCjProductByPid, cjEnabled } from "./cj";

// Demo catalogue only: gives the static products size/colour options so the selector can be previewed.
function withDemoVariants(p: Product): Product {
  if (p.variants || !["fashion", "accessories", "sports"].includes(p.category)) return p;
  const colors = ["Black", "Navy", "Sand"];
  const sizes = p.category === "fashion" ? ["S", "M", "L", "XL"] : ["One size"];
  const variants = colors.flatMap((color) =>
    sizes.map((size, i) => ({
      id: `${p.id}-${color}-${size}`,
      title: `${color} / ${size}`,
      color,
      size,
      inStock: !(color === "Sand" && i === sizes.length - 1),
    }))
  );
  return { ...p, variants };
}

const sources = () => productSources();

export async function getAllProducts(opts: { q?: string } = {}): Promise<Product[]> {
  const want = sources();
  const jobs: Promise<Product[]>[] = [];
  if (want.includes("shopify") && shopifyEnabled()) jobs.push(getShopifyProducts().catch((e) => (console.error(e), [])));
  if (want.includes("cj") && cjEnabled()) jobs.push(getCjProducts(40, opts.q).catch((e) => (console.error(e), [])));
  if (want.includes("static")) jobs.push(Promise.resolve(staticProducts.map((p) => withDemoVariants({ ...p, source: "static" as const }))));
  const all = (await Promise.all(jobs)).flat();
  // never show an empty store: fall back to demo data
  return all.length ? all : staticProducts.map((p) => withDemoVariants({ ...p, source: "static" as const }));
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  if (slug.startsWith("cj-") && cjEnabled()) {
    const p = await getCjProductByPid(slug.slice(3)).catch(() => undefined);
    if (p) return p;
  }
  const all = await getAllProducts();
  return all.find((p) => p.slug === slug) || staticBySlug(slug);
}
