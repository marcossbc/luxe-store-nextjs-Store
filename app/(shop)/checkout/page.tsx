"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Truck, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartContext } from "@/components/layout/cart-provider";
import { formatPrice } from "@/lib/utils";

export default function CheckoutPage() {
  const { items, subtotal, shipping, tax, total, clearCart } = useCartContext();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const { user } = useAuth();
  const [firstName, ...restName] = (user?.name ?? "").split(" ");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const allShopify = items.length > 0 && items.every((i) => i.source === "shopify" && i.variantId);

  const handlePlaceOrder = async () => {
    setError("");
    if (allShopify) {
      setBusy(true);
      try {
        const res = await fetch("/api/checkout/shopify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error?.message || "Checkout failed");
        // never navigate to anything that is not an https URL (defence in depth; the server already allow-lists the host)
        const target = new URL(String(data.url));
        if (target.protocol !== "https:") throw new Error("Invalid checkout address");
        window.location.href = target.href; // Shopify hosted, PCI-compliant checkout
      } catch (e: any) {
        setError(e.message);
        setBusy(false);
      }
      return;
    }
    // CJ / demo items: connect Stripe or PayPal here, then call /api/orders/cj from the payment webhook.
    setError("Payment gateway not connected yet for CJ/demo items (see README: Stripe + CJ order webhook).");
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full text-center p-8 rounded-3xl border bg-card shadow-lg">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Order Confirmed!</h2>
          <p className="text-muted-foreground mb-6">Thank you for your purchase. Your order has been placed successfully.</p>
          <div className="p-4 rounded-xl bg-accent mb-6 text-left">
            <div className="flex justify-between text-sm mb-2 text-muted-foreground">
              <span>Total Paid</span>
              <span className="font-bold text-foreground">{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Estimated Delivery</span>
              <span className="text-foreground">3-5 Business Days</span>
            </div>
          </div>
          <Button className="w-full" onClick={() => { setOrderPlaced(false); clearCart(); }}>
            <Link href="/">Continue Shopping</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-8">Checkout</h1>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl border bg-card shadow-sm">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Truck size={20} /> Shipping Information
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="First Name" placeholder="First name" autoComplete="given-name" defaultValue={firstName} required />
                <Input label="Last Name" placeholder="Last name" autoComplete="family-name" defaultValue={restName.join(" ")} required />
                <Input label="Email" type="email" placeholder="you@example.com" autoComplete="email" defaultValue={user?.email ?? ""} required />
                <Input label="Phone" placeholder="+1 234 567 890" />
                <div className="sm:col-span-2">
                  <Input label="Address" placeholder="123 Main Street" required />
                </div>
                <Input label="City" placeholder="New York" required />
                <Input label="ZIP Code" placeholder="10001" required />
              </div>
            </div>
            <div className="p-6 rounded-2xl border bg-card shadow-sm">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <CreditCard size={20} /> Payment Method
              </h3>
              <p className="text-sm text-muted-foreground">
                {allShopify
                  ? "You will be redirected to Shopify's secure checkout to pay."
                  : "Card details are never collected on this page. Connect Stripe/PayPal for CJ items."}
              </p>
            </div>
          </div>
          <div>
            <div className="sticky top-24 p-6 rounded-2xl border bg-card shadow-sm">
              <h3 className="font-semibold text-foreground mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img src={item.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">{item.name}</div>
                      <div className="text-xs text-muted-foreground">Qty: {item.quantity}</div>
                    </div>
                    <div className="text-sm font-medium text-foreground">{formatPrice(item.price * item.quantity)}</div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="text-foreground">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-foreground">{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Tax</span>
                  <span className="text-foreground">{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="text-xl font-bold text-foreground">{formatPrice(total)}</span>
                </div>
              </div>
              {error && <p className="mt-4 text-sm text-rose-500">{error}</p>}
              <Button className="w-full mt-6" size="lg" disabled={busy || items.length === 0} onClick={handlePlaceOrder}>
                {busy ? "Redirecting..." : allShopify ? "Pay with Shopify" : "Place Order"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
