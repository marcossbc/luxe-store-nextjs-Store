"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Layers, Play, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getProductParts, type ProductPart } from "@/lib/luxe/product-parts";
import type { Product } from "@/lib/types";

const SPRING = { type: "spring", stiffness: 200, damping: 25 } as const;
const VIDEO = process.env.NEXT_PUBLIC_EXPLAINER_VIDEO_URL || "";

const RX = 130, RY = 46, T = 14;

function Disc({ i }: { i: number }) {
  const ticks = Array.from({ length: 60 }, (_, k) => (k / 60) * Math.PI * 2);
  return (
    <g>
      <path d={`M ${-RX} 0 V ${T} A ${RX} ${RY} 0 0 0 ${RX} ${T} V 0 Z`} fill="url(#lx-side)" />
      <ellipse rx={RX} ry={RY} fill="url(#lx-metal)" stroke="rgba(255,255,255,0.35)" strokeWidth={1} fillOpacity={i === 0 ? 0.55 : 0.95} />
      {i === 0 && <path d={`M ${-RX * 0.6} ${-RY * 0.35} Q 0 ${-RY * 0.9} ${RX * 0.6} ${-RY * 0.35}`} stroke="rgba(255,255,255,0.7)" strokeWidth={2} fill="none" />}
      {i === 1 && ticks.map((a, k) => (
        <line key={k} x1={Math.cos(a) * RX * 0.86} y1={Math.sin(a) * RY * 0.86} x2={Math.cos(a) * RX * (k % 5 === 0 ? 0.7 : 0.78)} y2={Math.sin(a) * RY * (k % 5 === 0 ? 0.7 : 0.78)} stroke="#111" strokeWidth={k % 5 === 0 ? 2 : 1} />
      ))}
      {i === 2 && (<><ellipse rx={RX * 0.72} ry={RY * 0.72} fill="none" stroke="#111" strokeWidth={9} strokeDasharray="7 5" opacity={0.7} /><ellipse rx={RX * 0.28} ry={RY * 0.28} fill="#0b0b0d" /></>)}
      {i === 3 && (<><ellipse rx={RX * 0.8} ry={RY * 0.8} fill="none" stroke="#111" strokeWidth={3} />{[0, 1, 2, 3, 4, 5].map((k) => { const a = (k / 6) * Math.PI * 2; return <line key={k} x1={0} y1={0} x2={Math.cos(a) * RX * 0.8} y2={Math.sin(a) * RY * 0.8} stroke="#111" strokeWidth={3} />; })}</>)}
      {i === 4 && <ellipse rx={RX * 0.55} ry={RY * 0.55} fill="#0b0b0d" opacity={0.6} />}
    </g>
  );
}

const BAND = 100 / 5;

