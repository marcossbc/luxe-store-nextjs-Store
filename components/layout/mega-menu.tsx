"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlignJustify, ArrowRight, ChevronDown, Dumbbell, Flame, Gem, Home, LayoutGrid, RotateCcw, ShieldCheck, Shirt, Sparkles, Truck, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { StarRating } from "@/components/product/star-rating";
import { useProducts } from "@/lib/hooks/use-products";
import { usePremiumPrice } from "@/lib/luxe/use-premium-price";
import { buildMenu, type BuiltCategory } from "@/lib/luxe/mega-menu-data";

const ICONS = { Zap, Shirt, Home, Dumbbell, Gem, Sparkles } as const;
const SPRING = { type: "spring", stiffness: 260, damping: 28 } as const;
const OPEN_DELAY = 110;  // hover intent: ignore a mouse that is only passing over the trigger
const CLOSE_DELAY = 260; // grace period: lets the pointer travel diagonally to the panel without it closing
const accent = "text-[color:var(--mega-accent)]";

/**
 * UX psychology applied here:
 *  - Hover intent + grace period (forgiving interaction)          - Fitts's law: 40px+ rows, full-width hit areas
 *  - Hick's/Miller's law: 6 categories, <=3 groups, <=6 links      - Recognition over recall: icons + live counts
 *  - Information scent: links only exist when they have products   - Serial position: Best sellers first, Shop all last
 *  - Von Restorff + anchoring: one highlighted "Editor's pick" with the real was/now price
 *  - Risk reversal / loss aversion: shipping + returns + secure checkout in the footer strip
 *  - Focus effect: the page dims behind the menu                  - Truthful badges ("New"/"Sale") from real data only
 */
