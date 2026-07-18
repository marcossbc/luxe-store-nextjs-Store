"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product/product-card";
import { products } from "@/lib/data";

export function NewArrivals() {
  const newProducts = products.filter((p) => p.badge === "new").slice(0, 4);

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-12">
          <div className="flex items-center gap-3">
            <Badge variant="emerald" className="text-sm px-3 py-1">
              <Sparkles size={14} className="mr-1" />
              New Arrivals
            </Badge>
          </div>
          <Button variant="ghost" asChild className="hidden md:flex">
            <Link href="/shop?sort=newest">View All <ArrowRight size={16} className="ml-2" /></Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
