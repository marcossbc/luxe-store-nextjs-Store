import { useId } from "react";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/brand";

/**
 * Dahab mark: a gold "D" whose counter is cut like a gem, on a deep charcoal tile with a fine gold edge.
 * Pure SVG (crisp at any size), unique gradient ids per instance, decorative (the wordmark/aria-label carries the name).
 */
export function LogoMark({ size = 36, className }: { size?: number; className?: string }) {
  const uid = useId().replace(/:/g, "");
  const gold = `g-${uid}`;
  const tile = `t-${uid}`;
  const sheen = `s-${uid}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" focusable="false" className={cn("shrink-0", className)}>
      <defs>
        <linearGradient id={gold} x1="12" y1="10" x2="52" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFEBB0" />
          <stop offset="0.42" stopColor="#EBA43C" />
          <stop offset="1" stopColor="#B45309" />
        </linearGradient>
        <linearGradient id={tile} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2A2A31" />
          <stop offset="1" stopColor="#0B0B0E" />
        </linearGradient>
        <linearGradient id={sheen} x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${tile})`} />
      <rect width="64" height="64" rx="16" fill={`url(#${sheen})`} />
      <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="15.25" stroke={`url(#${gold})`} strokeOpacity="0.6" strokeWidth="1.5" />
      <path
        fill={`url(#${gold})`}
        fillRule="evenodd"
        d="M18.5 14.5h15C44.4 14.5 51.5 22 51.5 32S44.4 49.5 33.5 49.5h-15v-35Zm7.5 17.5 8 8.5 8-8.5-8-8.5-8 8.5Z"
      />
    </svg>
  );
}

const SIZES = {
  sm: { mark: 28, text: "text-lg", gap: "gap-2", tag: "text-[8px]" },
  md: { mark: 36, text: "text-[1.35rem]", gap: "gap-2.5", tag: "text-[9px]" },
  lg: { mark: 52, text: "text-3xl", gap: "gap-3", tag: "text-[10px]" },
} as const;

export function Logo({
  size = "md",
  tagline = false,
  stacked = false,
  className,
  wordmarkClassName,
}: {
  size?: keyof typeof SIZES;
  tagline?: boolean;
  stacked?: boolean;
  className?: string;
  /** e.g. "hidden sm:block" to show only the mark on small screens */
  wordmarkClassName?: string;
}) {
  const s = SIZES[size];
  return (
    <span className={cn("inline-flex items-center", s.gap, stacked && "flex-col", className)}>
      <LogoMark size={s.mark} />
      <span className={cn("flex flex-col", stacked ? "items-center" : "items-start", wordmarkClassName)}>
        <span className={cn("font-display font-extrabold uppercase leading-none tracking-[0.2em]", s.text)}>{BRAND.wordmark}</span>
        {tagline && <span className={cn("mt-1 font-medium uppercase tracking-[0.32em] text-[color:var(--mega-accent)]", s.tag)}>{BRAND.tagline}</span>}
      </span>
    </span>
  );
}
