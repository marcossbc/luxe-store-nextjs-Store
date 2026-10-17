"use client";

import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product/product-card";
import { useProducts } from "@/lib/hooks/use-products";

export function BestSellers() {
  const { products } = useProducts();
  const bestsellers = products.filter((p) => p.badge === "bestseller" || p.reviewCount > 2000).slice(0, 4);
  if (bestsellers.length === 0) bestsellers.push(...products.slice(4, 8));

  return (
    <section className="py-20 bg-accent/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-12">
          <div className="flex items-center gap-3">
            <Badge variant="blue" className="text-sm px-3 py-1">
              <TrendingUp size={14} className="mr-1" />
              Best Sellers
            </Badge>
          </div>
          <Button variant="ghost" asChild className="hidden md:flex">
            <Link href="/shop?sort=bestselling">View All <ArrowRight size={16} className="ml-2" /></Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestsellers.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
