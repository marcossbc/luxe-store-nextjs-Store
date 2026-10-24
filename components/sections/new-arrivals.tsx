"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FloatingProducts } from "@/components/luxe/floating-products";
import { ProductGridSkeleton } from "@/components/product/product-card-skeleton";
import { useProducts } from "@/lib/hooks/use-products";

export function NewArrivals() {
  const { products, loading } = useProducts();
  const newProducts = products.filter((p) => p.badge === "new").slice(0, 4);
  if (newProducts.length === 0) newProducts.push(...[...products].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 4));

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
        {loading ? <ProductGridSkeleton count={4} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" /> : <FloatingProducts items={newProducts} />}
      </div>
    </section>
  );
}
