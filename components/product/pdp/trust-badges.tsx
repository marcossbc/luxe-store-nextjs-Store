"use client";

import { Truck, ShieldCheck, RotateCcw, Lock } from "lucide-react";
import { motion } from "framer-motion";

const items = [
  { icon: Truck, title: "Fast Shipping", desc: "Dispatched in 24-48h" },
  { icon: RotateCcw, title: "30-Day Money Back", desc: "Hassle-free returns" },
  { icon: ShieldCheck, title: "Buyer Protection", desc: "Covered until delivery" },
  { icon: Lock, title: "Secure Checkout", desc: "256-bit encryption" },
];

export function TrustBadges() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((it) => (
        <div key={it.title} className="flex items-center gap-3 p-3 rounded-2xl border bg-card/60">
          <div className="h-9 w-9 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <it.icon size={18} />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-foreground leading-tight">{it.title}</div>
            <div className="text-xs text-muted-foreground">{it.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function StockIndicator({ inStock, count }: { inStock: boolean; count?: number }) {
  if (!inStock) {
    return <div className="flex items-center gap-2 text-sm text-rose-500"><span className="h-2 w-2 rounded-full bg-rose-500" />Out of stock</div>;
  }
  const low = typeof count === "number" && count > 0 && count <= 10;
  return (
    <div>
      <div className={`flex items-center gap-2 text-sm font-medium ${low ? "text-amber-500" : "text-emerald-500"}`}>
        <span className="relative flex h-2 w-2">
          <span className={`absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping ${low ? "bg-amber-500" : "bg-emerald-500"}`} />
          <span className={`relative inline-flex h-2 w-2 rounded-full ${low ? "bg-amber-500" : "bg-emerald-500"}`} />
        </span>
        {low ? `Only ${count} left in stock` : "In stock and ready to ship"}
      </div>
      {low && (
        <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-500"
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(8, (count! / 10) * 100)}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      )}
    </div>
  );
}
