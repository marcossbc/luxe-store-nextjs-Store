"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { products } from "@/lib/data";

export function FeaturedProducts() {
  const featured = products.slice(0, 4);

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Featured Products</h2>
            <p className="mt-2 text-muted-foreground">Handpicked favorites from our collection</p>
          </div>
          <Button variant="ghost" asChild className="hidden md:flex">
            <Link href="/shop">View All <ArrowRight size={16} className="ml-2" /></Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
