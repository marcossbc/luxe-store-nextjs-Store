"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ProductVariant } from "@/lib/types";

export type Selection = Record<string, string>;

export interface VariantGroup {
  label: string;
  values: string[];
  kind: "color" | "text";
  pick: (v: ProductVariant) => string | undefined;
}

const COLORS: Record<string, string> = {
  black: "#111827", white: "#f9fafb", red: "#dc2626", blue: "#2563eb", navy: "#1e3a8a", green: "#16a34a",
  yellow: "#facc15", orange: "#f97316", pink: "#ec4899", purple: "#9333ea", grey: "#6b7280", gray: "#6b7280",
  brown: "#92400e", beige: "#d6c3a3", sand: "#d9c6a0", khaki: "#b8a76a", silver: "#c0c4cc", gold: "#d4af37",
  cream: "#f5ecd7", burgundy: "#7f1d3a", olive: "#6b7035", teal: "#0d9488", coffee: "#6f4e37",
};

export function colorToCss(name: string): string | null {
  const words = name.toLowerCase().split(/[\s/&,]+/);
  for (const w of words) if (COLORS[w]) return COLORS[w];
  return null;
}

/** Builds Color / Size groups (or a single "Option" group) from the product's variants. */
export function buildGroups(variants: ProductVariant[]): VariantGroup[] {
  const uniq = (xs: (string | undefined)[]) => Array.from(new Set(xs.filter(Boolean) as string[]));
  const colors = uniq(variants.map((v) => v.color));
  const sizes = uniq(variants.map((v) => v.size));
  const groups: VariantGroup[] = [];
  if (colors.length) groups.push({ label: "Color", values: colors, kind: "color", pick: (v) => v.color });
  if (sizes.length) groups.push({ label: "Size", values: sizes, kind: "text", pick: (v) => v.size });
  if (!groups.length) groups.push({ label: "Option", values: uniq(variants.map((v) => v.title)), kind: "text", pick: (v) => v.title });
  return groups;
}

export function findVariant(variants: ProductVariant[], groups: VariantGroup[], sel: Selection) {
  return variants.find((v) => groups.every((g) => g.pick(v) === sel[g.label]));
}

interface Props {
  variants: ProductVariant[];
  groups: VariantGroup[];
  selection: Selection;
  onChange: (label: string, value: string) => void;
}

export function VariantSelector({ variants, groups, selection, onChange }: Props) {
  return (
    <div className="space-y-6">
      {groups.map((g) => (
        <div key={g.label}>
          <div className="flex items-center justify-between mb-3 text-sm">
            <span className="font-medium text-foreground">
              {g.label}: <span className="text-muted-foreground font-normal">{selection[g.label]}</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label={g.label}>
            {g.values.map((value) => {
              const selected = selection[g.label] === value;
              // a value is available if some in-stock variant has it with the other current selections
              const available = variants.some(
                (v) =>
                  v.inStock &&
                  g.pick(v) === value &&
                  groups.every((o) => o.label === g.label || o.pick(v) === selection[o.label])
              );
              const css = g.kind === "color" ? colorToCss(value) : null;
              return (
                <motion.button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={value}
                  title={available ? value : `${value} (unavailable)`}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => onChange(g.label, value)}
                  className={cn(
                    "relative transition-all",
                    css
                      ? "h-10 w-10 rounded-full border-2 flex items-center justify-center"
                      : "min-w-[3rem] h-10 px-4 rounded-xl border-2 text-sm font-medium",
                    selected ? "border-primary ring-2 ring-primary/20" : "border-input hover:border-foreground/40",
                    !available && "opacity-40"
                  )}
                  style={css ? { backgroundColor: css } : undefined}
                >
                  {css ? (selected && <Check size={16} className={css === "#f9fafb" || css === "#f5ecd7" ? "text-black" : "text-white"} />) : value}
                  {!available && <span className="absolute inset-0 overflow-hidden rounded-[inherit]"><span className="absolute left-0 top-1/2 w-full h-px bg-foreground/50 -rotate-45" /></span>}
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
