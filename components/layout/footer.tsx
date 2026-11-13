"use client";

import Link from "next/link";
import { Instagram, Twitter, Facebook, Linkedin, Music2, ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { BRAND } from "@/lib/brand";

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
  { icon: Music2, href: "#", label: "TikTok" }
];

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="py-16 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="mb-4 inline-block text-foreground" aria-label={`${BRAND.name} home`}>
              <Logo size="md" tagline />
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">Curatings exceptionals products for those who demand quality, design, and craftsmanship.</p>
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
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} {BRAND.name} Store. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="text-sm text-muted-foreground">Secure Payment</span>
            <div className="flex gap-2">
              {[
                {
                  label: "Visa",
                  mark: (
                    <svg viewBox="0 0 48 30" className="h-full w-full" role="img" aria-label="Visa">
                      <text x="24" y="20" textAnchor="middle" fill="#1a1f71" fontSize="16" fontWeight="700" fontStyle="italic">VISA</text>
                    </svg>
                  ),
                },
                {
                  label: "Mastercard",
                  mark: (
                    <svg viewBox="0 0 48 30" className="h-full w-full" role="img" aria-label="Mastercard">
                      <circle cx="20" cy="15" r="9" fill="#eb001b" />
                      <circle cx="28" cy="15" r="9" fill="#f79e1b" fillOpacity=".9" />
                    </svg>
                  ),
                },
                {
                  label: "American Express",
                  mark: (
                    <svg viewBox="0 0 48 30" className="h-full w-full" role="img" aria-label="American Express">
                      <rect width="48" height="30" rx="3" fill="#2e77bc" />
                      <text x="24" y="18" textAnchor="middle" fill="white" fontSize="7" fontWeight="700">AMEX</text>
                    </svg>
                  ),
                },
                {
                  label: "PayPal",
                  mark: (
                    <svg viewBox="0 0 48 30" className="h-full w-full" role="img" aria-label="PayPal">
                      <text x="24" y="20" textAnchor="middle" fill="#003087" fontSize="12" fontWeight="700" fontStyle="italic">PayPal</text>
                    </svg>
                  ),
                },
              ].map((card) => (
                <div key={card.label} className="w-10 h-6 rounded bg-white p-0.5 flex items-center justify-center">
                  {card.mark}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
