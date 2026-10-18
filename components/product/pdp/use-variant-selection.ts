"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { buildGroups, findVariant, type Selection } from "./variant-selector";

/** Variant state shared by PDP layouts. Each variant becomes its own cart line and keeps its Shopify/CJ variantId. */
export function useVariantSelection(product: Product) {
  const variants = product.variants;
  const groups = useMemo(() => (variants?.length ? buildGroups(variants) : []), [variants]);

  const [selection, setSelection] = useState<Selection>(() => {
    const first = variants?.find((v) => v.inStock) ?? variants?.[0];
    return first ? Object.fromEntries(groups.map((g) => [g.label, g.pick(first) ?? ""])) : {};
  });

  const variant = variants ? findVariant(variants, groups, selection) : undefined;
  const price = variant?.price ?? product.price;
  const originalPrice = variant?.price ? Math.max(product.originalPrice * (variant.price / product.price), variant.price) : product.originalPrice;
  const inStock = variant ? variant.inStock : product.inStock;
  const stock = variant?.stock ?? product.stockCount;

  const images = useMemo(() => {
    const extra = (variants ?? []).map((v) => v.image).filter(Boolean) as string[];
    return Array.from(new Set([...product.images, ...extra]));
  }, [product.images, variants]);

  const select = (label: string, value: string) =>
    setSelection((s) => {
      const next = { ...s, [label]: value };
      if (variants && !findVariant(variants, groups, next)?.inStock) {
        const alt = variants.find((v) => v.inStock && groups.find((g) => g.label === label)?.pick(v) === value);
        if (alt) return Object.fromEntries(groups.map((g) => [g.label, g.pick(alt) ?? ""]));
      }
      return next;
    });

  const cartItem = (): Product | null => {
    if (variants?.length && !variant) return null;
    if (!variant) return product;
    return {
      ...product,
      id: `${product.id}__${variant.id}`,
      name: `${product.name} (${variant.title})`,
      price,
      originalPrice,
      variantId: variant.id,
      images: [variant.image ?? product.images[0], ...product.images],
      stockCount: stock || 99,
    };
  };

  return { variants, groups, selection, select, variant, price, originalPrice, inStock, stock, images, cartItem };
}
