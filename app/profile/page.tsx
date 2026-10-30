"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, Package, Heart, MapPin, Settings, LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWishlistContext } from "@/components/layout/wishlist-provider";
import { useAuth } from "@/components/auth/auth-provider";
import { useProducts } from "@/lib/hooks/use-products";
import { formatPrice } from "@/lib/utils";
import { MemberVault } from "@/components/profile/member-vault";
import { BRAND } from "@/lib/brand";

const tabs = [
  { id: "orders", label: "Orders", icon: Package },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "settings", label: "Settings", icon: Settings },
];

// Orders are placed on Shopify's checkout; they will be listed here once order history is connected.
const orders: { id: string; date: string; total: number; status: string; items: number }[] = [];

const monthYear = (iso: string, short = false) => new Date(iso).toLocaleDateString("en-US", { month: short ? "short" : "long", year: "numeric", timeZone: "UTC" });
const initials = (name: string) => name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

function Empty({ icon: Icon, title, hint, cta }: { icon: typeof Package; title: string; hint: string; cta?: { href: string; label: string } }) {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <Icon size={48} className="mx-auto mb-4 opacity-30" />
      <p className="font-medium text-foreground">{title}</p>
      <p className="text-sm mt-1">{hint}</p>
      {cta && <Button variant="outline" className="mt-4" asChild><Link href={cta.href}>{cta.label}</Link></Button>}
    </div>
  );
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { products } = useProducts();
  const [activeTab, setActiveTab] = useState("orders");
  const { wishlist } = useWishlistContext();
  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));
  if (!user) return null; // the server layout already redirects signed-out visitors

  return (
    <div className="min-h-screen bg-background pt-[calc(var(--nav-h)+1.5rem)] pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <div className="w-20 h-20 shrink-0 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold" aria-hidden>
            {initials(user.name) || <User size={28} />}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-foreground truncate">{user.name}</h1>
            <p className="text-muted-foreground truncate">{user.email}</p>
            <p className="text-sm text-muted-foreground">Member since {monthYear(user.createdAt)}</p>
          </div>
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut size={16} className="mr-2" />
            Sign Out
          </Button>
        </div>

        <MemberVault name={user.name} since={monthYear(user.createdAt, true)} orders={orders} memberId={`${BRAND.wordmark} •••• ${user.id.replace(/-/g, "").slice(0, 4).toUpperCase()}`} />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-8">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
                <tab.icon size={16} />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="orders">
            {orders.length === 0 ? (
              <Empty icon={Package} title="No orders yet" hint="When you place an order it will appear here." cta={{ href: "/shop", label: "Start shopping" }} />
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="p-6 rounded-2xl border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="font-semibold text-foreground">{order.id}</div>
                      <div className="text-sm text-muted-foreground">{order.date} · {order.items} item{order.items > 1 ? "s" : ""}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-foreground">{formatPrice(order.total)}</div>
                      <div className="text-sm text-muted-foreground">{order.status}</div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="wishlist">
            {wishlistProducts.length === 0 ? (
              <Empty icon={Heart} title="Your wishlist is empty" hint="Tap the heart on any product to save it here." cta={{ href: "/shop", label: "Browse Products" }} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {wishlistProducts.map((product) => (
                  <Link key={product.id} href={`/shop/${product.slug}`} className="flex gap-4 p-4 rounded-2xl border bg-card hover:bg-accent/40 transition-colors">
                    <img src={product.images[0]} alt={product.name} className="w-20 h-20 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.categoryName}</p>
                      <p className="font-semibold text-foreground mt-1">{formatPrice(product.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="addresses">
            <Empty icon={MapPin} title="No saved addresses" hint="You enter your delivery address at checkout." />
          </TabsContent>

          <TabsContent value="settings">
            <div className="p-6 rounded-2xl border bg-card space-y-6">
              <h3 className="font-semibold text-foreground">Account</h3>
              <dl className="divide-y">
                {[["Name", user.name], ["Email", user.email], ["Member since", monthYear(user.createdAt)]].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-4 py-3">
                    <dt className="text-sm text-muted-foreground">{k}</dt>
                    <dd className="font-medium text-foreground truncate">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="flex items-start gap-3 rounded-xl bg-accent/50 p-4 text-sm text-muted-foreground">
                <ShieldCheck size={18} className="mt-0.5 shrink-0" />
                <p>Your password is stored encrypted and you stay signed in only on this device. Use <span className="font-medium text-foreground">Sign Out</span> on shared computers.</p>
              </div>
              <Button variant="outline" onClick={logout}><LogOut size={16} className="mr-2" /> Sign Out</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
