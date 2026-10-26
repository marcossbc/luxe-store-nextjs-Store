"use client";

import { BRAND } from "@/lib/brand";
import { Lock } from "lucide-react";
import { VaultCard, getVaultTier } from "./vault-card";
import { WalletCard } from "./wallet-card";
import { OrderTracker, type TrackedOrder } from "./order-tracker";
import { StyleVault } from "./style-vault";
import { StylePreferences } from "./style-preferences";
import { CuratedForYou } from "./curated-for-you";

export function MemberVault({ name, since, orders }: { name: string; since: string; orders: TrackedOrder[] }) {
  const spent = orders.reduce((sum, o) => sum + o.total, 0);
  const { tier } = getVaultTier(spent);
  return (
    <section className="relative mb-10 overflow-hidden rounded-[2rem] border border-white/10 bg-[#07070c] p-4 sm:p-6">
      <div className="pointer-events-none absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-violet-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 right-1/4 h-96 w-96 rounded-full bg-cyan-500/15 blur-[120px]" />
      <div className="relative space-y-4">
        <div className="flex items-center gap-2 px-1 text-white/70"><Lock size={14} /><span className="display-title text-xl tracking-[0.25em]">Member Vault</span></div>
        <div className="grid gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3"><VaultCard name={name} memberId={`${BRAND.wordmark} •••• 4821`} since={since} spent={spent} /></div>
          <div className="lg:col-span-2"><WalletCard spent={spent} orderCount={orders.length} tierName={tier.name} rate={tier.rate} /></div>
        </div>
        <OrderTracker orders={orders} />
        <StyleVault />
        <CuratedForYou />
        <StylePreferences />
      </div>
    </section>
  );
}
