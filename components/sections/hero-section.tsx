"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800" />
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
          <Badge variant="blue" className="mb-6">New Collection 2026</Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-[1.1] tracking-tight">
            Elevate Your<br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Everyday</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
            Discover curated products that blend exceptional craftsmanship with modern design. Built for those who demand more.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button size="lg" asChild>
              <Link href="/shop">Explore Collection <ArrowRight size={18} className="ml-2" /></Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/categories">View Categories</Link>
            </Button>
          </div>
          <div className="mt-12 flex items-center gap-8">
            {[{ value: "50K+", label: "Happy Customers" }, { value: "4.9", label: "Average Rating" }, { value: "Free", label: "Global Shipping" }].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.2 }} className="relative hidden lg:block">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
            <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=900&fit=crop" alt="Premium lifestyle" className="w-full h-[600px] object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8 right-8">
              <div className="glass glass-border border rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Featured Product</div>
                    <div className="text-lg font-semibold text-foreground mt-1">AirPods Pro Max</div>
                  </div>
                  <Button size="icon" asChild>
                    <Link href="/shop/airpods-pro-max"><ArrowRight size={20} /></Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
