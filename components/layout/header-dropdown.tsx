"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

const OPEN_DELAY = 90;   // hover intent
const CLOSE_DELAY = 220; // grace period to travel from the trigger to the panel

interface Props {
  id: string;
  label: string;
  align?: "left" | "right";
  width?: number;
  triggerClassName?: string;
  trigger: (open: boolean) => ReactNode;
  children: (close: () => void) => ReactNode;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Small hover/click dropdown rendered in a portal (so the header's overflow clipping and backdrop-filter
 * can never trap it). Same interaction rules as the mega menu: hover intent, grace period, Esc, click toggle.
 */
export function HeaderDropdown({ id, label, align = "left", width = 280, triggerClassName, trigger, children, onOpenChange }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<{ top: number; left?: number; right?: number }>({ top: 0 });
  const btn = useRef<HTMLButtonElement>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);
  useEffect(() => { onOpenChange?.(open); }, [open, onOpenChange]);

  const measure = useCallback(() => {
    const r = btn.current?.getBoundingClientRect();
    if (!r) return;
    const maxLeft = window.innerWidth - width - 12;
    setPos(align === "right" ? { top: r.bottom + 8, right: Math.max(12, window.innerWidth - r.right) } : { top: r.bottom + 8, left: Math.max(12, Math.min(r.left, maxLeft)) });
  }, [align, width]);

  const closeNow = useCallback(() => {
    clearTimeout(openTimer.current);
    clearTimeout(closeTimer.current);
    setOpen(false);
  }, []);
  const scheduleOpen = () => { clearTimeout(closeTimer.current); if (!open) openTimer.current = setTimeout(() => { measure(); setOpen(true); }, OPEN_DELAY); };
  const scheduleClose = () => { clearTimeout(openTimer.current); closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY); };
  const keepOpen = () => clearTimeout(closeTimer.current);

  useEffect(() => { closeNow(); }, [pathname, closeNow]);
  useEffect(() => () => { clearTimeout(openTimer.current); clearTimeout(closeTimer.current); }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { closeNow(); btn.current?.focus(); } };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", closeNow, { passive: true }); // the panel is fixed: close instead of drifting away from its trigger
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("resize", measure); window.removeEventListener("scroll", closeNow); };
  }, [open, measure, closeNow]);

  return (
    <div onMouseEnter={scheduleOpen} onMouseLeave={scheduleClose} className="relative">
      <button
        ref={btn}
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={id}
        aria-label={label}
        onClick={() => { clearTimeout(openTimer.current); clearTimeout(closeTimer.current); measure(); setOpen((o) => !o); }}
        onKeyDown={(e) => { if (e.key === "ArrowDown") { e.preventDefault(); measure(); setOpen(true); } }}
        className={triggerClassName}
      >
        {trigger(open)}
      </button>
      {mounted && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              key={id}
              id={id}
              role="region"
              aria-label={label}
              onMouseEnter={keepOpen}
              onMouseLeave={scheduleClose}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16 }}
              className={cn("mega-panel fixed z-[55] rounded-2xl border bg-background text-foreground shadow-2xl")}
              style={{ top: pos.top, left: pos.left, right: pos.right, width }}
            >
              {children(closeNow)}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
