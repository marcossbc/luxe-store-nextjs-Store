import type { Product } from "../types";

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN;
const API_VERSION = "2025-07";

export const shopifyEnabled = () => Boolean(DOMAIN && TOKEN);

export async function shopifyFetch<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(`https://${DOMAIN}/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": TOKEN as string,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`Shopify ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data as T;
}

const PRODUCTS_QUERY = `
query Products($first: Int!) {
  products(first: $first) {
    nodes {
      id handle title description tags productType vendor availableForSale totalInventory createdAt
      images(first: 6) { nodes { url } }
      priceRange { minVariantPrice { amount } }
      compareAtPriceRange { minVariantPrice { amount } }
      variants(first: 50) { nodes { id sku title availableForSale price { amount } image { url } selectedOptions { name value } } }
    }
  }
}`;

const toSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function mapVariants(nodes: any[]) {
  if (!nodes || (nodes.length <= 1 && nodes[0]?.title === "Default Title")) return undefined;
  return nodes.map((v) => {
    const opt = (re: RegExp) => v.selectedOptions?.find((o: any) => re.test(o.name))?.value as string | undefined;
    return {
      id: v.id as string,
      title: v.title as string,
      color: opt(/colou?r/i),
      size: opt(/size/i),
      sku: v.sku as string | undefined,
      price: v.price ? parseFloat(v.price.amount) : undefined,
      image: v.image?.url as string | undefined,
      inStock: Boolean(v.availableForSale),
    };
  });
}

function mapProduct(n: any): Product {
  const price = parseFloat(n.priceRange.minVariantPrice.amount);
  const compare = parseFloat(n.compareAtPriceRange?.minVariantPrice?.amount || "0");
  const category = toSlug(n.productType || "general");
  return {
    id: `shopify-${n.handle}`,
    externalId: n.id,
    variantId: n.variants.nodes[0]?.id,
    source: "shopify",
    name: n.title,
    slug: n.handle,
    description: n.description || "",
    shortDescription: (n.description || "").slice(0, 120),
    price,
    originalPrice: compare > price ? compare : price,
    rating: 4.5,
    reviewCount: 0,
    images: n.images.nodes.map((i: any) => i.url),
    category,
    categoryName: n.productType || "General",
    tags: n.tags || [],
    badge: compare > price ? "sale" : undefined,
    inStock: n.availableForSale,
    stockCount: n.totalInventory && n.totalInventory > 0 ? n.totalInventory : 99,
    sku: n.variants.nodes[0]?.sku || n.handle,
    features: [],
    specifications: n.vendor ? { Brand: n.vendor } : {},
    createdAt: n.createdAt,
    variants: mapVariants(n.variants.nodes),
  };
}

export async function getShopifyProducts(limit = 100): Promise<Product[]> {
  if (!shopifyEnabled()) return [];
  const data = await shopifyFetch<{ products: { nodes: any[] } }>(PRODUCTS_QUERY, { first: Math.min(limit, 250) });
  return data.products.nodes.map(mapProduct);
}

/** Creates a Shopify cart and returns the hosted checkout URL (Shopify handles payment). */
export async function createShopifyCheckout(lines: { variantId: string; quantity: number }[]): Promise<string> {
  const data = await shopifyFetch<any>(
    `mutation($lines: [CartLineInput!]!) {
      cartCreate(input: { lines: $lines }) {
        cart { checkoutUrl }
        userErrors { message }
      }
    }`,
    { lines: lines.map((l) => ({ merchandiseId: l.variantId, quantity: l.quantity })) }
  );
  const err = data.cartCreate.userErrors?.[0]?.message;
  if (err) throw new Error(err);
  return data.cartCreate.cart.checkoutUrl;
}
