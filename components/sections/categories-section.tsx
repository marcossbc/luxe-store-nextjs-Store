"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Shirt, Home, Dumbbell, Gem, Sparkles } from "lucide-react";

const iconMap: Record<string, React.ElementType> = { Zap, Shirt, Home, Dumbbell, Gem, Sparkles };

const categories = [
  { id: "electronics", name: "Electronics", desc: "Tech essentials", icon: "Zap", image: "https://images.unsplash.com/photo-1498049860654-af1a5c5668ba?w=600&h=600&fit=crop" },
  { id: "fashion", name: "Fashion", desc: "Style & apparel", icon: "Shirt", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=600&fit=crop" },
  { id: "home", name: "Home & Living", desc: "Interior design", icon: "Home", image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&h=600&fit=crop" },
  { id: "sports", name: "Sports", desc: "Active lifestyle", icon: "Dumbbell", image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&h=600&fit=crop" },
  { id: "accessories", name: "Accessories", desc: "Finishing touches", icon: "Gem", image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&h=600&fit=crop" },
  { id: "beauty", name: "Beauty", desc: "Self-care essentials", icon: "Sparkles", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop" },
];

export function CategoriesSection() {
  return (
    <section className="py-20 bg-accent/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Shop by Category</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Explore our carefully curated collections designed for modern living.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => {
            const Icon = iconMap[cat.icon];
            return (
              <motion.button key={cat.id} whileHover={{ scale: 1.03, y: -4 }} whileTap={{ scale: 0.98 }} className="group relative overflow-hidden rounded-2xl aspect-square bg-card border hover:border-primary/50 transition-all duration-300">
                <Link href={`/shop?category=${cat.id}`} className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
                  <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon size={28} />
                  </div>
                  <span className="text-sm font-medium text-foreground text-center">{cat.name}</span>
                </Link>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
