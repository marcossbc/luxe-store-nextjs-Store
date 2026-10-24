"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/product/star-rating";
import { useCartContext } from "@/components/layout/cart-provider";
import { useWishlistContext } from "@/components/layout/wishlist-provider";
import { useToast } from "@/components/layout/toast-provider";
import { usePremiumPrice } from "@/lib/luxe/use-premium-price";
import { calculateDiscount, cn } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { ProductSpotlight } from "./product-spotlight";

// products drop in from above through a blur, staggered
const itemV: Variants = {
  hidden: (i: number) => ({ y: -90, opacity: 0, filter: "blur(10px)", transition: { duration: 0.2, delay: i * 0.02 } }),
  show: (i: number) => ({ y: 0, opacity: 1, filter: "blur(0px)", transition: { type: "spring", stiffness: 110, damping: 16, delay: 0.1 + i * 0.08 } }),
};

const badgeColors = { bestseller: "blue", new: "emerald", sale: "rose", limited: "amber", trending: "slate" } as const;

/**
 * Product grid in the "stage" style: pieces drop in, float, tilt on hover, and open a full-screen takeover.
 * Keeps everything the old ProductCard did: badges, discount, rating, wishlist heart and add-to-cart.
 */
export function FloatingProducts({ items, className }: { items: Product[]; className?: string }) {
  const reduce = useReducedMotion();
  const [seen, setSeen] = useState(false);
  const [activeId, setActiveIdState] = useState<string | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  // remember what opened the overlay (captured from the click itself, before the overlay moves focus) and restore it on close
  const setActiveId = (id: string | null) => {
    setActiveIdState(id);
    if (id === null) requestAnimationFrame(() => opener.current?.focus?.());
  };

  return (
    <>
      <motion.div
        onViewportEnter={() => setSeen(true)}
        viewport={{ once: true, amount: 0.15 }}
        initial="hidden"
        animate={seen ? "show" : "hidden"}
        className={cn("grid grid-cols-2 justify-items-center gap-x-5 gap-y-12 lg:grid-cols-4", className)}
      >
        {items.map((p, i) => (
          <FloatingItem key={p.id} product={p} index={i} paused={activeId !== null || !!reduce} onOpen={(el) => { opener.current = el; setActiveId(p.id); }} />
        ))}
      </motion.div>
      <ProductSpotlight items={items} activeId={activeId} onChange={setActiveId} />
    </>
  );
}

function FloatingItem({ product: p, index: i, paused, onOpen }: { product: Product; index: number; paused: boolean; onOpen: (el: HTMLElement) => void }) {
  const fmt = usePremiumPrice();
  const { addItem } = useCartContext();
  const { isWishlisted, toggleWishlist } = useWishlistContext();
  const { toast } = useToast();
  const wished = isWishlisted(p.id);
  const discount = calculateDiscount(p.originalPrice, p.price);
  const hasVariants = Boolean(p.variants?.length);

  return (
    <motion.div custom={i} variants={itemV} className="group relative flex w-full max-w-[250px] flex-col items-center text-center">
      <motion.div
        animate={paused ? { y: 0 } : { y: [0, -8, 0] }}
        transition={{ duration: 4 + (i % 4) * 0.7, repeat: Infinity, ease: "easeInOut", delay: (i % 5) * 0.35 }}
        className="relative w-full"
      >
        <motion.div whileHover={{ scale: 1.05, rotate: i % 2 ? 1.5 : -1.5 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-muted shadow-2xl shadow-black/40 ring-1 ring-foreground/10">
          <button type="button" onClick={(e) => onOpen(e.currentTarget)} aria-label={`Explore ${p.name}`} className="absolute inset-0 z-0">
            <img src={p.images[0]} alt="" draggable={false} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
          </button>

          <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
            {p.badge && <Badge variant={badgeColors[p.badge]}>{p.badge.charAt(0).toUpperCase() + p.badge.slice(1)}</Badge>}
            {discount > 0 && <Badge variant="rose">-{discount}%</Badge>}
          </div>

          <button type="button" aria-label={wished ? "Remove from wishlist" : "Add to wishlist"} aria-pressed={wished}
            onClick={() => { toggleWishlist(p.id); toast(wished ? "Removed from wishlist" : "Added to wishlist", "info"); }}
            className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background/85 text-foreground opacity-0 shadow transition-all duration-300 hover:scale-110 focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
            <Heart size={16} className={wished ? "fill-rose-500 text-rose-500" : ""} />
          </button>

          <div className="absolute inset-x-0 bottom-0 z-10 translate-y-full p-3 transition-transform duration-300 focus-within:translate-y-0 group-hover:translate-y-0 [@media(hover:none)]:translate-y-0">
            {hasVariants ? (
              <Link href={`/shop/${p.slug}`} className="flex h-10 w-full items-center justify-center rounded-lg bg-white text-xs font-semibold uppercase tracking-wider text-black hover:bg-white/90">Choose options</Link>
            ) : (
              <motion.button type="button" whileTap={{ scale: 0.96 }} disabled={!p.inStock} onClick={() => { addItem(p); toast(`${p.name} added to cart`); }}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-white text-xs font-semibold uppercase tracking-wider text-black hover:bg-white/90 disabled:opacity-60">
                <ShoppingBag size={14} /> {p.inStock ? "Add to bag" : "Sold out"}
              </motion.button>
            )}
          </div>
        </motion.div>
        <div className="mx-auto mt-3 h-3 w-24 rounded-[50%] bg-black/45 blur-md" aria-hidden />
      </motion.div>

      <button type="button" onClick={(e) => onOpen(e.currentTarget)} className="mt-3 w-full text-center">
        <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{p.categoryName}</div>
        <div className="mt-1 truncate font-semibold text-foreground">{p.name}</div>
        <div className="mt-1.5 flex items-center justify-center gap-2"><StarRating rating={p.rating} size={13} /><span className="text-xs text-muted-foreground">({p.reviewCount})</span></div>
        <div className="mt-2 flex items-baseline justify-center gap-2">
          <span className="text-lg font-bold text-foreground">{fmt(p.price)}</span>
          {p.originalPrice > p.price && <span className="text-sm text-muted-foreground line-through">{fmt(p.originalPrice)}</span>}
        </div>
      </button>
    </motion.div>
  );
}
