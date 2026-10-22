"use client";

import { motion } from "framer-motion";
import { ArrowDownLeft, Sparkles, Wallet } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { getTier } from "./vip-tier-card";

/** Cashback rate per tier */
const RATES: Record<string, number> = { Bronze: 0.01, Silver: 0.02, Gold: 0.03, "Black VIP": 0.05 };

export function WalletCard({ spent, orderCount, tierName, rate: rateOverride }: { spent: number; orderCount: number; tierName?: string; rate?: number }) {
  const { tier } = getTier(spent);
  const rate = rateOverride ?? RATES[tier.name];
  const balance = Math.round(spent * rate * 100) / 100;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 text-white h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white/60 text-sm"><Wallet size={16} /> Luxe Credits</div>
        <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-400/10 text-emerald-300 border border-emerald-400/20">
          {Math.round(rate * 100)}% cashback
        </span>
      </div>

      <motion.div
        key={balance}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 text-4xl font-semibold tracking-tight bg-gradient-to-r from-cyan-300 to-fuchsia-300 bg-clip-text text-transparent"
      >
        {formatPrice(balance)}
      </motion.div>
      <p className="text-xs text-white/40 mt-1">Available to spend on your next order</p>

      <div className="mt-5 space-y-2 flex-1">
        <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2.5 text-sm">
          <span className="flex items-center gap-2 text-white/70"><ArrowDownLeft size={14} className="text-emerald-300" /> Cashback earned</span>
          <span>{formatPrice(balance)}</span>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2.5 text-sm">
          <span className="flex items-center gap-2 text-white/70"><Sparkles size={14} className="text-amber-300" /> From {orderCount} orders</span>
          <span>{tierName ?? tier.name}</span>
        </div>
      </div>

      <button className="mt-5 w-full h-10 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors">
        Redeem credits all
      </button>
    </div>
  );
}
