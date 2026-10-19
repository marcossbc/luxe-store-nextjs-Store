"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowLeft, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { accentFor } from "@/lib/luxe/helpers";
import { usePremiumPrice } from "@/lib/luxe/use-premium-price";
import { useProducts } from "@/lib/hooks/use-products";
import type { Product } from "@/lib/types";
import { EditionTag, LiveInventory } from "./edition-tags";
import { CraftsmanshipButton } from "./video-lightbox";

const AMBER = "#e08a2f";
const BASE = "#0a0a0c";
const accentOf = (p: Product) => accentFor(p.category + p.id.length);

// products drop in from above through a blur, staggered; on select the rest fly away upwards
const itemV: Variants = {
  hidden: (i: number) => ({ y: -90, opacity: 0, filter: "blur(10px)", transition: { duration: 0.35, delay: i * 0.03 } }),
  show: (i: number) => ({ y: 0, opacity: 1, filter: "blur(0px)", transition: { type: "spring", stiffness: 110, damping: 16, delay: 0.1 + i * 0.07 } }),
};

function specTiles(p: Product, fmt: (n: number) => string): [string, string][] {
  const tiles: [string, string][] = Object.entries(p.specifications).slice(0, 4).map(([k, v]) => [String(v), k]);
  const fallback: [string, string][] = [[fmt(p.price), "Price"], [`${p.rating.toFixed(1)} / 5`, "Rating"], [p.categoryName, "Category"], [p.sku, "Reference"]];
  for (const f of fallback) if (tiles.length < 4 && !tiles.some((t) => t[1] === f[1])) tiles.push(f);
  return tiles;
}

