"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, ChevronLeft, ChevronRight, Heart, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { accentFor } from "@/lib/luxe/helpers";
import { usePremiumPrice } from "@/lib/luxe/use-premium-price";
import { useCartContext } from "@/components/layout/cart-provider";
import { useWishlistContext } from "@/components/layout/wishlist-provider";
import { useToast } from "@/components/layout/toast-provider";
import type { Product } from "@/lib/types";
import { EditionTag, LiveInventory } from "./edition-tags";
import { CraftsmanshipButton } from "./video-lightbox";

/** Background colour a product "owns" while it is on show (morphs when the product changes). */
export const accentOf = (p: Product) => accentFor(p.category + p.id.length);

export function specTiles(p: Product, fmt: (n: number) => string): [string, string][] {
  const tiles: [string, string][] = Object.entries(p.specifications).slice(0, 4).map(([k, v]) => [String(v), k]);
  const fallback: [string, string][] = [[fmt(p.price), "Price"], [`${p.rating.toFixed(1)} / 5`, "Rating"], [p.categoryName, "Category"], [p.sku, "Reference"]];
  for (const f of fallback) if (tiles.length < 4 && !tiles.some((t) => t[1] === f[1])) tiles.push(f);
  return tiles;
}

interface Props {
  items: Product[];
  active: Product;
  idx: number;
  dir: number;
  onSelect: (id: string, dir: number) => void;
  onGo: (d: number) => void;
  onBack: () => void;
  backLabel?: string;
}

/**
 * The product "takeover" view (title, spec tiles, actions, big product, price card, thumbnail strip).
 * Shared by the home ProductStage (in-section) and the ProductSpotlight overlay used by the product sections.
 * The parent supplies the coloured, positioned container.
 */
