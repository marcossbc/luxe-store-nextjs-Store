"use client";

import { BRAND } from "@/lib/brand";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Share2, ShoppingBag, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuantitySelector } from "@/components/product/quantity-selector";
import { StarRating } from "@/components/product/star-rating";
import { useCartContext } from "@/components/layout/cart-provider";
import { useWishlistContext } from "@/components/layout/wishlist-provider";
import { useToast } from "@/components/layout/toast-provider";
import { calculateDiscount } from "@/lib/utils";
import { accentFor } from "@/lib/luxe/helpers";
import { usePremiumPrice } from "@/lib/luxe/use-premium-price";
import { rememberProduct } from "@/lib/hooks/use-recently-viewed";
import type { Product } from "@/lib/types";
import { EditionTag, LiveInventory } from "@/components/luxe/edition-tags";
import { CraftsmanshipButton } from "@/components/luxe/video-lightbox";
import { GalleryPro } from "./gallery-pro";
import { LuxeVariantPills } from "./luxe-variant-pills";
import { ProductAccordion } from "./product-accordion";
import { TrustBadges } from "./trust-badges";
import { useVariantSelection } from "./use-variant-selection";

const stripHtml = (s: string) => s.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

export function LuxePDP({ product }: { product: Product }) {
  const v = useVariantSelection(product);
  const [qty, setQty] = useState(1);
  const fmt = usePremiumPrice();
  const { addItem } = useCartContext();
  const { isWishlisted, toggleWishlist } = useWishlistContext();
  const { toast } = useToast();
  const wishlisted = isWishlisted(product.id);
  const accent = accentFor(product.category + product.id.length);
  const discount = calculateDiscount(v.originalPrice, v.price);

  useEffect(() => { rememberProduct(product.slug); }, [product.slug]);

  const delivery = useMemo(() => {
    const [min, max] = product.source === "cj" ? [7, 15] : [3, 6];
    const f = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });
    const d = (n: number) => f.format(new Date(Date.now() + n * 864e5));
    return `${d(min)} - ${d(max)}`;
  }, [product.source]);

  const handleAdd = () => {
    const item = v.cartItem();
    if (!item) return toast("Please choose an option", "info");
    addItem(item, qty);
    toast(`${item.name} added to your bag`);
  };

  const description = stripHtml(product.description) || product.shortDescription;
  const specs: Record<string, string> = { SKU: product.sku, Category: product.categoryName, ...product.specifications };

  const accordion = [
    {
      id: "technical",
      title: "Technical Details",
      content: (
        <div className="space-y-4">
          <p>{description}</p>
          <div className="divide-y rounded-xl border">
            {Object.entries(specs).map(([k, val]) => (
              <div key={k} className="flex justify-between px-4 py-2.5"><span>{k}</span><span className="font-medium text-foreground">{val}</span></div>
            ))}
          </div>
          {product.features.length > 0 && <ul className="list-disc space-y-1 pl-5">{product.features.map((f) => <li key={f}>{f}</li>)}</ul>}
        </div>
      ),
    },
    { id: "craft", title: "Movement / Crafting", content: <p>Every piece is inspected by hand before it leaves our partner workshop. Finishing, stitching and assembly are checked against the product specification and photographed for your order record.</p> },
    {
      id: "delivery",
      title: "Delivery Timeline",
      content: (
        <ul className="space-y-2">
          <li><strong className="text-foreground">Estimated arrival:</strong> {delivery}</li>
          <li>Dispatch within 24-48 hours, with tracking sent to your email.</li>
          <li>Complimentary shipping on orders over {fmt(100)}.</li>
        </ul>
      ),
    },
    { id: "care", title: "Care & Maintenance", content: <p>Store in the original packaging away from direct heat and moisture. Clean with a soft, dry microfibre cloth; avoid abrasive or chemical cleaners. Follow any care label included with your item.</p> },
    { id: "warranty", title: "Product Warranty", content: <p>Covered by a 12-month limited warranty against manufacturing defects. Contact support with your order number and photos to start a claim.</p> },
    { id: "authenticity", title: "Guaranteed Authenticity", content: <p>Each order includes a {BRAND.name} order certificate. If an item is not as described, you are covered by our 30-day money-back guarantee.</p> },
  ];

  return (
    <div className="grid overflow-clip rounded-[2rem] border lg:grid-cols-[1.1fr_1fr]">
      {/* showcase panel (full-height accent, content sticks) */}
      <motion.div className="relative p-5 sm:p-8 lg:p-10" animate={{ backgroundColor: accent }} style={{ backgroundColor: accent }} transition={{ type: "spring", stiffness: 200, damping: 25 }}>
        <div className="lg:sticky lg:top-24">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-white">
            <EditionTag product={product} />
            <LiveInventory product={product} />
          </div>
          <GalleryPro images={v.images} name={product.name} focusImage={v.variant?.image} />
          <div className="mt-6 text-white"><CraftsmanshipButton title={product.name} product={product} /></div>
        </div>
      </motion.div>

      {/* buy box */}
      <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ type: "spring", stiffness: 200, damping: 25 }} className="bg-card p-6 sm:p-10">
        <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{product.categoryName}</div>
        <h1 className="display-title mt-2 text-5xl text-foreground sm:text-6xl">{product.name}</h1>
        <div className="mt-4 flex items-center gap-3">
          <StarRating rating={product.rating} size={16} />
          <span className="text-sm text-muted-foreground">{product.rating.toFixed(1)} ({product.reviewCount})</span>
        </div>

        <div className="mt-6 flex items-baseline gap-3 border-y py-5">
          <span className="font-display text-4xl font-bold tracking-wide text-foreground">{fmt(v.price)}</span>
          {v.originalPrice > v.price && <span className="text-lg text-muted-foreground line-through">{fmt(v.originalPrice)}</span>}
          {discount > 0 && <span className="rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-500">-{discount}%</span>}
        </div>

        {v.variants && v.variants.length > 0 && (
          <div className="mt-6"><LuxeVariantPills variants={v.variants} groups={v.groups} selection={v.selection} onChange={v.select} /></div>
        )}

        <div className="mt-6 flex items-center gap-4">
          <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Quantity</span>
          <QuantitySelector value={qty} onChange={setQty} max={Math.max(1, v.stock || 99)} />
        </div>

        <div className="mt-5 flex gap-3">
          <motion.div whileTap={{ scale: 0.96 }} className="flex-1">
            <Button size="lg" className="w-full rounded-none font-display text-lg font-bold uppercase tracking-[0.2em]" disabled={!v.inStock} onClick={handleAdd}>
              <ShoppingBag size={18} /> {v.inStock ? `Add to Bag · ${fmt(v.price * qty)}` : "Sold out"}
            </Button>
          </motion.div>
          <Button variant="outline" size="icon-lg" aria-label="Wishlist" className={wishlisted ? "border-rose-300 text-rose-500" : ""} onClick={() => { toggleWishlist(product.id); toast(wishlisted ? "Removed from your vault" : "Saved to your vault"); }}>
            <Heart size={20} className={wishlisted ? "fill-rose-500" : ""} />
          </Button>
          <Button variant="outline" size="icon-lg" aria-label="Share" onClick={async () => { try { if (navigator.share) await navigator.share({ title: product.name, url: location.href }); else { await navigator.clipboard.writeText(location.href); toast("Link copied", "info"); } } catch { /* cancelled */ } }}>
            <Share2 size={20} />
          </Button>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><Truck size={16} /> Estimated delivery {delivery}</div>

        <div className="mt-8"><TrustBadges /></div>
        <div className="mt-8"><ProductAccordion items={accordion} defaultOpen="technical" /></div>
      </motion.div>
    </div>
  );
}
