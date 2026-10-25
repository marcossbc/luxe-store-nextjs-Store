"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProducts } from "@/lib/hooks/use-products";
import { usePremiumPrice } from "@/lib/luxe/use-premium-price";
import { matchesTerm } from "@/lib/luxe/mega-menu-data";

const MAX_LEN = 60;

/**
 * Real search: submits to /shop?q=... and offers live suggestions from the catalogue.
 * UX: autocomplete cuts typing effort (recognition over recall); the first suggestion needs 2 characters
 * (noise control); every state ends in an action ("See all results"), never a dead end.
 */
export function SearchBox({ autoFocus = false, onDone, className, variant = "default" }: { autoFocus?: boolean; onDone?: () => void; className?: string; variant?: "default" | "header" }) {
  const router = useRouter();
  const { products } = useProducts();
  const fmt = usePremiumPrice();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(-1);
  const wrap = useRef<HTMLDivElement>(null);

  const term = q.trim().slice(0, MAX_LEN);
  const results = useMemo(() => (term.length < 2 ? [] : products.filter((p) => matchesTerm(p, term)).slice(0, 5)), [term, products]);
  const showPanel = open && term.length >= 2;
  const allIndex = results.length; // the "See all results" row is the last option

  useEffect(() => {
    const onDown = (e: MouseEvent) => { if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const finish = () => { setOpen(false); setIdx(-1); onDone?.(); };
  const submit = () => { router.push(term ? `/shop?q=${encodeURIComponent(term)}` : "/shop"); finish(); };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" && showPanel) { e.preventDefault(); setIdx((i) => (i >= allIndex ? 0 : i + 1)); }
    else if (e.key === "ArrowUp" && showPanel) { e.preventDefault(); setIdx((i) => (i <= 0 ? allIndex : i - 1)); }
    else if (e.key === "Escape") { if (open) { setOpen(false); setIdx(-1); } else onDone?.(); }
    else if (e.key === "Enter") {
      e.preventDefault();
      if (showPanel && idx >= 0 && idx < results.length) { router.push(`/shop/${results[idx].slug}`); finish(); }
      else submit();
    }
  };

  return (
    <div ref={wrap} className={cn("relative", className)} onClick={(e) => e.stopPropagation()}>
      <form role="search" onSubmit={(e) => { e.preventDefault(); submit(); }} className="relative">
        <input
          type="search"
          value={q}
          maxLength={MAX_LEN}
          autoFocus={autoFocus}
          autoComplete="off"
          enterKeyHint="search"
          placeholder="Search products..."
          aria-label="Search products"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls="search-suggestions"
          aria-autocomplete="list"
          aria-activedescendant={showPanel && idx >= 0 ? `search-opt-${idx}` : undefined}
          onChange={(e) => { setQ(e.target.value); setOpen(true); setIdx(-1); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          className={cn(
            "w-full rounded-full text-sm outline-none transition-colors",
            variant === "header"
              ? "h-11 border-2 border-transparent bg-white pl-5 pr-14 text-neutral-900 placeholder:text-neutral-500 focus:border-[color:var(--mega-accent)]"
              : "h-11 border border-input bg-muted/40 pl-5 pr-14 placeholder:text-muted-foreground focus:border-foreground/40 focus:bg-background"
          )}
        />
        <button type="submit" aria-label="Search" className={cn("absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95", variant === "header" ? "bg-neutral-900 text-white" : "bg-foreground text-background")}>
          <Search size={16} />
        </button>
      </form>

      {showPanel && (
        <div id="search-suggestions" role="listbox" className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border bg-background text-foreground shadow-2xl">
          {results.length === 0 ? (
            <div className="px-4 py-4 text-sm text-muted-foreground">No pieces match “{term}”. Try a shorter word, or browse everything below.</div>
          ) : (
            results.map((p, i) => (
              <Link key={p.id} id={`search-opt-${i}`} role="option" aria-selected={idx === i} href={`/shop/${p.slug}`} onClick={finish}
                className={cn("flex items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-accent", idx === i && "bg-accent")}>
                <img src={p.images[0]} alt="" className="h-11 w-11 shrink-0 rounded-lg object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{p.name}</span>
                  <span className="text-xs text-muted-foreground">{p.categoryName}</span>
                </span>
                <span className="text-sm font-semibold tabular-nums">{fmt(p.price)}</span>
              </Link>
            ))
          )}
          <Link id={`search-opt-${allIndex}`} role="option" aria-selected={idx === allIndex} href={`/shop?q=${encodeURIComponent(term)}`} onClick={finish}
            className={cn("flex items-center justify-between border-t px-4 py-3 text-sm font-semibold hover:bg-accent", idx === allIndex && "bg-accent")}>
            See all results for “{term}” <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
