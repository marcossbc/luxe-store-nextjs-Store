"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Heart, Search, Menu, X, Sun, Moon, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThemeContext } from "@/components/layout/theme-provider";
import { useCartContext } from "@/components/layout/cart-provider";
import { useWishlistContext } from "@/components/layout/wishlist-provider";
import { cn } from "@/lib/utils";
import { MegaMenu, MobileCategories } from "@/components/layout/mega-menu";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Collection", href: "/collection" },
  {
    label: "Categories",
    href: "/categories",
    mega: true,
    items: [
      { label: "Electronics", href: "/shop?category=electronics", desc: "Tech essentials" },
      { label: "Fashion", href: "/shop?category=fashion", desc: "Style & apparel" },
      { label: "Home & Living", href: "/shop?category=home", desc: "Interior design" },
      { label: "Sports", href: "/shop?category=sports", desc: "Active lifestyle" },
      { label: "Accessories", href: "/shop?category=accessories", desc: "Finishing touches" },
      { label: "Beauty", href: "/shop?category=beauty", desc: "Self-care essentials" },
    ],
  },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const { theme, toggleTheme, mounted } = useThemeContext();
  const { totalItems } = useCartContext();
  const { count: wishlistCount } = useWishlistContext();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // (fixed) the scroll listener used to be re-added on every render, leaking listeners
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled ? "glass glass-border border-b shadow-sm" : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">L</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground hidden sm:block">LUXE</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) =>
                link.mega ? (
                  <MegaMenu key={link.label} label={link.label} />
                ) : (
                  <div key={link.label} className="relative">
                    <Link href={link.href} className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors rounded-lg hover:bg-accent">
                      {link.label}
                    </Link>
                  </div>
                )
              )}
            </nav>

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} className="hidden sm:flex">
                <Search size={20} />
              </Button>
              {mounted && (
                <Button variant="ghost" size="icon" onClick={toggleTheme}>
                  {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                </Button>
              )}
              <Link href="/wishlist">
                <Button variant="ghost" size="icon" className="relative">
                  <Heart size={20} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">{wishlistCount}</span>
                  )}
                </Button>
              </Link>
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingBag size={20} />
                  {totalItems > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">{totalItems}</span>
                  )}
                </Button>
              </Link>
              <Link href="/profile" className="hidden sm:block">
                <Button variant="ghost" size="icon"><User size={20} /></Button>
              </Link>
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
                <Menu size={20} />
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {searchOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-xl" onClick={() => setSearchOpen(false)}>
            <div className="max-w-2xl mx-auto px-6 pt-32">
              <div className="relative">
                <Search size={24} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="text" placeholder="Search products..." autoFocus className="w-full h-16 pl-14 pr-4 text-2xl bg-transparent border-b-2 border-border focus:border-primary outline-none placeholder:text-muted-foreground" />
                <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setSearchOpen(false)}>
                  <X size={20} />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/40" onClick={() => setMobileOpen(false)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed right-0 top-0 bottom-0 z-[70] flex w-full max-w-sm flex-col bg-background border-l shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b">
                <span className="text-lg font-bold">Menu</span>
                <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}><X size={20} /></Button>
              </div>
              <nav className="flex-1 overflow-y-auto overscroll-contain p-6 space-y-2">
                {navLinks.map((link) =>
                  link.mega ? (
                    <MobileCategories key={link.label} onNavigate={() => setMobileOpen(false)} />
                  ) : (
                    <Link key={link.label} href={link.href} onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-lg font-medium rounded-xl hover:bg-accent transition-colors">{link.label}</Link>
                  )
                )}
                <div className="pt-4 border-t mt-4 space-y-2">
                  <Link href="/login" onClick={() => setMobileOpen(false)}><Button variant="outline" className="w-full">Sign In</Button></Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)}><Button className="w-full">Create Account</Button></Link>
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