export function ProductStage({ limit = 8 }: { limit?: number }) {
  const { products, loading } = useProducts();
  const reduce = useReducedMotion();
  const fmt = usePremiumPrice();
  const items = products.filter((p) => p.images[0]).slice(0, limit);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dir, setDir] = useState(1);
  // set when the grid first scrolls into view (works even though the grid mounts after the products load)
  const [seen, setSeen] = useState(false);

  const idx = items.findIndex((p) => p.id === activeId);
  const active = idx >= 0 ? items[idx] : null;

  const go = useCallback((d: number) => {
    if (!items.length || idx < 0) return;
    setDir(d);
    setActiveId(items[(idx + d + items.length) % items.length].id);
  }, [items, idx]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveId(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, go]);

  if (loading || items.length === 0) {
    return <div className="shimmer min-h-[760px]" aria-busy />;
  }

  const bg = active ? accentOf(active) : BASE;

  return (
    <section className="relative min-h-[820px] overflow-hidden text-white md:min-h-[min(100svh,860px)]" aria-label="Product stage">
      {/* background morphs to the colour of the product on show */}
      <motion.div className="absolute inset-0" initial={false} animate={{ backgroundColor: bg }} transition={{ duration: 0.8, ease: "easeInOut" }} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(255,255,255,0.07),transparent_60%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/50" />

      {/* GRID */}
      <motion.div
        initial={false}
        animate={{ opacity: active ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        className={cn("relative z-10 mx-auto flex h-full min-h-[820px] max-w-7xl flex-col px-6 py-14 md:min-h-[min(100svh,860px)] md:px-10", active && "pointer-events-none")}
        aria-hidden={!!active}
      >
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em]" style={{ color: AMBER }}>Selected pieces.</p>
            <h2>Pick your piece</h2>
          </div>
          <p className="hidden text-xs uppercase tracking-[0.2em] text-white/50 sm:block">Tap a piece to explore</p>
        </div>

        <motion.div onViewportEnter={() => setSeen(true)} viewport={{ once: true, amount: 0.2 }} initial="hidden" animate={active || !seen ? "hidden" : "show"} className="grid flex-1 grid-cols-2 content-center gap-x-6 gap-y-10 md:grid-cols-4">
          {items.map((p, i) => (
            <motion.button key={p.id} custom={i} variants={itemV} onClick={() => { setDir(1); setActiveId(p.id); }} className="group flex flex-col items-center text-center" aria-label={`Explore ${p.name}`}>
              <motion.div
                animate={reduce || active ? { y: 0 } : { y: [0, -9, 0] }}
                transition={{ duration: 4 + (i % 4) * 0.7, repeat: Infinity, ease: "easeInOut", delay: (i % 5) * 0.35 }}
                className="relative"
              >
                <motion.div whileHover={{ scale: 1.07, rotate: i % 2 ? 2 : -2 }} transition={{ type: "spring", stiffness: 260, damping: 18 }} className="h-44 w-32 overflow-hidden rounded-2xl shadow-2xl shadow-black/50 ring-1 ring-white/10 md:h-56 md:w-40">
                  <img src={p.images[0]} alt="" draggable={false} className="h-full w-full object-cover" />
                </motion.div>
                <div className="mx-auto mt-3 h-3 w-24 rounded-[50%] bg-black/50 blur-md" aria-hidden />
              </motion.div>
              <div className="mt-3 text-sm font-medium">{p.name}</div>
              <div className="text-xs text-white/55">{fmt(p.price)}</div>
            </motion.button>
          ))}
        </motion.div>
      </motion.div>

      {/* DETAIL */}
      <AnimatePresence>
        {active && (
          <motion.div key="detail" className="absolute inset-0 z-20 overflow-y-auto md:overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.3, duration: 0.45 } }} exit={{ opacity: 0, transition: { duration: 0.25 } }}>
            <div className="mx-auto flex min-h-full max-w-7xl flex-col px-6 pb-28 pt-6 md:grid md:grid-cols-[1.05fr_1fr] md:px-10 md:pb-24">
              <button onClick={() => setActiveId(null)} className="mb-6 flex w-fit items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-white/70 hover:text-white md:col-span-2">
                <ArrowLeft size={14} /> All pieces
              </button>

              <div className="order-2 flex flex-col justify-center md:order-1">
                <AnimatePresence mode="wait" custom={dir}>
                  <motion.div key={active.id} initial={{ opacity: 0, x: 40 * dir }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 * dir }} transition={{ type: "spring", stiffness: 200, damping: 25 }}>
                    <div className="mb-4"><EditionTag product={active} /></div>
                    <h2 className="mb-4 line-clamp-3 !text-[clamp(2.5rem,6vw,5rem)]">{active.name}</h2>
                    <p className="mb-6 line-clamp-3 max-w-md text-sm leading-relaxed text-white/75">{active.shortDescription || active.description}</p>
                    <div className="mb-7 grid max-w-md grid-cols-2 gap-2 sm:grid-cols-4">
                      {specTiles(active, fmt).map(([v, l], i) => (
                        <div key={l} className={cn("rounded-lg border px-3 py-2.5", i === 0 ? "border-transparent bg-white text-black" : "border-white/20 bg-black/20")}>
                          <div className="truncate text-sm font-semibold">{v}</div>
                          <div className={cn("text-[10px] uppercase tracking-widest", i === 0 ? "text-black/55" : "text-white/50")}>{l}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-6">
                      <motion.div whileTap={{ scale: 0.96 }}>
                        <Link href={`/shop/${active.slug}`} className="inline-flex h-12 items-center gap-2 border border-white px-6 text-sm font-semibold uppercase tracking-widest transition-colors hover:bg-white hover:text-black">
                          Buy now <ArrowUpRight size={16} />
                        </Link>
                      </motion.div>
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
                    <motion.button key={p.id} whileTap={{ scale: 0.94 }} aria-label={p.name} aria-current={p.id === active.id} onClick={() => { setDir(i >= idx ? 1 : -1); setActiveId(p.id); }}
                      className={cn("h-12 w-12 shrink-0 overflow-hidden rounded-lg ring-2 transition-all", p.id === active.id ? "scale-110 ring-white" : "opacity-60 ring-transparent hover:opacity-100")}>
                      <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                    </motion.button>
                  ))}
                </div>
                <div className="flex gap-2">
                  {[{ d: -1, I: ChevronLeft, l: "Previous" }, { d: 1, I: ChevronRight, l: "Next" }].map(({ d, I, l }) => (
                    <motion.button key={l} whileTap={{ scale: 0.92 }} aria-label={l} onClick={() => go(d)} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 hover:bg-white hover:text-black"><I size={18} /></motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
