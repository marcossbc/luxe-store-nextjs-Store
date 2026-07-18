"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Shirt, Home, Dumbbell, Gem, Sparkles } from "lucide-react";
import { categories } from "@/lib/data";

const iconMap: Record<string, React.ElementType> = { Zap, Shirt, Home, Dumbbell, Gem, Sparkles };

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Browse Categories</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">Explore our carefully curated collections designed for modern living.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, i) => {
            const Icon = iconMap[cat.icon];
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/shop?category=${cat.id}`} className="group block relative overflow-hidden rounded-3xl border bg-card shadow-sm hover:shadow-xl transition-all duration-500 aspect-[4/3]">
                  <div className="absolute inset-0">
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity group-hover:scale-105 duration-700" />
                  </div>
                  <div className="absolute inset-0 flex flex-col justify-end p-8 bg-gradient-to-t from-background via-background/80 to-transparent">
                    <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon size={28} />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-1">{cat.name}</h3>
                    <p className="text-muted-foreground">{cat.productCount} products</p>
                  </div>
                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight size={24} className="text-foreground" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
