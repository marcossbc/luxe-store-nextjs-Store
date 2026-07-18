"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Filter, Grid3X3, Zap, Shirt, Home, Dumbbell, Gem, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = { Grid3X3, Zap, Shirt, Home, Dumbbell, Gem, Sparkles };

const categories = [
  { id: "all", name: "All Products", icon: "Grid3X3" },
  { id: "electronics", name: "Electronics", icon: "Zap" },
  { id: "fashion", name: "Fashion", icon: "Shirt" },
  { id: "home", name: "Home & Living", icon: "Home" },
  { id: "sports", name: "Sports", icon: "Dumbbell" },
  { id: "accessories", name: "Accessories", icon: "Gem" },
  { id: "beauty", name: "Beauty", icon: "Sparkles" },
];

export function CategoryFilter() {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || "all";

  return (
    <div className="p-6 rounded-2xl border bg-card shadow-sm">
      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <Filter size={18} /> Filters
      </h3>
      <div className="space-y-1">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Categories</div>
        {categories.map((cat) => {
          const Icon = iconMap[cat.icon];
          const isActive = currentCategory === cat.id;
          return (
            <Link
              key={cat.id}
              href={cat.id === "all" ? "/shop" : `/shop?category=${cat.id}`}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                isActive ? "bg-accent font-semibold text-foreground" : "text-muted-foreground hover:bg-accent/50"
              )}
            >
              <Icon size={16} />
              {cat.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
