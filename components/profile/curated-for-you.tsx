"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useWishlistContext } from "@/components/layout/wishlist-provider";
import { useProducts } from "@/lib/hooks/use-products";
import { readRecent } from "@/lib/hooks/use-recently-viewed";
import { usePremiumPrice } from "@/lib/luxe/use-premium-price";
import type { Product } from "@/lib/types";

/** Picks pieces from the live catalogue using saved items, recently viewed products and colour preferences. */
export function CuratedForYou() {
  const { products } = useProducts();
  const { wishlist } = useWishlistContext();
  const fmt = usePremiumPrice();
  const [recent, setRecent] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);

  useEffect(() => {
    setRecent(readRecent());
    try { setColors((JSON.parse(localStorage.getItem("luxe-style-prefs") || "{}").colors as string[]) || []); } catch { /* none */ }
  }, []);

  const bySlug = (s: string) => products.find((p) => p.slug === s);
  const affinity = new Map<string, number>();
  wishlist.forEach((id) => { const p = products.find((x) => x.id === id); if (p) affinity.set(p.category, (affinity.get(p.category) || 0) + 3); });
  recent.forEach((s) => { const p = bySlug(s); if (p) affinity.set(p.category, (affinity.get(p.category) || 0) + 2); });

  const scored = products
    .filter((p) => !wishlist.includes(p.id) && p.inStock)
    .map((p): { p: Product; score: number; reason: string } => {
      let score = (affinity.get(p.category) || 0) + p.rating / 10;
      let reason = "Top rated";
      if (affinity.get(p.category)) reason = `Because you like ${p.categoryName}`;
      const hit = colors.find((c) => p.variants?.some((v) => v.color?.toLowerCase().includes(c.toLowerCase())) || p.name.toLowerCase().includes(c.toLowerCase()));
      if (hit) { score += 2; reason = `Matches your love of ${hit}`; }
      return { p, score, reason };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  if (scored.length === 0) return null;
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-white backdrop-blur-xl">
      <h3 className="mb-5 flex items-center gap-2 font-semibold"><Sparkles size={16} className="text-fuchsia-300" /> Curated for you</h3>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {scored.map(({ p, reason }) => (
          <Link key={p.id} href={`/shop/${p.slug}`} className="group">
            <div className="aspect-square overflow-hidden rounded-2xl bg-black"><img src={p.images[0]} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /></div>
            <div className="mt-2 truncate text-sm font-medium">{p.name}</div>
            <div className="text-xs text-white/50">{fmt(p.price)}</div>
            <div className="mt-1 text-[11px] text-fuchsia-300/80">{reason}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
