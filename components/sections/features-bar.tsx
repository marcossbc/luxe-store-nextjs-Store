"use client";

import { motion } from "framer-motion";
import { Truck, Shield, RotateCcw, CreditCard } from "lucide-react";

const features = [
  { icon: Truck, title: "Free Shipping", desc: "On all orders over $100" },
  { icon: Shield, title: "2-Year Warranty", desc: "Full coverage on all products" },
  { icon: RotateCcw, title: "30-Day Returns", desc: "No questions asked policy" },
  { icon: CreditCard, title: "Secure Payment", desc: "256-bit SSL encryption" },
];

export function FeaturesBar() {
  return (
    <section className="py-16 bg-background border-y">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center p-6 rounded-2xl bg-accent/50 border">
              <div className="inline-flex p-3 rounded-xl bg-background shadow-sm mb-4">
                <f.icon size={24} className="text-foreground" />
              </div>
              <h3 className="font-semibold text-foreground">{f.title}</h3>
              <p className="text-sm mt-1 text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
