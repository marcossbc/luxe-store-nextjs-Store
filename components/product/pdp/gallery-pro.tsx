"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  images: string[];
  name: string;
  /** when set (e.g. a variant image) the gallery jumps to it */
  focusImage?: string;
}

export function GalleryPro({ images, name, focusImage }: Props) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [open, setOpen] = useState(false);
  const count = images.length;

  useEffect(() => {
    if (!focusImage) return;
    const i = images.indexOf(focusImage);
    if (i >= 0) setActive(i);
  }, [focusImage, images]);

  const go = useCallback((d: number) => setActive((p) => (p + d + count) % count), [count]);

  // lightbox: keyboard + scroll lock
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, go]);

  if (count === 0) return <div className="shimmer aspect-square rounded-3xl" />;

  return (
    <div className="space-y-4">
      <div
        className="group relative aspect-square rounded-3xl overflow-hidden border bg-muted cursor-zoom-in"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
        }}
        onMouseLeave={() => setZoom(null)}
        onClick={() => setOpen(true)}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            src={images[active]}
            alt={`${name} ${active + 1}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-200 ease-out"
            style={zoom ? { transform: "scale(2)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
            draggable={false}
          />
        </AnimatePresence>

        <button
          aria-label="Open fullscreen"
          className="absolute top-3 right-3 h-10 w-10 rounded-full glass glass-border border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        >
          <Expand size={16} />
        </button>

        {count > 1 && (
          <>
            <button aria-label="Previous image" className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full glass glass-border border flex items-center justify-center" onClick={(e) => { e.stopPropagation(); go(-1); }}>
              <ChevronLeft size={18} />
            </button>
            <button aria-label="Next image" className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full glass glass-border border flex items-center justify-center" onClick={(e) => { e.stopPropagation(); go(1); }}>
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full glass glass-border border text-xs">
              {active + 1} / {count}
            </div>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img + i}
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1}`}
              className={cn(
                "relative w-20 h-20 shrink-0 rounded-2xl overflow-hidden border-2 transition-all",
                active === i ? "border-primary scale-100" : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <button aria-label="Close" className="absolute top-5 right-5 h-11 w-11 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20" onClick={() => setOpen(false)}>
              <X size={20} />
            </button>
            {count > 1 && (
              <>
                <button aria-label="Previous" className="absolute left-4 h-12 w-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20" onClick={(e) => { e.stopPropagation(); go(-1); }}>
                  <ChevronLeft />
                </button>
                <button aria-label="Next" className="absolute right-4 h-12 w-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20" onClick={(e) => { e.stopPropagation(); go(1); }}>
                  <ChevronRight />
                </button>
              </>
            )}
            <motion.img
              key={active}
              src={images[active]}
              alt={name}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="max-h-[88vh] max-w-[92vw] rounded-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
