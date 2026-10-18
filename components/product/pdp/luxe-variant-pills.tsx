"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ProductVariant } from "@/lib/types";
import { colorToCss, type Selection, type VariantGroup } from "./variant-selector";

const SPRING = { type: "spring", stiffness: 200, damping: 25 } as const;

interface Props {
  variants: ProductVariant[];
  groups: VariantGroup[];
  selection: Selection;
  onChange: (label: string, value: string) => void;
}

/** Premium pills: a shared highlight slides between options for instant state feedback. */
export function LuxeVariantPills({ variants, groups, selection, onChange }: Props) {
  return (
    <div className="space-y-6">
      {groups.map((g) => (
        <div key={g.label}>
          <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.18em]">
            <span className="text-muted-foreground">{g.label}</span>
            <span className="font-semibold text-foreground">{selection[g.label]}</span>
          </div>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={g.label}>
            {g.values.map((value) => {
              const selected = selection[g.label] === value;
              const available = variants.some((v) => v.inStock && g.pick(v) === value && groups.every((o) => o.label === g.label || o.pick(v) === selection[o.label]));
              const css = g.kind === "color" ? colorToCss(value) : null;
              return (
                <motion.button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onChange(g.label, value)}
                  className={cn(
                    "relative flex h-11 min-w-[3.25rem] items-center justify-center gap-2 rounded-full border px-5 text-sm font-medium transition-colors",
                    selected ? "border-transparent text-background" : "border-input text-foreground hover:border-foreground/50",
                    !available && "opacity-40 line-through"
                  )}
                >
                  {selected && <motion.span layoutId={`pill-${g.label}`} transition={SPRING} className="absolute inset-0 rounded-full bg-foreground" />}
                  <span className="relative z-10 flex items-center gap-2">
                    {css && <span className="h-3.5 w-3.5 rounded-full border border-black/20" style={{ backgroundColor: css }} />}
                    {value}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