export function MegaMenu({ label, variant = "link", onOpenChange }: { label: string; variant?: "link" | "category" | "pill"; onOpenChange?: (open: boolean) => void }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [caretX, setCaretX] = useState<number | null>(null);
  const [focusFirst, setFocusFirst] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);
  useEffect(() => { onOpenChange?.(open); }, [open, onOpenChange]);
  useEffect(() => { clearTimeout(openTimer.current); setOpen(false); }, [pathname]);

  const measure = useCallback(() => {
    const r = triggerRef.current?.getBoundingClientRect();
    if (r) setCaretX(r.left + r.width / 2);
  }, []);

  const scheduleOpen = () => {
    clearTimeout(closeTimer.current);
    if (open) return;
    openTimer.current = setTimeout(() => { measure(); setFocusFirst(false); setOpen(true); }, OPEN_DELAY);
  };
  const scheduleClose = () => {
    clearTimeout(openTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY);
  };
  const keepOpen = () => clearTimeout(closeTimer.current);
  // every explicit close cancels pending timers, otherwise a queued hover-open can re-open the menu right after Esc/click
  const closeNow = useCallback(() => {
    clearTimeout(openTimer.current);
    clearTimeout(closeTimer.current);
    setOpen(false);
  }, []);
  useEffect(() => () => { clearTimeout(openTimer.current); clearTimeout(closeTimer.current); }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { closeNow(); triggerRef.current?.focus(); } };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", measure);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("resize", measure); };
  }, [open, measure, closeNow]);

  return (
    <div onMouseEnter={scheduleOpen} onMouseLeave={scheduleClose} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="mega-panel"
        onClick={(e) => { clearTimeout(openTimer.current); clearTimeout(closeTimer.current); measure(); setFocusFirst(e.detail === 0); setOpen((o) => !o); }}
        onKeyDown={(e) => { if (e.key === "ArrowDown") { e.preventDefault(); measure(); setFocusFirst(true); setOpen(true); } }}
        className={cn(
          "flex items-center transition-colors",
          variant === "pill"
            ? "h-10 gap-2.5 rounded-full border border-white/30 px-5 text-sm font-medium text-white hover:bg-white/10"
            : variant === "category"
              ? "h-9 gap-2 rounded-md border bg-accent/60 px-4 text-sm font-semibold text-foreground hover:bg-accent"
              : "gap-1 rounded-lg px-4 py-2 text-sm font-medium hover:bg-accent hover:text-foreground",
          variant === "link" && (open ? "bg-accent text-foreground" : "text-foreground/80"),
          variant === "category" && open && "bg-accent",
          variant === "pill" && open && "bg-white/10"
        )}
      >
        {variant === "category" && <LayoutGrid size={16} />}
        {variant === "pill" && <AlignJustify size={16} />}
        {label}
        <ChevronDown size={14} className={cn("transition-transform duration-300", open && "rotate-180")} />
      </button>

      {mounted && createPortal(
        // AnimatePresence needs keyed DIRECT children (a Fragment would stop the exit animation from ever completing)
        <AnimatePresence>
          {open && <motion.div key="backdrop" className="fixed inset-x-0 bottom-0 top-[var(--header-h,4rem)] z-40 bg-black/50 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeNow} aria-hidden />}
          {open && <MegaPanel key="panel" caretX={caretX} focusFirst={focusFirst} onEnter={keepOpen} onLeave={scheduleClose} onNavigate={closeNow} />}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

function MegaPanel({ caretX, focusFirst, onEnter, onLeave, onNavigate }: { caretX: number | null; focusFirst: boolean; onEnter: () => void; onLeave: () => void; onNavigate: () => void }) {
  const { products, loading } = useProducts();
  const reduce = useReducedMotion();
  const fmt = usePremiumPrice();
  const menu = useMemo(() => buildMenu(products), [products]);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const active: BuiltCategory | undefined = menu.find((c) => c.slug === activeSlug) ?? menu.find((c) => c.count > 0) ?? menu[0];

  useEffect(() => { if (focusFirst && !loading) tabs.current[0]?.focus(); }, [focusFirst, loading]);
  useEffect(() => () => clearTimeout(hoverTimer.current), []);

  const onTabKey = (e: React.KeyboardEvent, i: number) => {
    const n = menu.length;
    const to = e.key === "ArrowDown" ? (i + 1) % n : e.key === "ArrowUp" ? (i - 1 + n) % n : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : -1;
    if (to >= 0) { e.preventDefault(); tabs.current[to]?.focus(); }
  };

  return (
    <motion.div
      id="mega-panel"
      role="region"
      aria-label={`${active?.name ?? "Categories"} menu`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="mega-panel fixed inset-x-0 top-[var(--header-h,4rem)] z-[45] border-b bg-background text-foreground shadow-2xl"
    >
      {caretX !== null && <span aria-hidden className="absolute -top-[7px] h-3.5 w-3.5 rotate-45 border-l border-t bg-background" style={{ left: caretX - 7 }} />}

      <div className="mx-auto grid max-w-7xl lg:grid-cols-[240px_minmax(0,1fr)_300px]">
        {/* category rail: recognition over recall */}
        <div role="tablist" aria-orientation="vertical" aria-label="Categories" className="border-r bg-muted/30 p-3">
          {loading ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="shimmer mb-2 h-12 rounded-xl" />) : menu.map((c, i) => {
            const Icon = ICONS[c.icon];
            const isActive = c.slug === active?.slug;
            return (
              <button
                key={c.slug}
                ref={(el) => { tabs.current[i] = el; }}
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                onMouseEnter={() => { clearTimeout(hoverTimer.current); hoverTimer.current = setTimeout(() => setActiveSlug(c.slug), 70); }}
                onFocus={() => setActiveSlug(c.slug)}
                onClick={() => setActiveSlug(c.slug)}
                onKeyDown={(e) => onTabKey(e, i)}
                className={cn("relative mb-1 flex h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-sm transition-colors", isActive ? "bg-accent font-semibold text-foreground" : "text-muted-foreground hover:text-foreground")}
              >
                {/* plain element (not a shared layoutId): shared-layout nodes can stall the panel's exit animation */}
                {isActive && <span aria-hidden className="absolute inset-y-2 left-0 w-1 rounded-full bg-[color:var(--mega-accent)]" />}
                <Icon size={18} className={isActive ? accent : ""} />
                <span className="flex-1">{c.name}</span>
                <span className="text-xs tabular-nums opacity-60">{c.count}</span>
              </button>
            );
          })}
          <Link href="/categories" onClick={onNavigate} className="mt-2 flex h-10 items-center gap-1 px-3 text-xs font-medium uppercase tracking-widest text-muted-foreground hover:text-foreground">
            All categories <ArrowRight size={12} />
          </Link>
        </div>

        {/* groups */}
        <div role="tabpanel" className="min-h-[360px] p-6 lg:p-8">
          {loading || !active ? (
            <div className="grid grid-cols-3 gap-6">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="space-y-3">{Array.from({ length: 5 }).map((__, j) => <div key={j} className="shimmer h-8 rounded-lg" />)}</div>)}</div>
          ) : (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={active.slug} initial={reduce ? { opacity: 0 } : { opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h3 className={cn("display-title text-4xl", accent)}>{active.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{active.tagline} · {active.count} {active.count === 1 ? "piece" : "pieces"}</p>
                  </div>
                  {active.pinned.length > 0 && (
                    <div className="flex gap-2">
                      {active.pinned.map((p) => (
                        <Link key={p.label} href={p.href} onClick={onNavigate} className="inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition-colors hover:bg-foreground hover:text-background">
                          {p.kind === "hot" ? <Flame size={13} className={accent} /> : <Sparkles size={13} className={accent} />}
                          {p.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 xl:grid-cols-3">
                  {active.groups.slice(0, 3).map((g) => (
                    <div key={g.title}>
                      <div className={cn("mb-2 border-b pb-2 text-[11px] font-bold uppercase tracking-[0.18em]", accent)}>{g.title}</div>
                      <ul>
                        {g.links.map((l) => (
                          <li key={l.href}>
                            <Link href={l.href} onClick={onNavigate} className="group -mx-3 flex h-10 items-center justify-between rounded-lg px-3 text-sm text-foreground/85 transition-colors hover:bg-accent hover:text-foreground">
                              <span className="transition-transform group-hover:translate-x-0.5">{l.label}</span>
                              <span className="flex items-center gap-2">
                                {l.badge && <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", l.badge === "Sale" ? "bg-rose-500/15 text-rose-500" : "bg-emerald-500/15 text-emerald-500")}>{l.badge}</span>}
                                <span className="text-xs tabular-nums text-muted-foreground">{l.count}</span>
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  {/* sparse catalogue? fill the row with real, popular pieces so the menu never looks empty */}
                  {active.groups.length < 3 && active.popular.length > 0 && (
                    <div>
                      <div className={cn("mb-2 border-b pb-2 text-[11px] font-bold uppercase tracking-[0.18em]", accent)}>Popular right now</div>
                      <ul>
                        {active.popular.map((p) => (
                          <li key={p.id}>
                            <Link href={`/shop/${p.slug}`} onClick={onNavigate} className="group -mx-3 flex items-center gap-3 rounded-lg px-3 py-1.5 hover:bg-accent">
                              <img src={p.images[0]} alt="" className="h-10 w-10 shrink-0 rounded-md object-cover" />
                              <span className="min-w-0 flex-1"><span className="block truncate text-sm">{p.name}</span><span className="text-xs text-muted-foreground">{fmt(p.price)}</span></span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {active.groups.length === 0 && active.popular.length === 0 && (
                  <p className="py-6 text-sm text-muted-foreground">New pieces are arriving soon. Be the first to see them.</p>
                )}

                <Link href={active.href} onClick={onNavigate} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-[color:var(--mega-accent)]">
                  Shop all {active.name} <ArrowRight size={16} />
                </Link>
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* featured: one clearly highlighted choice, with a real was/now price */}
        <div className="hidden border-l bg-muted/30 p-6 lg:block">
          {active?.featured ? (
            <Link href={`/shop/${active.featured.slug}`} onClick={onNavigate} className="group block">
              <div className={cn("mb-3 text-[11px] font-bold uppercase tracking-[0.2em]", accent)}>Editor&apos;s pick</div>
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
                <img src={active.featured.images[0]} alt={active.featured.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <div className="line-clamp-2 text-base font-semibold leading-tight">{active.featured.name}</div>
                  <div className="mt-1 flex items-center gap-2"><StarRating rating={active.featured.rating} size={12} /><span className="text-xs text-white/70">{active.featured.rating.toFixed(1)}</span></div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-lg font-bold">{fmt(active.featured.price)}</span>
                    {active.featured.originalPrice > active.featured.price && <span className="text-sm text-white/60 line-through">{fmt(active.featured.originalPrice)}</span>}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-sm font-semibold">View piece <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></div>
            </Link>
          ) : active ? (
            <Link href={active.href} onClick={onNavigate} className="flex h-full min-h-[280px] flex-col justify-end rounded-2xl border p-5 hover:bg-accent">
              <div className={cn("display-title text-3xl", accent)}>{active.name}</div>
              <div className="mt-1 text-sm text-muted-foreground">Explore the collection</div>
            </Link>
          ) : null}
        </div>
      </div>

      {/* risk-reversal strip + closing call to action (peak-end) */}
      <div className="border-t bg-muted/20">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-8 gap-y-2 px-6 py-3 text-xs text-muted-foreground lg:px-8">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
            <span className="flex items-center gap-1.5"><Truck size={14} /> Free shipping over {fmt(100)}</span>
            <span className="flex items-center gap-1.5"><RotateCcw size={14} /> 30-day returns</span>
            <span className="flex items-center gap-1.5"><ShieldCheck size={14} /> Secure checkout</span>
          </div>
          {active && <Link href={active.href} onClick={onNavigate} className="font-semibold text-foreground hover:text-[color:var(--mega-accent)]">Shop all {active.name} →</Link>}
        </div>
      </div>
    </motion.div>
  );
}

/** Mobile drawer version: progressive disclosure accordion with the same live data. */
export function MobileCategories({ onNavigate }: { onNavigate: () => void }) {
  const { products } = useProducts();
  const menu = useMemo(() => buildMenu(products), [products]);
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  return (
    <div>
      <div className="px-4 py-3 text-lg font-medium">Categories</div>
      <div className="space-y-1 pb-2">
        {menu.map((c) => {
          const Icon = ICONS[c.icon];
          const isOpen = openSlug === c.slug;
          return (
            <div key={c.slug}>
              <button type="button" aria-expanded={isOpen} onClick={() => setOpenSlug(isOpen ? null : c.slug)} className="flex h-12 w-full items-center gap-3 rounded-xl px-4 text-left hover:bg-accent">
                <Icon size={18} className={accent} /><span className="flex-1 font-medium">{c.name}</span><span className="text-xs text-muted-foreground">{c.count}</span>
                <ChevronDown size={16} className={cn("transition-transform", isOpen && "rotate-180")} />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="space-y-1 pb-3 pl-12 pr-4">
                      {c.pinned.map((p) => <Link key={p.label} href={p.href} onClick={onNavigate} className="block py-2 text-sm font-semibold">{p.label}</Link>)}
                      {c.groups.flatMap((g) => g.links).map((l) => (
                        <Link key={l.href} href={l.href} onClick={onNavigate} className="flex items-center justify-between py-2 text-sm text-muted-foreground hover:text-foreground"><span>{l.label}</span><span className="text-xs">{l.count}</span></Link>
                      ))}
                      <Link href={c.href} onClick={onNavigate} className={cn("block py-2 text-sm font-semibold", accent)}>Shop all {c.name} →</Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
