"use client";

import { BRAND } from "@/lib/brand";
import { motion } from "framer-motion";
import { Award, Users, Globe, TrendingUp } from "lucide-react";

const stats = [
  { icon: Users, value: "50,000+", label: "Happy Customers" },
  { icon: Award, value: "4.9", label: "Average Rating" },
  { icon: Globe, value: "120+", label: "Countries Shipped" },
  { icon: TrendingUp, value: "99%", label: "Satisfaction Rate" },
];

const values = [
  { title: "Quality First", desc: "We source only the finest materials and partner with artisans who share our commitment to excellence." },
  { title: "Sustainable Design", desc: "Every product is designed with longevity in mind, reducing waste and environmental impact." },
  { title: "Customer Obsession", desc: "Your satisfaction drives everything we do. We listen, adapt, and constantly improve." },
  { title: "Innovation", desc: "We blend timeless design with cutting-edge technology to create products that inspire." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6">Our Story</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Founded in 2020, {BRAND.name} Store began with a simple mission: to curate exceptional products that elevate everyday life. 
              We believe that quality, design, and sustainability should never be compromised.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 border-y bg-accent/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="inline-flex p-3 rounded-xl bg-background shadow-sm mb-4">
                  <stat.icon size={24} className="text-foreground" />
                </div>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Our Values</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">The principles that guide every decision we make.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, i) => (
              <motion.div key={value.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="p-8 rounded-2xl border bg-card">
                <h3 className="text-xl font-semibold text-foreground mb-3">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-accent/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Meet the Team</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">The passionate people behind {BRAND.name} Store.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Alex Chen", role: "Founder & CEO", initials: "AC" },
              { name: "Sarah Miller", role: "Head of Design", initials: "SM" },
              { name: "James Wilson", role: "CTO", initials: "JW" },
              { name: "Emily Park", role: "Head of Operations", initials: "EP" },
            ].map((person, i) => (
              <motion.div key={person.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center p-6">
                <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold mx-auto mb-4">
                  {person.initials}
                </div>
                <h3 className="font-semibold text-foreground">{person.name}</h3>
                <p className="text-sm text-muted-foreground">{person.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
