"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export const VAULT_TIERS = [
  { name: "Onyx", min: 0, rate: 0.01, accent: "#9ca3af", perks: ["1% Luxe Credits", "Member-only drops"] },
  { name: "Platinum", min: 1500, rate: 0.03, accent: "#7dd3fc", perks: ["3% Luxe Credits", "Priority dispatch", "Early access"] },
  { name: "Black VIP", min: 5000, rate: 0.05, accent: "#e879f9", perks: ["5% Luxe Credits", "Concierge support", "Bespoke batches"] },
] as const;

export function getVaultTier(spent: number) {
  let idx = 0;
  VAULT_TIERS.forEach((t, i) => { if (spent >= t.min) idx = i; });
  return { tier: VAULT_TIERS[idx], next: VAULT_TIERS[idx + 1] as (typeof VAULT_TIERS)[number] | undefined };
}

export function VaultCard({ name, memberId, since, spent }: { name: string; memberId: string; since: string; spent: number }) {
  const { tier, next } = getVaultTier(spent);
  const progress = next ? Math.min(100, ((spent - tier.min) / (next.min - tier.min)) * 100) : 100;

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [7, -7]), { stiffness: 200, damping: 25 });
  const ry = useSpring(useTransform(mx, [0, 1], [-9, 9]), { stiffness: 200, damping: 25 });
  const gx = useTransform(mx, (v) => `${v * 100}%`);
  const gy = useTransform(my, (v) => `${v * 100}%`);
  const specular = useMotionTemplate`radial-gradient(420px circle at ${gx} ${gy}, rgba(255,255,255,0.22), transparent 55%)`;

  return (
    <div style={{ perspective: 1000 }}>
      <motion.div
        onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); mx.set((e.clientX - r.left) / r.width); my.set((e.clientY - r.top) / r.height); }}
        onPointerLeave={() => { mx.set(0.5); my.set(0.5); }}
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className="brushed neon-border neon-glow relative overflow-hidden rounded-3xl p-6 text-white sm:p-8"
      >
        <motion.div className="pointer-events-none absolute inset-0" style={{ background: specular }} />
        <div className="metal-sweep pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full blur-3xl" style={{ backgroundColor: tier.accent, opacity: 0.25 }} />

        <div className="relative flex items-start justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/50">Luxe Member Vault</div>
            <div className="display-title mt-1 text-5xl" style={{ color: tier.accent }}>{tier.name}</div>
          </div>
          <ShieldCheck size={26} className="text-white/70" />
        </div>

        <div className="relative mt-8 flex flex-wrap gap-2">
          {tier.perks.map((p) => <span key={p} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] text-white/80">{p}</span>)}
        </div>

        <div className="relative mt-8 font-mono text-sm tracking-[0.25em] text-white/70">{memberId}</div>
        <div className="relative mt-3 flex items-end justify-between">
          <div><div className="text-[10px] uppercase tracking-widest text-white/40">Member</div><div className="font-medium">{name}</div></div>
          <div className="text-right"><div className="text-[10px] uppercase tracking-widest text-white/40">Since</div><div className="font-medium">{since}</div></div>
        </div>

        <div className="relative mt-6">
          <div className="mb-2 flex justify-between text-xs text-white/60">
            <span>{formatPrice(spent)} lifetime</span>
            <span>{next ? `${formatPrice(next.min - spent)} to ${next.name}` : "Highest tier"}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <motion.div className="h-full rounded-full" style={{ backgroundColor: tier.accent }} initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ type: "spring", stiffness: 60, damping: 18 }} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
