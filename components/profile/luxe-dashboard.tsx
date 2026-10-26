"use client";

import { BRAND } from "@/lib/brand";
import { VipTierCard } from "./vip-tier-card";
import { WalletCard } from "./wallet-card";
import { OrderTracker, type TrackedOrder } from "./order-tracker";
import { StylePreferences } from "./style-preferences";

interface Props {
  name: string;
  since: string;
  orders: TrackedOrder[];
}

/** Dark "VIP" dashboard. Always dark so the neon/glass look works in both site themes. */
export function LuxeDashboard({ name, since, orders }: Props) {
  const spent = orders.reduce((sum, o) => sum + o.total, 0);
  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-[#07070c] p-4 sm:p-6 mb-10 border border-white/10">
      <div className="pointer-events-none absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-violet-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 right-1/4 h-96 w-96 rounded-full bg-cyan-500/15 blur-[120px]" />
      <div className="relative space-y-4">
        <div className="grid lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3"><VipTierCard name={name} memberId={`${BRAND.wordmark} •••• 4821`} since={since} spent={spent} /></div>
          <div className="lg:col-span-2"><WalletCard spent={spent} orderCount={orders.length} /></div>
        </div>
        <OrderTracker orders={orders} />
        <StylePreferences />
      </div>
    </section>
  );
}