export function StageDetail({ items, active, idx, dir, onSelect, onGo, onBack, backLabel = "All pieces" }: Props) {
  const reduce = useReducedMotion();
  const fmt = usePremiumPrice();
  const { addItem } = useCartContext();
  const { isWishlisted, toggleWishlist } = useWishlistContext();
  const { toast } = useToast();
  const wished = isWishlisted(active.id);
  const hasVariants = Boolean(active.variants?.length);

  return (
    <>
      <div className="mx-auto flex min-h-full max-w-7xl flex-col px-6 pb-28 pt-6 md:grid md:grid-cols-[1.05fr_1fr] md:px-10 md:pb-24">
        <button onClick={onBack} autoFocus className="mb-6 flex w-fit items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-white/70 hover:text-white md:col-span-2">
          <ArrowLeft size={14} /> {backLabel}
        </button>

        <div className="order-2 flex flex-col justify-center md:order-1">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div key={active.id} initial={{ opacity: 0, x: 40 * dir }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 * dir }} transition={{ type: "spring", stiffness: 200, damping: 25 }}>
              <div className="mb-4"><EditionTag product={active} /></div>
              <h2 className="display-title mb-4 line-clamp-3 !text-[clamp(2.5rem,6vw,5rem)]">{active.name}</h2>
              <p className="mb-6 line-clamp-3 max-w-md text-sm leading-relaxed text-white/75">{active.shortDescription || active.description}</p>
              <div className="mb-7 grid max-w-md grid-cols-2 gap-2 sm:grid-cols-4">
                {specTiles(active, fmt).map(([v, l], i) => (
                  <div key={l} className={cn("rounded-lg border px-3 py-2.5", i === 0 ? "border-transparent bg-white text-black" : "border-white/20 bg-black/20")}>
                    <div className="truncate text-sm font-semibold">{v}</div>
                    <div className={cn("text-[10px] uppercase tracking-widest", i === 0 ? "text-black/55" : "text-white/50")}>{l}</div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                {hasVariants ? (
                  <motion.div whileTap={{ scale: 0.96 }}>
                    <Link href={`/shop/${active.slug}`} className="inline-flex h-12 items-center gap-2 bg-white px-6 text-sm font-semibold uppercase tracking-widest text-black transition-colors hover:bg-white/90">Choose options</Link>
                  </motion.div>
                ) : (
                  <motion.button whileTap={{ scale: 0.96 }} disabled={!active.inStock} onClick={() => { addItem(active); toast(`${active.name} added to cart`); }}
                    className="inline-flex h-12 items-center gap-2 bg-white px-6 text-sm font-semibold uppercase tracking-widest text-black transition-colors hover:bg-white/90 disabled:opacity-50">
                    <ShoppingBag size={16} /> {active.inStock ? "Add to bag" : "Sold out"}
                  </motion.button>
                )}
                <motion.div whileTap={{ scale: 0.96 }}>
                  <Link href={`/shop/${active.slug}`} className="inline-flex h-12 items-center gap-2 border border-white px-6 text-sm font-semibold uppercase tracking-widest transition-colors hover:bg-white hover:text-black">
                    Buy now <ArrowUpRight size={16} />
                  </Link>
                </motion.div>
                <motion.button whileTap={{ scale: 0.9 }} aria-label={wished ? "Remove from wishlist" : "Add to wishlist"} aria-pressed={wished}
                  onClick={() => { toggleWishlist(active.id); toast(wished ? "Removed from wishlist" : "Added to wishlist", "info"); }}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-white/50 transition-colors hover:bg-white hover:text-black">
                  <Heart size={18} className={wished ? "fill-rose-500 text-rose-500" : ""} />
                </motion.button>
                <CraftsmanshipButton title={active.name} product={active} />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative order-1 mb-8 flex items-center justify-center md:order-2 md:mb-0">
          <AnimatePresence mode="popLayout" custom={dir}>
            <motion.div
              key={active.id}
              initial={reduce ? { opacity: 0 } : { y: -140, opacity: 0, filter: "blur(14px)", scale: 1.05 }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)", scale: 1, transition: { type: "spring", stiffness: 90, damping: 14, delay: 0.1 } }}
              exit={{ y: 80, opacity: 0, filter: "blur(10px)", transition: { duration: 0.3 } }}
              className="relative"
            >
              <motion.img
                src={active.images[0]}
                alt={active.name}
                draggable={false}
                animate={reduce ? undefined : { y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="h-[300px] w-[240px] rounded-3xl object-cover shadow-2xl shadow-black/60 sm:h-[400px] sm:w-[320px] md:h-[min(56vh,480px)] md:w-[min(26vw,380px)]"
              />
              <div className="mx-auto -mt-1 h-4 w-3/4 rounded-[50%] bg-black/50 blur-lg" aria-hidden />
            </motion.div>
          </AnimatePresence>

          <div className="absolute bottom-0 right-0 hidden w-48 bg-white p-4 text-black md:block">
            <div className="font-display text-3xl font-bold tracking-wide">{fmt(active.price)}</div>
            <LiveInventory product={active} className="mt-1 !text-[9px] text-black/70" />
          </div>
        </div>
      </div>

      {/* thumbnails: switch product while the background morphs */}
      <div className="absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/50 to-transparent px-6 pb-5 pt-10 md:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto py-2">
            {items.map((p, i) => (
              <motion.button key={p.id} whileTap={{ scale: 0.94 }} aria-label={p.name} aria-current={p.id === active.id} onClick={() => onSelect(p.id, i >= idx ? 1 : -1)}
                className={cn("h-12 w-12 shrink-0 overflow-hidden rounded-lg ring-2 transition-all", p.id === active.id ? "scale-110 ring-white" : "opacity-60 ring-transparent hover:opacity-100")}>
                <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
              </motion.button>
            ))}
          </div>
          <div className="flex gap-2">
            {[{ d: -1, I: ChevronLeft, l: "Previous" }, { d: 1, I: ChevronRight, l: "Next" }].map(({ d, I, l }) => (
              <motion.button key={l} whileTap={{ scale: 0.92 }} aria-label={l} onClick={() => onGo(d)} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 hover:bg-white hover:text-black"><I size={18} /></motion.button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
