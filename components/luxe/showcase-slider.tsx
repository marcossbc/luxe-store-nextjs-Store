"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform, type Variants } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { accentFor } from "@/lib/luxe/helpers";
import { usePremiumPrice } from "@/lib/luxe/use-premium-price";
import { useProducts } from "@/lib/hooks/use-products";
import type { Product } from "@/lib/types";
import { LuxeCursor } from "./custom-cursor";
import { CraftsmanshipButton } from "./video-lightbox";
import { EditionTag, LiveInventory } from "./edition-tags";

const SPRING = { type: "spring", stiffness: 200, damping: 25 } as const;

const imageVariants: Variants = {
  enter: (d: number) => ({ x: d >= 0 ? 160 : -160, opacity: 0, scale: 0.94 }),
  center: { x: 0, opacity: 1, scale: 1, transition: SPRING },
  exit: (d: number) => ({ x: d >= 0 ? -160 : 160, opacity: 0, scale: 0.94, transition: { duration: 0.25 } }),
};

export function ShowcaseSlider({ products }: { products: Product[] }) {
  const [[index, dir], setPage] = useState<[number, number]>([0, 0]);
  const root = useRef<HTMLElement>(null);
  const n = products.length;
  const fmt = usePremiumPrice();

  const go = useCallback((d: number) => setPage(([i]) => [(i + d + n) % n, d]), [n]);
  const jump = (i: number) => setPage(([cur]) => [i, i >= cur ? 1 : -1]);

  // depth parallax on the product image
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(useTransform(mx, [-0.5, 0.5], [-16, 16]), { stiffness: 120, damping: 20 });
  const py = useSpring(useTransform(my, [-0.5, 0.5], [-10, 10]), { stiffness: 120, damping: 20 });

  const p = products[index];
  const accent = accentFor(p.category + p.id.length);

  return (
    <section
      ref={root}
      tabIndex={0}
      aria-roledescription="carousel"
      aria-label="Featured collection"
      onKeyDown={(e) => { if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      className="relative flex min-h-[calc(100svh-var(--nav-h))] flex-col overflow-hidden bg-[#0a0a0c] text-white outline-none  lg:flex-row"
    >
      <LuxeCursor containerRef={root} />

      {/* accent panel: wipes in from the right on every change */}
      <AnimatePresence initial={false}>
        <motion.div
          key={index}
          initial={{ x: "100%" }}
          animate={{ x: 0, backgroundColor: accent }}
          exit={{ opacity: 0 }}
          transition={SPRING}
          className="absolute inset-x-0 bottom-0 h-[55%] lg:inset-y-0 lg:left-auto lg:right-0 lg:h-full lg:w-[38%]"
          style={{ backgroundColor: accent }}
          aria-hidden
        />
      </AnimatePresence>

      {/* product */}
      <motion.div
        className="relative z-10 flex min-h-[340px] flex-1 items-center justify-center p-6 lg:p-12"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={(_, info) => { if (info.offset.x < -80) go(1); else if (info.offset.x > 80) go(-1); }}
        data-cursor="Drag"
      >
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div key={p.id} custom={dir} variants={imageVariants} initial="enter" animate="center" exit="exit" className="relative w-full max-w-xl">
            <motion.div style={{ x: px, y: py, scale: 1.04 }} className="relative aspect-square overflow-hidden rounded-[2rem]">
              <img src={p.images[0]} alt={p.name} draggable={false} className="h-full w-full select-none object-cover" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#0a0a0c_105%)]" />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* copy */}
      <div className="relative z-10 flex flex-col justify-center px-6 pb-24 pt-4 lg:w-[48%] lg:px-14 lg:pb-12 lg:pt-12">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={p.id} initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} aria-live="polite">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <EditionTag product={p} />
              <LiveInventory product={p} />
            </div>
            <h2 className="display-title line-clamp-3 text-5xl sm:text-6xl xl:text-7xl">{p.name}</h2>
            <div className="mt-3 flex items-baseline gap-4 font-display text-2xl font-bold uppercase tracking-wide text-white/90">
              {fmt(p.price)}
              {p.originalPrice > p.price && <span className="text-lg text-white/50 line-through">{fmt(p.originalPrice)}</span>}
            </div>
            <p className="mt-5 line-clamp-2 max-w-md text-sm leading-relaxed text-white/70">{p.shortDescription || p.description}</p>

            <div className="mt-8 flex flex-wrap items-center gap-6">
              <motion.div whileTap={{ scale: 0.96 }}>
                <Link href={`/shop/${p.slug}`} data-cursor="View" className="inline-flex h-12 items-center gap-2 border border-white bg-white px-6 text-sm font-semibold uppercase tracking-widest text-black transition-colors hover:bg-transparent hover:text-white">
                  Discover <ArrowUpRight size={16} />
                </Link>
              </motion.div>
              <CraftsmanshipButton title={p.name} product={p} className="text-white" />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* controls */}
      <div className="absolute inset-x-6 bottom-5 z-20 flex items-center justify-between lg:inset-x-10">
        <div className="flex items-center gap-4">
          <span className="font-display text-sm font-bold tabular-nums tracking-widest">{String(index + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}</span>
          <div className="flex items-center gap-2">
            {products.map((x, i) => (
              <button key={x.id} aria-label={`Go to ${x.name}`} aria-current={i === index} onClick={() => jump(i)} className="py-3">
                <motion.span layout animate={{ width: i === index ? 28 : 8, opacity: i === index ? 1 : 0.4 }} transition={SPRING} className="block h-1.5 rounded-full bg-white" />
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          {[{ d: -1, I: ArrowLeft, l: "Previous" }, { d: 1, I: ArrowRight, l: "Next" }].map(({ d, I, l }) => (
            <motion.button key={l} whileTap={{ scale: 0.92 }} aria-label={l} onClick={() => go(d)} className={cn("flex h-11 w-11 items-center justify-center rounded-full border border-white/40 backdrop-blur hover:bg-white hover:text-black")}>
              <I size={18} />
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ShowcaseSection({ limit = 6 }: { limit?: number }) {
  const { products, loading } = useProducts();
  const picks = products.filter((p) => p.images[0]).slice(0, limit);
  if (loading || picks.length === 0) {
    return <div className="shimmer min-h-[calc(100svh-var(--nav-h))] bg-[#0a0a0c] " aria-busy />;
  }
  return <ShowcaseSlider products={picks} />;
}
