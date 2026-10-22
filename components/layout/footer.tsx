"use client";

import Link from "next/link";
import { Instagram, Twitter, Facebook, Linkedin, ArrowUpRight } from "lucide-react";

const footerLinks = {
  shop: [
    { label: "All Products", href: "/shop" },
    { label: "New Arrivals", href: "/shop?sort=newest" },
    { label: "Best Sellers", href: "/shop?sort=bestselling" },
    { label: "Sale", href: "/shop?badge=sale" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
    { label: "Sustainability", href: "#" },
  ],
  support: [
    { label: "Contact Us", href: "/contact" },
    { label: "FAQs", href: "#" },
    { label: "Shipping", href: "#" },
    { label: "Returns", href: "#" },
  ],
  legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
};

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
];

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="py-16 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">L</span>
              </div>
              <span className="text-xl font-bold tracking-tight">LUXE SHOP</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">Curating exceptional products for those who demand quality, design, and craftsmanship.</p>
            <div className="flex gap-3 mt-6">
              {socialLinks.map((social) => (
                <a key={social.label} href={social.href} className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-colors" aria-label={social.label}>
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-semibold text-foreground mb-4 capitalize">{title}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group">
                      {link.label}
                      <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="py-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Luxe Store. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="text-sm text-muted-foreground">Secure Payment</span>
            <div className="flex gap-2">
              {["Visa", "MC", "Amex", "PayPal"].map((card) => (
                <div key={card} className="w-10 h-6 rounded bg-accent flex items-center justify-center text-[8px] font-bold text-muted-foreground">{card}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
