"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { CategoryFilter } from "@/components/filters/category-filter";
import { SortDropdown } from "@/components/filters/sort-dropdown";
import { products } from "@/lib/data";

export default function ShopPage() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "all";
  const sort = searchParams.get("sort") || "featured";
  const query = searchParams.get("q") || "";

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (category !== "all") {
      result = result.filter((p) => p.category === category);
    }

    if (query) {
      const lowerQuery = query.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(lowerQuery) ||
          p.description.toLowerCase().includes(lowerQuery) ||
          p.tags.some((t) => t.toLowerCase().includes(lowerQuery))
      );
    }

    switch (sort) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "bestselling":
        result.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
    }

    return result;
  }, [category, sort, query]);

  const categoryName = category === "all" ? "All Products" : products.find((p) => p.category === category)?.categoryName || "Products";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight size={14} />
          <span className="text-foreground">{categoryName}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-24">
              <CategoryFilter />
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-foreground">{categoryName}</h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">{filteredProducts.length} products</span>
                <SortDropdown />
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <p className="text-lg">No products found</p>
                <p className="text-sm mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
