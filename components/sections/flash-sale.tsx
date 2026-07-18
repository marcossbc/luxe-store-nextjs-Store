"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Timer, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product/product-card";
import { products } from "@/lib/data";

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="flex items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
            {value.toString().padStart(2, "0")}
          </div>
          {unit !== "seconds" && <span className="text-foreground font-bold">:</span>}
        </div>
      ))}
    </div>
  );
}

export function FlashSale() {
  const saleProducts = products.filter((p) => p.badge === "sale").slice(0, 4);

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="rose" className="text-sm px-3 py-1">
                <Timer size={14} className="mr-1" />
                Flash Sale
              </Badge>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Limited Time Offers</h2>
            <p className="mt-2 text-muted-foreground">Up to 40% off on selected items</p>
          </div>
          <CountdownTimer />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {saleProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button variant="outline" asChild>
            <Link href="/shop?badge=sale">View All Deals <ArrowRight size={16} className="ml-2" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
