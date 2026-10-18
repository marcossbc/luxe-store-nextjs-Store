"use client";

import { useEffect, useState } from "react";

/** Polls the product API (which reads Shopify/CJ) so the counter follows the latest known inventory. */
export function useLiveStock(slug: string, initial: number, enabled = true, intervalMs = 45000) {
  const [stock, setStock] = useState(initial);
  useEffect(() => setStock(initial), [initial]);

  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    const tick = async () => {
      if (document.hidden) return;
      try {
        const r = await fetch(`/api/products/${slug}`, { cache: "no-store" });
        if (!r.ok) return;
        const d = await r.json();
        if (alive && typeof d.product?.stockCount === "number") setStock(d.product.stockCount);
      } catch { /* keep last value */ }
    };
    const id = setInterval(tick, intervalMs);
    return () => { alive = false; clearInterval(id); };
  }, [slug, enabled, intervalMs]);

  return stock;
}
