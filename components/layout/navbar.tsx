"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Facebook, Globe, Headphones, Heart, Instagram, MapPin, Menu, Moon, Phone, Search, ShoppingCart, Sun, Truck, Twitter, User, X, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThemeContext } from "@/components/layout/theme-provider";
import { useCartContext } from "@/components/layout/cart-provider";
import { useWishlistContext } from "@/components/layout/wishlist-provider";
import { MegaMenu, MobileCategories } from "@/components/layout/mega-menu";
import { HeaderDropdown } from "@/components/layout/header-dropdown";
import { SearchBox } from "@/components/layout/search-box";
import { getSocialLinks, getSupportPhone } from "@/lib/luxe/nav-config";
import { usePremiumPrice } from "@/lib/luxe/use-premium-price";
import { cn } from "@/lib/utils";

// Quick links shown in the second row. Every href is a real, working route/filter.
const quickLinks = [
  { label: "Bestsellers", href: "/shop?sort=bestselling" },
  { label: "New Arrivals", href: "/shop?sort=newest" },
  { label: "Collection", href: "/collection" },
  { label: "Home & Living", href: "/shop?category=home" },
  { label: "Electronics", href: "/shop?category=electronics" },
];
const moreLinks = [
  { label: "Shop all", href: "/shop", icon: Search },
  { label: "About Luxe", href: "/about", icon: User },
  { label: "Track Order", href: "/profile", icon: MapPin },
  { label: "Customer Support", href: "/contact", icon: Headphones },
];
const SOCIAL_ICONS: Record<string, typeof Facebook> = { Facebook, Instagram, X: Twitter, YouTube: Youtube };

// Sticky behaviour (all tunable):
const HIDE_SUBNAV_AFTER = 260; // px scrolled before the category row may auto-hide
const DIRECTION_THRESHOLD = 6; // ignore tiny scroll jitters

const iconBtn = "relative flex h-10 w-10 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10 hover:text-white";
const badge = "absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[color:var(--mega-accent)] px-1 text-[10px] font-bold tabular-nums text-white";

