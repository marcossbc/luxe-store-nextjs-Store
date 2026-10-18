"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import { useWishlistContext } from "@/components/layout/wishlist-provider";
import { useCartContext } from "@/components/layout/cart-provider";
import { useToast } from "@/components/layout/toast-provider";
import { useProducts } from "@/lib/hooks/use-products";
import { usePremiumPrice } from "@/lib/luxe/use-premium-price";

export function StyleVault() {
  const { products, loading } = useProducts();
  const { wishlist, toggleWishlist } = useWishlistContext();
  const { addItem } = useCartContext();
  const { toast } = useToast();
  const fmt = usePremiumPrice();
  const saved = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-white backdrop-blur-xl">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-semibold">Style Vault <span className="text-sm font-normal text-white/40">· {saved.length} saved</span></h3>
        <Link href="/collection" className="text-xs uppercase tracking-widest text-white/60 hover:text-white">Browse collection →</Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="shimmer aspect-[4/5] rounded-2xl" />)}</div>
      ) : saved.length === 0 ? (
        <p className="py-10 text-center text-sm text-white/40">Your vault is empty. Tap the heart on any piece to save it here.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <AnimatePresence>
            {saved.map((p) => {
              const needsOptions = Boolean(p.variants?.length);
              return (
                <motion.div key={p.id} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} whileHover={{ y: -4 }} className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-black">
                  <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <button aria-label="Remove from vault" onClick={() => toggleWishlist(p.id)} className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 backdrop-blur"><Heart size={15} className="fill-rose-500 text-rose-500" /></button>
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/30 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
                    <div className="truncate text-sm font-medium">{p.name}</div>
                    <div className="mb-2 text-xs text-white/60">{fmt(p.price)}</div>
                    {needsOptions ? (
                      <Link href={`/shop/${p.slug}`} className="flex h-9 items-center justify-center rounded-lg bg-white text-xs font-semibold uppercase tracking-wider text-black">Choose options</Link>
                    ) : (
                      <motion.button whileTap={{ scale: 0.96 }} disabled={!p.inStock} onClick={() => { addItem(p, 1); toast(`${p.name} added to your bag`); }} className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-white text-xs font-semibold uppercase tracking-wider text-black disabled:opacity-50">
                        <ShoppingBag size={13} /> Add to bag
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
