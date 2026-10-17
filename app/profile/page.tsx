"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Package, Heart, MapPin, Settings, LogOut, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWishlistContext } from "@/components/layout/wishlist-provider";
import { useProducts } from "@/lib/hooks/use-products";
import { formatPrice } from "@/lib/utils";
import { LuxeDashboard } from "@/components/profile/luxe-dashboard";

const tabs = [
  { id: "orders", label: "Orders", icon: Package },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "settings", label: "Settings", icon: Settings },
];

const orders = [
  { id: "ORD-78432", date: "2026-07-10", total: 549, status: "Delivered", items: 1 },
  { id: "ORD-78401", date: "2026-06-28", total: 898, status: "Shipped", items: 2 },
  { id: "ORD-78356", date: "2026-06-15", total: 329, status: "Processing", items: 1 },
];

const addresses = [
  { id: "addr_1", label: "Home", street: "123 Main Street", city: "New York", state: "NY", zip: "10001", isDefault: true },
  { id: "addr_2", label: "Office", street: "456 Business Ave", city: "New York", state: "NY", zip: "10002", isDefault: false },
];

export default function ProfilePage() {
  const { products } = useProducts();
  const [activeTab, setActiveTab] = useState("orders");
  const { wishlist } = useWishlistContext();
  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
              JD
            </div>
            <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-accent border flex items-center justify-center hover:bg-accent/80 transition-colors">
              <Edit3 size={12} />
            </button>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">John Doe</h1>
            <p className="text-muted-foreground">john.doe@example.com</p>
            <p className="text-sm text-muted-foreground">Member since January 2026</p>
          </div>
          <Button variant="outline" size="sm">
            <LogOut size={16} className="mr-2" />
            Sign Out
          </Button>
        </div>

        <LuxeDashboard name="John Doe" since="Jan 2026" orders={orders} />

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
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="p-6 rounded-2xl border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                      <Package size={20} className="text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{order.id}</div>
                      <div className="text-sm text-muted-foreground">{order.date} · {order.items} item{order.items > 1 ? "s" : ""}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-semibold text-foreground">{formatPrice(order.total)}</div>
                      <div className={`text-sm ${
                        order.status === "Delivered" ? "text-emerald-600" :
                        order.status === "Shipped" ? "text-blue-600" :
                        "text-amber-600"
                      }`}>{order.status}</div>
                    </div>
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                </div>
              ))}
            </motion.div>
          </TabsContent>

          <TabsContent value="wishlist">
            {wishlistProducts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Heart size={48} className="mx-auto mb-4 opacity-30" />
                <p>Your wishlist is empty</p>
                <Button variant="outline" className="mt-4" asChild>
                  <a href="/shop">Browse Products</a>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {wishlistProducts.map((product) => (
                  <div key={product.id} className="flex gap-4 p-4 rounded-2xl border bg-card">
                    <img src={product.images[0]} alt={product.name} className="w-20 h-20 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.categoryName}</p>
                      <p className="font-semibold text-foreground mt-1">{formatPrice(product.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="addresses">
            <div className="space-y-4">
              {addresses.map((addr) => (
                <div key={addr.id} className="p-6 rounded-2xl border bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{addr.label}</span>
                      {addr.isDefault && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Default</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">Edit</Button>
                      {!addr.isDefault && <Button variant="ghost" size="sm" className="text-destructive">Delete</Button>}
                    </div>
                  </div>
                  <p className="text-muted-foreground">{addr.street}</p>
                  <p className="text-muted-foreground">{addr.city}, {addr.state} {addr.zip}</p>
                </div>
              ))}
              <Button variant="outline" className="w-full">Add New Address</Button>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="p-6 rounded-2xl border bg-card space-y-6">
              <div>
                <h3 className="font-semibold text-foreground mb-4">Account Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <div className="font-medium text-foreground">Email Notifications</div>
                      <div className="text-sm text-muted-foreground">Receive updates about orders and promotions</div>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-input" />
                  </div>
                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <div className="font-medium text-foreground">Two-Factor Authentication</div>
                      <div className="text-sm text-muted-foreground">Add an extra layer of security</div>
                    </div>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <div className="font-medium text-foreground text-destructive">Delete Account</div>
                      <div className="text-sm text-muted-foreground">Permanently remove your account and data</div>
                    </div>
                    <Button variant="destructive" size="sm">Delete</Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
