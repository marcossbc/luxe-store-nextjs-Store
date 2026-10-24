"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePremiumPrice } from "@/lib/luxe/use-premium-price";
import { useProducts } from "@/lib/hooks/use-products";
import type { Product } from "@/lib/types";
import { StageDetail, accentOf } from "./stage-detail";

const AMBER = "#e08a2f";
const BASE = "#0a0a0c";

// products drop in from above through a blur, staggered; on select the rest fly away upwards
const itemV: Variants = {
  hidden: (i: number) => ({ y: -90, opacity: 0, filter: "blur(10px)", transition: { duration: 0.35, delay: i * 0.03 } }),
  show: (i: number) => ({ y: 0, opacity: 1, filter: "blur(0px)", transition: { type: "spring", stiffness: 110, damping: 16, delay: 0.1 + i * 0.07 } }),
};

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

      {/* DETAIL (shared with the product sections' spotlight) */}
      <AnimatePresence>
        {active && (
          <motion.div key="detail" className="absolute inset-0 z-20 overflow-y-auto md:overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.3, duration: 0.45 } }} exit={{ opacity: 0, transition: { duration: 0.25 } }}>
            <StageDetail items={items} active={active} idx={idx} dir={dir} onGo={go} onBack={() => setActiveId(null)} onSelect={(id, d) => { setDir(d); setActiveId(id); }} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
