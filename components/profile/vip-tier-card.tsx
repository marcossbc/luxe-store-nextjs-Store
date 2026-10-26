"use client";

import { BRAND } from "@/lib/brand";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Crown } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export const TIERS = [
  { name: "Bronze", min: 0, gradient: "from-amber-700 via-orange-500 to-amber-800", text: "text-amber-300" },
  { name: "Silver", min: 500, gradient: "from-slate-400 via-slate-200 to-slate-500", text: "text-slate-200" },
  { name: "Gold", min: 1500, gradient: "from-yellow-500 via-amber-300 to-yellow-600", text: "text-yellow-300" },
  { name: "Black VIP", min: 5000, gradient: "from-zinc-900 via-fuchsia-600 to-cyan-400", text: "text-fuchsia-300" },
] as const;

export function getTier(spent: number) {
  let idx = 0;
  TIERS.forEach((t, i) => { if (spent >= t.min) idx = i; });
  return { tier: TIERS[idx], next: TIERS[idx + 1] as (typeof TIERS)[number] | undefined, idx };
}

interface Props { name: string; memberId: string; since: string; spent: number }

export function VipTierCard({ name, memberId, since, spent }: Props) {
  const { tier, next } = getTier(spent);
  const progress = next ? Math.min(100, ((spent - tier.min) / (next.min - tier.min)) * 100) : 100;

  // 3D tilt following the pointer
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), { stiffness: 200, damping: 20 });

  return (
    <div style={{ perspective: 1000 }}>
      <motion.div
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          mx.set((e.clientX - r.left) / r.width - 0.5);
          my.set((e.clientY - r.top) / r.height - 0.5);
        }}
        onMouseLeave={() => { mx.set(0); my.set(0); }}
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className="neon-border neon-glow sheen relative overflow-hidden rounded-3xl p-6 sm:p-7 bg-white/[0.04] backdrop-blur-2xl text-white"
      >
        <div className={`pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full bg-gradient-to-br ${tier.gradient} opacity-30 blur-3xl`} />

        <div className="relative flex items-start justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.25em] text-white/50">{BRAND.name} Membership</div>
            <div className={`mt-1 flex items-center gap-2 text-2xl font-semibold ${tier.text}`}>
              <Crown size={22} /> {tier.name}
            </div>
          </div>
          <div className={`h-10 w-14 rounded-lg bg-gradient-to-br ${tier.gradient} opacity-90`} aria-hidden />
        </div>

        <div className="relative mt-10 font-mono tracking-[0.2em] text-white/80 text-sm">{memberId}</div>

        <div className="relative mt-4 flex items-end justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-white/40">Member</div>
            <div className="font-medium">{name}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest text-white/40">Since</div>
            <div className="font-medium">{since}</div>
          </div>
        </div>

        <div className="relative mt-6">
          <div className="flex justify-between text-xs text-white/60 mb-2">
            <span>{formatPrice(spent)} lifetime spend</span>
            <span>{next ? `${formatPrice(next.min - spent)} to ${next.name}` : "Highest tier reached"}</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${tier.gradient}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
