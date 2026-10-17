"use client";

import { useEffect, useState } from "react";
import type { Product } from "../types";

let cache: Product[] | null = null;
let inflight: Promise<Product[]> | null = null;

function load(): Promise<Product[]> {
  if (cache) return Promise.resolve(cache);
  inflight ??= fetch("/api/products")
    .then((r) => r.json())
    .then((d) => (cache = d.products as Product[]))
    .finally(() => (inflight = null));
  return inflight;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(cache || []);
  const [loading, setLoading] = useState(!cache);
  useEffect(() => {
    let live = true;
    load().then((p) => live && (setProducts(p), setLoading(false))).catch(() => live && setLoading(false));
    return () => { live = false; };
  }, []);
  return { products, loading };
}
