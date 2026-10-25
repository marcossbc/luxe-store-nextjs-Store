"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { useProducts } from "@/lib/hooks/use-products";
import { usePremiumPrice } from "@/lib/luxe/use-premium-price";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600", "700"] });
const AMBER = "#e08a2f";

// Editorial copy per slide; images come from the live catalogue (Shopify / CJ / demo).
const COPY = [
  { eyebrow: "Creative Vision.", lines: ["The Art", "of Luxury"] },
  { eyebrow: "Crafted Slowly.", lines: ["Made to", "Last"] },
  { eyebrow: "Considered Detail.", lines: ["A Walk in", "Elegance"] },
  { eyebrow: "Limited Allocation.", lines: ["Rare by", "Design"] },
];
const AUTOPLAY_MS = 6500;

export function CinematicHero({ targetId }: { targetId?: string }) {
  const { products, loading } = useProducts();
  const reduce = useReducedMotion();
  const fmt = usePremiumPrice();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const slides = products.filter((p) => p.images[0]).slice(0, COPY.length);
  const n = slides.length;

  useEffect(() => {
    if (reduce || paused || n < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % n), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [reduce, paused, n]);

  if (loading || n === 0) {
    return <div className="shimmer min-h-[calc(100svh-var(--nav-h))] bg-[#0b0908] " aria-busy />;
  }

  const p = slides[index];
  const copy = COPY[index];

  return (
    <section
      className="relative min-h-[calc(100svh-var(--nav-h))] overflow-hidden bg-[#0b0908] text-white "
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Cinematic introduction"
    >
      {/* full-bleed image: cross-fades through a blur, with a slow push-in */}
      <AnimatePresence initial={false}>
        <motion.div
          key={p.id}
          className="absolute inset-0"
          initial={{ opacity: 0, filter: "blur(16px)" }}
          animate={{ opacity: 1, filter: "blur(0px)", transition: { duration: 1.2, ease: "easeOut" } }}
          exit={{ opacity: 0, filter: "blur(16px)", transition: { duration: 0.9 } }}
        >
          <motion.img
            src={p.images[0]}
            alt=""
            className="h-full w-full object-cover"
            initial={{ scale: 1.14 }}
            animate={{ scale: 1.02 }}
            transition={{ duration: reduce ? 0 : 9, ease: "linear" }}
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/65" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent" />

      {/* headline: settles in, then zooms through the viewer on exit */}
      <div className="absolute inset-0 flex items-center px-6 sm:px-10 lg:pl-[40%] lg:pr-10">
        <AnimatePresence mode="wait" initial={false}>
          <div key={p.id} className="w-full">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.6 } }}
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
              className="mb-3 text-sm font-semibold uppercase tracking-[0.3em]"
              style={{ color: AMBER }}
            >
              {copy.eyebrow}
            </motion.p>
            <motion.h1
              className={`${serif.className} origin-left text-[clamp(3.2rem,9.5vw,9rem)] font-semibold uppercase leading-[0.92] tracking-tight`}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.96, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] } }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 2.4, filter: "blur(14px)", transition: { duration: 0.8, ease: [0.4, 0, 1, 1] } }}
            >
              {copy.lines.map((l) => <span key={l} className="block">{l}</span>)}
            </motion.h1>
          </div>
        </AnimatePresence>
      </div>

      {/* caption + controls */}
      <div className="absolute inset-x-6 bottom-6 z-10 flex items-end justify-between sm:inset-x-10">
        <div className="max-w-xs">
          <div className="mb-3 flex gap-2">
            {slides.map((s, i) => (
              <button key={s.id} aria-label={`Slide ${i + 1}`} aria-current={i === index} onClick={() => setIndex(i)} className="py-2">
                <span className="block h-0.5 w-10 overflow-hidden rounded bg-white/25">
                  {i === index && !reduce && !paused ? (
                    <motion.span key={`${index}-${paused}`} className="block h-full" style={{ backgroundColor: AMBER }} initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: AUTOPLAY_MS / 1000, ease: "linear" }} />
                  ) : (
                    <span className="block h-full" style={{ width: i === index ? "100%" : 0, backgroundColor: AMBER }} />
                  )}
                </span>
              </button>
            ))}
          </div>
          <Link href={`/shop/${p.slug}`} className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/80 hover:text-white">
            {p.name} · {fmt(p.price)}
            <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <motion.button
          whileTap={{ scale: 0.94 }}
          whileHover={{ scale: 1.06 }}
          aria-label="Scroll to collection"
          onClick={() => targetId && document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" })}
          className="flex h-14 w-14 items-center justify-center rounded-full text-black shadow-lg"
          style={{ backgroundColor: AMBER }}
        >
          <ArrowDown size={20} />
        </motion.button>
      </div>
    </section>
  );
}
