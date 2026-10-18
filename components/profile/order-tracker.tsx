"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, PackageCheck, Plane, Truck, Boxes } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

export interface TrackedOrder { id: string; date: string; total: number; status: string; items: number }

const STEPS = [
  { key: "Processing", label: "Processing", sub: "Order confirmed", icon: Boxes },
  { key: "Shipped", label: "Shipped via CJ", sub: "Left the warehouse", icon: Plane },
  { key: "In Transit", label: "In Transit", sub: "On its way to you", icon: Truck },
  { key: "Delivered", label: "Delivered", sub: "Enjoy your order", icon: PackageCheck },
];

const stepIndex = (status: string) => Math.max(0, STEPS.findIndex((s) => s.key === status));

export function OrderTracker({ orders }: { orders: TrackedOrder[] }) {
  const [selected, setSelected] = useState(orders[0]?.id);
  const order = orders.find((o) => o.id === selected) ?? orders[0];
  if (!order) return null;
  const current = stepIndex(order.status);
  const delivered = current === STEPS.length - 1;
  const pct = (current / (STEPS.length - 1)) * 100;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 text-white">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h3 className="font-semibold flex items-center gap-2">Order tracking <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-widest text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />Live</span></h3>
        <div className="flex gap-2 overflow-x-auto">
          {orders.map((o) => (
            <button
              key={o.id}
              onClick={() => setSelected(o.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs border transition-colors whitespace-nowrap",
                o.id === order.id ? "bg-white text-black border-white" : "border-white/15 text-white/70 hover:bg-white/10"
              )}
            >
              {o.id}
            </button>
          ))}
        </div>
      </div>

      <div className="text-sm text-white/60 mb-6">
        {order.date} · {order.items} item{order.items > 1 ? "s" : ""} · {formatPrice(order.total)}
      </div>

      {/* desktop: horizontal */}
      <div className="relative hidden sm:block">
        <div className="absolute left-0 right-0 top-5 mx-[12.5%] h-0.5 bg-white/10" />
        <motion.div
          key={order.id}
          className="absolute left-0 top-5 ml-[12.5%] h-0.5 bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500 shadow-[0_0_12px_rgba(168,85,247,0.8)]"
          initial={{ width: 0 }}
          animate={{ width: `${pct * 0.75}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
        <div className="relative grid grid-cols-4">
          {STEPS.map((s, i) => <Step key={`${order.id}-${s.key}`} step={s} index={i} done={i < current || delivered} active={!delivered && i === current} />)}
        </div>
      </div>

      {/* mobile: vertical */}
      <div className="sm:hidden space-y-5">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center gap-4">
            <Dot key={`${order.id}-${s.key}`} done={i < current || delivered} active={!delivered && i === current} Icon={s.icon} index={i} />
            <div>
              <div className={cn("text-sm font-medium", i <= current ? "text-white" : "text-white/40")}>{s.label}</div>
              <div className="text-xs text-white/40">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Dot({ done, active, Icon, index = 0 }: { done: boolean; active: boolean; Icon: React.ElementType; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0.25, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.15 + index * 0.25, type: "spring", stiffness: 200, damping: 25 }}
      className={cn(
        "relative h-10 w-10 rounded-full flex items-center justify-center border shrink-0",
        done && "bg-gradient-to-br from-cyan-400 to-violet-500 border-transparent text-black",
        active && "bg-black border-fuchsia-400 text-fuchsia-300 shadow-[0_0_18px_rgba(217,70,239,0.7)]",
        !done && !active && "bg-black/40 border-white/15 text-white/30"
      )}
    >
      {done ? <Check size={18} /> : <Icon size={18} />}
      {active && <span className="absolute inset-0 rounded-full border border-fuchsia-400/60 animate-ping" />}
    </motion.div>
  );
}

function Step({ step, done, active, index }: { step: (typeof STEPS)[number]; done: boolean; active: boolean; index: number }) {
  return (
    <div className="flex flex-col items-center text-center gap-2">
      <Dot done={done} active={active} Icon={step.icon} index={index} />
      <div className={cn("text-sm font-medium", done || active ? "text-white" : "text-white/40")}>{step.label}</div>
      <div className="text-xs text-white/40">{step.sub}</div>
    </div>
  );
}
