"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useLiveStock } from "@/lib/hooks/use-live-stock";
import { editionTag } from "@/lib/luxe/helpers";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export function EditionTag({ product, className }: { product: Product; className?: string }) {
  return (
    <span className={cn("inline-block border border-current/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]", className)}>
      {editionTag(product)}
    </span>
  );
}

/** Shows the real stock figure (re-polled from the API). Large placeholder stocks (e.g. CJ's 99) read as "In stock". */
export function LiveInventory({ product, active = true, className }: { product: Product; active?: boolean; className?: string }) {
  const stock = useLiveStock(product.slug, product.stockCount, active);
  const out = !product.inStock || stock <= 0;
  const numeric = !out && stock <= 50;
  return (
    <span className={cn("inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em]", className)} aria-live="polite">
      <span className="relative flex h-2 w-2">
        {!out && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />}
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", out ? "bg-rose-500" : "bg-emerald-400")} />
      </span>
      Live inventory ·{" "}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={out ? "out" : numeric ? stock : "in"} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }}>
          {out ? "Sold out" : numeric ? `${stock} remaining` : "Available"}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
