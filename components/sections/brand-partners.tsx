"use client";

import { motion } from "framer-motion";

const brands = [
  { name: "Apple", abbr: "AP" },
  { name: "Nike", abbr: "NK" },
  { name: "Sony", abbr: "SN" },
  { name: "Samsung", abbr: "SM" },
  { name: "Adidas", abbr: "AD" },
  { name: "Bose", abbr: "BO" },
  { name: "Dyson", abbr: "DY" },
  { name: "Lululemon", abbr: "LU" },
];

export function BrandPartners() {
  return (
    <section className="py-16 bg-accent/30 border-y">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <p className="text-center text-sm text-muted-foreground mb-8 uppercase tracking-wider">Trusted by leading brands</p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          {brands.map((brand, i) => (
            <motion.div key={brand.name} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="flex items-center gap-2 text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-xs font-bold">{brand.abbr}</div>
              <span className="font-semibold text-lg hidden sm:block">{brand.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