/** The product's own photo is cut into five bands that pull apart; falls back to generic discs without a photo. */
function ExplodedView({ parts, image, name }: { parts: ProductPart[]; image?: string; name: string }) {
  const [spread, setSpread] = useState(0);
  const [view, setView] = useState<"layers" | "photo">("layers"); // "layers" = the original disc design
  useEffect(() => { const t = setTimeout(() => setSpread(0.65), 250); return () => clearTimeout(t); }, []);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 px-4">
      {image && (
        <div className="flex gap-1 rounded-full bg-white/10 p-1 text-xs text-white">
          {(["layers", "photo"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className={cn("rounded-full px-3 py-1.5 capitalize", view === v && "bg-white text-black")}>{v}</button>
          ))}
        </div>
      )}
      {image && view === "photo" ? (
        <div className="flex w-full flex-1 items-center justify-center py-[min(13vh,110px)]">
          <div className="relative aspect-square h-[min(38vh,380px)]">
            {parts.map((part, i) => {
              const offset = (i - 2) * spread * 12; // % of container height
              return (
                <div key={part.label}>
                  <motion.div
                    className="absolute inset-0"
                    style={{ clipPath: `inset(${i * BAND}% 0 ${100 - (i + 1) * BAND}% 0)` }}
                    animate={{ y: `${offset}%` }}
                    transition={SPRING}
                  >
                    <img src={image} alt={i === 0 ? name : ""} className="h-full w-full rounded-2xl object-cover" draggable={false} />
                  </motion.div>
                  {/* label sits in a band-sized box, so y% is relative to 20% of the container: multiply by 5 */}
                  <motion.div
                    className="pointer-events-none absolute inset-x-0 flex items-center"
                    style={{ top: `${i * BAND}%`, height: `${BAND}%` }}
                    animate={{ y: `${offset * 5}%`, opacity: spread > 0.25 ? 1 : 0 }}
                    transition={SPRING}
                  >
                    <div className="ml-2 rounded-lg bg-black/70 px-3 py-1.5 backdrop-blur">
                      <div className="text-xs font-semibold leading-tight text-white sm:text-sm">{part.label}</div>
                      <div className="hidden text-[10px] leading-tight text-white/60 sm:block">{part.detail}</div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <svg viewBox="-200 -230 640 460" className="max-h-[62vh] w-full max-w-3xl" role="img" aria-label="Exploded layer view">
          <defs>
            <linearGradient id="lx-metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#e5e7eb" /><stop offset=".5" stopColor="#6b7280" /><stop offset="1" stopColor="#d1d5db" /></linearGradient>
            <linearGradient id="lx-side" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#374151" /><stop offset=".5" stopColor="#9ca3af" /><stop offset="1" stopColor="#374151" /></linearGradient>
          </defs>
          <line x1="0" y1={-190} x2="0" y2={190} stroke="rgba(255,255,255,0.12)" strokeDasharray="4 6" />
          {parts.map((l, i) => (
            <motion.g key={l.label} initial={false} animate={{ translateY: (i - 2) * spread * 78 }} transition={SPRING}>
              <Disc i={i} />
              <motion.g animate={{ opacity: spread > 0.3 ? 1 : 0 }}>
                <line x1={RX + 8} y1={0} x2={RX + 44} y2={0} stroke="rgba(255,255,255,0.4)" />
                <text x={RX + 50} y={-2} fill="#fff" fontSize={13} fontWeight={600}>{l.label}</text>
                <text x={RX + 50} y={13} fill="rgba(255,255,255,0.5)" fontSize={10}>{l.detail}</text>
              </motion.g>
            </motion.g>
          ))}
        </svg>
      )}
      <label className="flex w-full max-w-sm items-center gap-4 text-xs uppercase tracking-widest text-white/60">
        Assemble
        <input type="range" min={0} max={1} step={0.01} value={spread} onChange={(e) => setSpread(parseFloat(e.target.value))} className="h-1 flex-1 cursor-pointer accent-white" aria-label="Explode amount" />
        Explode
      </label>
    </div>
  );
}

export function VideoLightbox({ open, onClose, title, videoSrc = VIDEO, product }: { open: boolean; onClose: () => void; title: string; videoSrc?: string; product?: Product }) {
  const parts = getProductParts(product ?? { name: title, category: "", categoryName: "", tags: [] });
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<"film" | "3d">(videoSrc ? "film" : "3d");
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);

  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label={title}>
          <motion.div className="flex h-full flex-col text-white" initial={{ scale: 0.9, opacity: 0, y: 24 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }} transition={SPRING}>
            <div className="relative flex items-center justify-between px-5 py-4">
              <div className="flex gap-1 rounded-full bg-white/10 p-1 text-xs">
                {videoSrc && <button onClick={() => setTab("film")} className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5", tab === "film" && "bg-white text-black")}><Play size={12} /> Film</button>}
                <button onClick={() => setTab("3d")} className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5", tab === "3d" && "bg-white text-black")}><Layers size={12} /> Exploded view</button>
              </div>
              <div className="display-title absolute left-1/2 -translate-x-1/2 text-xl tracking-[0.3em]">LUXE</div>
              <button autoFocus aria-label="Close" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"><X size={18} /></button>
            </div>
            <div className="min-h-0 flex-1">
              {tab === "film" && videoSrc ? (
                <video src={videoSrc} controls autoPlay playsInline className="h-full w-full object-contain" />
              ) : <ExplodedView parts={parts} image={product?.images[0]} name={title} />}
            </div>
            <div className="px-5 py-4 text-center text-xs uppercase tracking-[0.25em] text-white/40">{title}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export function CraftsmanshipButton({ title, className, label = "Discover Craftsmanship", product }: { title: string; className?: string; label?: string; product?: Product }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <motion.button whileTap={{ scale: 0.96 }} data-cursor="Play" onClick={() => setOpen(true)} className={cn("group inline-flex items-center gap-3 text-sm font-medium uppercase tracking-wider", className)}>
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-current transition-transform group-hover:scale-110"><Play size={14} className="ml-0.5 fill-current" /></span>
        {label}
      </motion.button>
      <VideoLightbox open={open} onClose={() => setOpen(false)} title={title} product={product} />
    </>
  );
}
