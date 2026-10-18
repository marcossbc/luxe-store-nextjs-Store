"use client";

import { useEffect, useState, type RefObject } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

/**
 * Cursor ring scoped to a container. Elements with data-cursor="Label" grow the ring and show the label.
 * Disabled on touch devices and for reduced-motion users.
 */
export function LuxeCursor({ containerRef }: { containerRef: RefObject<HTMLElement | null> }) {
  const reduce = useReducedMotion();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });
  const [label, setLabel] = useState<string | null>(null);
  const [inside, setInside] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || reduce || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    setEnabled(true);
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = (e.target as HTMLElement).closest?.("[data-cursor]");
      setLabel(t ? t.getAttribute("data-cursor") : null);
    };
    const enter = () => setInside(true);
    const leave = () => { setInside(false); setLabel(null); };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
    };
  }, [containerRef, reduce, x, y]);

  if (!enabled) return null;
  const size = label ? 84 : 26;

  return (
    <motion.div aria-hidden className="pointer-events-none fixed left-0 top-0 z-[60]" style={{ x: sx, y: sy }}>
      <motion.div
        animate={{ width: size, height: size, opacity: inside ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className={`flex items-center justify-center rounded-full text-[10px] font-semibold uppercase tracking-widest ${
          label ? "bg-white text-black" : "border border-white/80 mix-blend-difference"
        }`}
        style={{ marginLeft: -size / 2, marginTop: -size / 2 }}
      >
        {label}
      </motion.div>
    </motion.div>
  );
}