export function Navbar() {
  const { theme, toggleTheme, mounted } = useThemeContext();
  const { totalItems } = useCartContext();
  const { count: wishlistCount } = useWishlistContext();
  const fmt = usePremiumPrice();
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const lastY = useRef(0);

  const [scrolled, setScrolled] = useState(false);
  const [subHidden, setSubHidden] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [focusIn, setFocusIn] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const social = useMemo(() => getSocialLinks(), []);
  const phone = useMemo(() => getSupportPhone(), []);
  const currency = process.env.NEXT_PUBLIC_STORE_CURRENCY || "USD";

  // Smart sticky: the top row (logo, search, account, cart) never leaves; the category row tucks away while
  // reading downwards and returns the moment the visitor scrolls up (or opens a menu / tabs into it).
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      const dy = y - lastY.current;
      if (Math.abs(dy) > DIRECTION_THRESHOLD) {
        if (y > HIDE_SUBNAV_AFTER && dy > 0) setSubHidden(true);
        else if (dy < 0 || y <= HIDE_SUBNAV_AFTER) setSubHidden(false);
        lastY.current = y;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // publish the live header height so the mega menu (and anything else) can sit exactly below it
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const set = () => document.documentElement.style.setProperty("--header-h", `${el.offsetHeight}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => { ro.disconnect(); document.documentElement.style.removeProperty("--header-h"); };
  }, []);

  useEffect(() => { setMobileOpen(false); setSearchOpen(false); }, [pathname]);

  const hideSub = subHidden && !megaOpen && !moreOpen && !focusIn;
  const isActive = (href: string) => !href.includes("?") && (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/"));

  return (
    <>
      <motion.header
        ref={headerRef}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={cn("fixed left-0 right-0 top-0 z-50 bg-[#111114] text-white transition-shadow duration-300", scrolled && "shadow-lg shadow-black/30")}
      >
        {/* row 1: logo · search · account · cart (always visible) */}
        <div className={cn("mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 transition-[height] duration-300 sm:px-6 lg:gap-6", scrolled ? "lg:h-16" : "lg:h-[4.5rem]")}>
          <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Luxe home">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white"><span className="text-sm font-bold text-neutral-900">L</span></div>
            <span className="hidden text-xl font-bold tracking-tight text-white sm:block">LUXE</span>
          </Link>

          <SearchBox variant="header" className="mx-auto hidden w-full max-w-3xl flex-1 md:block" />

          <div className="ml-auto flex items-center gap-1 md:ml-0">
            {/* informational only (one store currency, English): deliberately not a fake dropdown */}
            <div className="mr-1 hidden items-center gap-1.5 text-xs text-white/70 xl:flex" title={`Prices are shown in ${currency}`}>
              <Globe size={15} /> EN / {currency}
            </div>

            <button type="button" aria-label="Open search" onClick={() => setSearchOpen(true)} className={cn(iconBtn, "md:hidden")}><Search size={20} /></button>

            <div className="hidden lg:block">
              <HeaderDropdown
                id="account-menu"
                label="Account menu"
                align="right"
                width={300}
                triggerClassName="flex items-center gap-2 rounded-full py-1.5 pl-2 pr-3 text-left text-white transition-colors hover:bg-white/10"
                trigger={(open) => (
                  <>
                    <User size={22} />
                    <span className="hidden leading-tight xl:block">
                      <span className="block text-[11px] text-white/60">Welcome</span>
                      <span className="block text-sm font-semibold">Sign in / Register</span>
                    </span>
                    <ChevronDown size={14} className={cn("hidden text-white/60 transition-transform xl:block", open && "rotate-180")} />
                  </>
                )}
              >
                {(close) => (
                  <div className="p-4">
                    <div className="flex gap-2">
                      <Link href="/register" onClick={close} className="flex h-10 flex-1 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background transition-opacity hover:opacity-90">Register</Link>
                      <Link href="/login" onClick={close} className="flex h-10 flex-1 items-center justify-center rounded-full border text-sm font-semibold transition-colors hover:bg-accent">Sign in</Link>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">Create an account to save your wishlist and follow your orders.</p>
                    <div className="mt-3 border-t pt-2">
                      {[{ l: "My orders", h: "/profile", I: MapPin }, { l: "Wishlist", h: "/wishlist", I: Heart }, { l: "Customer support", h: "/contact", I: Headphones }].map(({ l, h, I }) => (
                        <Link key={h} href={h} onClick={close} className="flex h-10 items-center gap-3 rounded-lg px-2 text-sm hover:bg-accent"><I size={16} className="text-muted-foreground" /> {l}</Link>
                      ))}
                    </div>
                  </div>
                )}
              </HeaderDropdown>
            </div>
            <Link href="/profile" aria-label="Account" className={cn(iconBtn, "hidden sm:flex lg:hidden")}><User size={20} /></Link>

            <Link href="/wishlist" aria-label={`Wishlist${wishlistCount ? `, ${wishlistCount} items` : ""}`} className={iconBtn}>
              <Heart size={20} />
              {wishlistCount > 0 && <span className={badge}>{wishlistCount > 99 ? "99+" : wishlistCount}</span>}
            </Link>

            <Link href="/cart" aria-label={`Cart${totalItems ? `, ${totalItems} items` : ""}`} className="relative flex h-10 items-center gap-2 rounded-full px-2.5 text-white/90 transition-colors hover:bg-white/10 hover:text-white">
              <span className="relative"><ShoppingCart size={21} />{totalItems > 0 && <span className={badge}>{totalItems > 99 ? "99+" : totalItems}</span>}</span>
              <span className="hidden text-sm font-semibold lg:block">Cart</span>
            </Link>

            {mounted && (
              <button type="button" onClick={toggleTheme} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"} className={iconBtn}>
                {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
              </button>
            )}
            <button type="button" aria-label="Open menu" className={cn(iconBtn, "lg:hidden")} onClick={() => setMobileOpen(true)}><Menu size={22} /></button>
          </div>
        </div>

        {/* row 2: All Categories + quick links + More (desktop) */}
        <div
          className={cn("hidden grid-rows-[1fr] transition-[grid-template-rows,opacity] duration-300 lg:grid", hideSub && "grid-rows-[0fr] opacity-0")}
          onFocusCapture={() => setFocusIn(true)}
          onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocusIn(false); }}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="border-t border-white/10">
              <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
                <nav aria-label="Primary" className="flex items-center gap-1">
                  <MegaMenu label="All Categories" variant="pill" onOpenChange={setMegaOpen} />
                  <div className="ml-3 flex items-center">
                    {quickLinks.map((l) => (
                      <Link key={l.label} href={l.href} aria-current={isActive(l.href) ? "page" : undefined}
                        className={cn("relative rounded-md px-3.5 py-2 text-sm font-medium transition-colors hover:text-white", isActive(l.href) ? "text-white" : "text-white/75")}>
                        {l.label}
                        {isActive(l.href) && <span className="absolute inset-x-3.5 -bottom-1 h-0.5 rounded-full bg-[color:var(--mega-accent)]" />}
                      </Link>
                    ))}
                    <HeaderDropdown
                      id="more-menu"
                      label="More links"
                      width={260}
                      onOpenChange={setMoreOpen}
                      triggerClassName="flex items-center gap-1 rounded-md px-3.5 py-2 text-sm font-medium text-white/75 transition-colors hover:text-white"
                      trigger={(open) => (<>More <ChevronDown size={14} className={cn("transition-transform", open && "rotate-180")} /></>)}
                    >
                      {(close) => (
                        <div className="p-2">
                          {moreLinks.map(({ label, href, icon: Icon }) => (
                            <Link key={label} href={href} onClick={close} className="flex h-10 items-center gap-3 rounded-lg px-3 text-sm hover:bg-accent"><Icon size={16} className="text-muted-foreground" /> {label}</Link>
                          ))}
                          {social.length > 0 && (
                            <div className="mt-1 flex items-center gap-3 border-t px-3 pt-3 pb-1 text-muted-foreground">
                              <span className="text-xs">Follow us</span>
                              {social.map((s) => { const Icon = SOCIAL_ICONS[s.label]; return <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="hover:text-foreground"><Icon size={16} /></a>; })}
                            </div>
                          )}
                        </div>
                      )}
                    </HeaderDropdown>
                  </div>
                </nav>
                {phone ? (
                  <a href={`tel:${phone.replace(/[^+\d]/g, "")}`} className="flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white"><Phone size={15} /> {phone}</a>
                ) : (
                  <span className="flex items-center gap-2 text-sm text-white/60"><Truck size={15} /> Free shipping over {fmt(100)}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* mobile / tablet search */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-xl" onClick={() => setSearchOpen(false)}>
            <div className="mx-auto max-w-2xl px-4 pt-6">
              <div className="flex items-center gap-2">
                <SearchBox autoFocus onDone={() => setSearchOpen(false)} className="flex-1" />
                <Button variant="ghost" size="icon" aria-label="Close search" onClick={() => setSearchOpen(false)}><X size={20} /></Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/40" onClick={() => setMobileOpen(false)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed bottom-0 right-0 top-0 z-[70] flex w-full max-w-sm flex-col border-l bg-background text-foreground shadow-2xl">
              <div className="flex items-center justify-between border-b p-6">
                <span className="text-lg font-bold">Menu</span>
                <Button variant="ghost" size="icon" aria-label="Close menu" onClick={() => setMobileOpen(false)}><X size={20} /></Button>
              </div>
              <nav className="flex-1 space-y-2 overflow-y-auto overscroll-contain p-6">
                {[{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, { label: "Collection", href: "/collection" }].map((l) => (
                  <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="block rounded-xl px-4 py-3 text-lg font-medium transition-colors hover:bg-accent">{l.label}</Link>
                ))}
                <MobileCategories onNavigate={() => setMobileOpen(false)} />
                {[{ label: "Bestsellers", href: "/shop?sort=bestselling" }, { label: "New Arrivals", href: "/shop?sort=newest" }, { label: "About", href: "/about" }].map((l) => (
                  <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="block rounded-xl px-4 py-3 text-lg font-medium transition-colors hover:bg-accent">{l.label}</Link>
                ))}
                {moreLinks.slice(2).map(({ label, href, icon: Icon }) => (
                  <Link key={label} href={href} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-lg font-medium transition-colors hover:bg-accent"><Icon size={18} /> {label}</Link>
                ))}
                <div className="mt-4 space-y-2 border-t pt-4">
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
