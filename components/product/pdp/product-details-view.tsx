"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Share2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/product/star-rating";
import { QuantitySelector } from "@/components/product/quantity-selector";
import { useCartContext } from "@/components/layout/cart-provider";
import { useWishlistContext } from "@/components/layout/wishlist-provider";
import { useToast } from "@/components/layout/toast-provider";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { GalleryPro } from "./gallery-pro";
import { VariantSelector, buildGroups, findVariant, type Selection } from "./variant-selector";
import { TrustBadges, StockIndicator } from "./trust-badges";
import { ProductAccordion } from "./product-accordion";

const stripHtml = (s: string) => s.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

export function ProductDetailsView({ product }: { product: Product }) {
  const variants = product.variants;
  const groups = useMemo(() => (variants?.length ? buildGroups(variants) : []), [variants]);

  // start on the first in-stock variant
  const [selection, setSelection] = useState<Selection>(() => {
    const first = variants?.find((v) => v.inStock) ?? variants?.[0];
    return first ? Object.fromEntries(groups.map((g) => [g.label, g.pick(first) ?? ""])) : {};
  });
  const [qty, setQty] = useState(1);

  const { addItem } = useCartContext();
  const { isWishlisted, toggleWishlist } = useWishlistContext();
  const { toast } = useToast();
  const wishlisted = isWishlisted(product.id);

  const variant = variants ? findVariant(variants, groups, selection) : undefined;
  const price = variant?.price ?? product.price;
  const originalPrice = variant?.price ? Math.max(product.originalPrice * (variant.price / product.price), variant.price) : product.originalPrice;
  const discount = calculateDiscount(originalPrice, price);
  const inStock = variant ? variant.inStock : product.inStock;
  const stock = variant?.stock ?? product.stockCount;

  const images = useMemo(() => {
    const extra = (variants ?? []).map((v) => v.image).filter(Boolean) as string[];
    return Array.from(new Set([...product.images, ...extra]));
  }, [product.images, variants]);

  const handleSelect = (label: string, value: string) => {
    setSelection((s) => {
      const next = { ...s, [label]: value };
      // if the combo doesn't exist / is sold out, snap other groups to the nearest in-stock variant
      if (variants && !findVariant(variants, groups, next)?.inStock) {
        const alt = variants.find((v) => v.inStock && groups.find((g) => g.label === label)?.pick(v) === value);
        if (alt) return Object.fromEntries(groups.map((g) => [g.label, g.pick(alt) ?? ""]));
      }
      return next;
    });
  };

  const handleAdd = () => {
    if (variants?.length && !variant) return toast("Please choose an option", "info");
    // each variant becomes its own cart line (and keeps its Shopify/CJ variant id for checkout)
    const item: Product = variant
      ? {
          ...product,
          id: `${product.id}__${variant.id}`,
          name: `${product.name} (${variant.title})`,
          price,
          originalPrice,
          variantId: variant.id,
          images: [variant.image ?? product.images[0], ...product.images],
          stockCount: stock || 99,
        }
      : product;
    addItem(item, qty);
    toast(`${item.name} added to cart`);
  };

  const description = stripHtml(product.description) || product.shortDescription;

  const accordion = [
    {
      id: "description",
      title: "Description",
      content: (
        <div className="space-y-4">
          <p>{description}</p>
          {product.features.length > 0 && (
            <ul className="space-y-2">
              {product.features.map((f) => (
                <li key={f} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" />{f}</li>
              ))}
            </ul>
          )}
          {Object.keys(product.specifications).length > 0 && (
            <div className="rounded-xl border divide-y">
              {Object.entries(product.specifications).map(([k, v]) => (
                <div key={k} className="flex justify-between px-4 py-2.5"><span>{k}</span><span className="font-medium text-foreground">{v}</span></div>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      id: "shipping",
      title: "Shipping Info",
      content: (
        <ul className="space-y-2 list-disc pl-5">
          <li>Orders are processed within 24-48 hours.</li>
          <li>Standard delivery usually takes 7-15 business days for dropshipped items; stocked items 3-5 days.</li>
          <li>Free shipping on orders over $100. You receive tracking as soon as your parcel ships.</li>
        </ul>
      ),
    },
    {
      id: "returns",
      title: "Return Policy",
      content: (
        <p>Not happy? Return unused items in original packaging within 30 days for a full refund. Items damaged in transit are replaced free of charge.</p>
      ),
    },
    {
      id: "reviews",
      title: `Reviews (${product.reviewCount})`,
      content: (
        <div className="flex items-center gap-3">
          <StarRating rating={product.rating} size={18} />
          <span>{product.rating.toFixed(1)} out of 5{product.reviewCount ? ` · ${product.reviewCount} reviews` : " · no reviews yet"}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
      <div className="lg:sticky lg:top-28 lg:self-start">
        <GalleryPro images={images} name={product.name} focusImage={variant?.image} />
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-4">
          <Badge variant={product.badge === "sale" ? "rose" : "blue"}>
            {product.badge ? product.badge.charAt(0).toUpperCase() + product.badge.slice(1) : "In Stock"}
          </Badge>
          <span className="text-xs uppercase tracking-wider text-muted-foreground">{product.categoryName}</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">{product.name}</h1>

        <div className="flex items-center gap-3 mb-5">
          <StarRating rating={product.rating} size={18} />
          <span className="text-sm text-muted-foreground">{product.rating.toFixed(1)} ({product.reviewCount})</span>
        </div>

        <div className="flex items-baseline gap-3 mb-6">
          <span className="text-3xl font-bold text-foreground">{formatPrice(price)}</span>
          {originalPrice > price && <span className="text-xl line-through text-muted-foreground">{formatPrice(originalPrice)}</span>}
          {discount > 0 && <Badge variant="rose">Save {discount}%</Badge>}
        </div>

        {variants && variants.length > 0 && (
          <div className="mb-6">
            <VariantSelector variants={variants} groups={groups} selection={selection} onChange={handleSelect} />
          </div>
        )}

        <div className="mb-6"><StockIndicator inStock={inStock} count={stock} /></div>

        <div className="p-5 rounded-3xl border bg-accent/40 mb-6">
          <div className="flex items-center gap-4 mb-5">
            <span className="text-sm font-medium text-foreground">Quantity</span>
            <QuantitySelector value={qty} onChange={setQty} max={Math.max(1, stock || 99)} />
          </div>
          <div className="flex gap-3">
            <Button className="flex-1" size="lg" disabled={!inStock} onClick={handleAdd}>
              <ShoppingBag size={18} />
              {inStock ? `Add to Cart · ${formatPrice(price * qty)}` : "Sold out"}
            </Button>
            <Button
              variant="outline" size="icon-lg" aria-label="Wishlist"
              className={wishlisted ? "text-rose-500 border-rose-300" : ""}
              onClick={() => { toggleWishlist(product.id); toast(wishlisted ? "Removed from wishlist" : "Added to wishlist"); }}
            >
              <Heart size={20} className={wishlisted ? "fill-rose-500" : ""} />
            </Button>
            <Button
              variant="outline" size="icon-lg" aria-label="Share"
              onClick={async () => {
                try {
                  if (navigator.share) await navigator.share({ title: product.name, url: window.location.href });
                  else { await navigator.clipboard.writeText(window.location.href); toast("Link copied", "info"); }
                } catch { /* cancelled */ }
              }}
            >
              <Share2 size={20} />
            </Button>
          </div>
        </div>

        <div className="mb-8"><TrustBadges /></div>
        <ProductAccordion items={accordion} />
      </motion.div>
    </div>
  );
}
