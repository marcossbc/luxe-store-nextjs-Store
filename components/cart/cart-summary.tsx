"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCartContext } from "@/components/layout/cart-provider";
import { formatPrice } from "@/lib/utils";

export function CartSummary() {
  const { subtotal, shipping, tax, total, items } = useCartContext();

  return (
    <div className="p-6 rounded-2xl border bg-card shadow-sm">
      <h3 className="font-semibold text-foreground mb-4">Order Summary</h3>
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Subtotal ({items.length} items)</span>
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
        <div className="border-t pt-3 flex justify-between">
          <span className="font-semibold text-foreground">Total</span>
          <span className="text-xl font-bold text-foreground">{formatPrice(total)}</span>
        </div>
      </div>
      <Button className="w-full" size="lg" asChild>
        <Link href="/checkout">Proceed to Checkout</Link>
      </Button>
      <Link href="/shop" className="block text-center mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
        Continue Shopping
      </Link>
    </div>
  );
}
