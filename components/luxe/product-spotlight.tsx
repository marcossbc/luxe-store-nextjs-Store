"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import type { Product } from "@/lib/types";
import { StageDetail, accentOf } from "./stage-detail";

/**
 * Full-screen product takeover for the product sections: the background morphs to the colour of the
 * product on show, and the visitor can flip through the section's other products without closing it.
 */
export function ProductSpotlight({ items, activeId, onChange }: { items: Product[]; activeId: string | null; onChange: (id: string | null) => void }) {
  const [mounted, setMounted] = useState(false);
  const [dir, setDir] = useState(1);
  // handlers read the latest values through refs, so the key listener never goes stale between products
  const goRef = useRef<(d: number) => void>(() => {});
  const closeRef = useRef<() => void>(() => {});

  useEffect(() => setMounted(true), []);

  const idx = items.findIndex((p) => p.id === activeId);
  const active = idx >= 0 ? items[idx] : null;

  const go = useCallback((d: number) => {
    if (!items.length || idx < 0) return;
    setDir(d);
    onChange(items[(idx + d + items.length) % items.length].id);
  }, [items, idx, onChange]);

  goRef.current = go;
  closeRef.current = () => onChange(null);

  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
      if (e.key === "ArrowRight") goRef.current(1);
      if (e.key === "ArrowLeft") goRef.current(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
    // re-run only when the overlay opens/closes (the listener reads fresh values via refs)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active === null]);

  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {active && (
        <motion.div
          key="spotlight"
          role="dialog"
          aria-modal="true"
          aria-label={active.name}
          className="fixed inset-0 z-[80] overflow-y-auto text-white md:overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, backgroundColor: accentOf(active) }}
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{ backgroundColor: accentOf(active) }}
        >
          <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(255,255,255,0.08),transparent_60%)]" />
          <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/55" />
          <div className="relative min-h-full md:h-full">
            <StageDetail items={items} active={active} idx={idx} dir={dir} onGo={go} onBack={() => onChange(null)} onSelect={(id, d) => { setDir(d); onChange(id); }} backLabel="Back" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
