"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Share2, Truck, Shield, RotateCcw, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "./star-rating";
import { QuantitySelector } from "./quantity-selector";
import { useCartContext } from "@/components/layout/cart-provider";
import { useWishlistContext } from "@/components/layout/wishlist-provider";
import { useToast } from "@/components/layout/toast-provider";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface ProductInfoProps {
  product: Product;
}

const features = [
  { icon: Truck, title: "Free Shipping", desc: "On orders over $100" },
  { icon: Shield, title: "2-Year Warranty", desc: "Full coverage" },
  { icon: RotateCcw, title: "30-Day Returns", desc: "No questions asked" },
  { icon: CreditCard, title: "Secure Payment", desc: "256-bit SSL" },
];

export function ProductInfo({ product }: ProductInfoProps) {
  const [qty, setQty] = useState(1);
  const { addItem } = useCartContext();
  const { isWishlisted, toggleWishlist } = useWishlistContext();
  const { toast } = useToast();
  const wishlisted = isWishlisted(product.id);
  const discount = calculateDiscount(product.originalPrice, product.price);

  const handleAddToCart = () => {
    addItem(product, qty);
    toast(`${product.name} added to cart`);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Badge variant={product.badge === "sale" ? "rose" : "blue"}>{product.badge ? product.badge.charAt(0).toUpperCase() + product.badge.slice(1) : "In Stock"}</Badge>
        <span className="text-xs text-muted-foreground">{product.categoryName}</span>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{product.name}</h1>

      <div className="flex items-center gap-4 mb-6">
        <StarRating rating={product.rating} size={20} />
        <span className="text-sm text-muted-foreground">{product.rating} ({product.reviewCount} reviews)</span>
      </div>

      <div className="flex items-baseline gap-3 mb-6">
        <span className="text-3xl font-bold text-foreground">{formatPrice(product.price)}</span>
        {product.originalPrice > product.price && (
          <span className="text-xl line-through text-muted-foreground">{formatPrice(product.originalPrice)}</span>
        )}
        {discount > 0 && <Badge variant="rose">Save {discount}%</Badge>}
      </div>

      <p className="text-muted-foreground leading-relaxed mb-8">{product.description}</p>

      <div className="p-6 rounded-2xl border bg-accent/50 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <span className="text-sm font-medium text-foreground">Quantity</span>
          <QuantitySelector value={qty} onChange={setQty} max={product.stockCount} />
        </div>

        <div className="flex gap-3">
          <Button className="flex-1" size="lg" onClick={handleAddToCart}>
            Add to Cart — {formatPrice(product.price * qty)}
          </Button>
          <Button variant="outline" size="icon" className={wishlisted ? "text-rose-500 border-rose-200" : ""} onClick={() => { toggleWishlist(product.id); toast(wishlisted ? "Removed from wishlist" : "Added to wishlist"); }}>
            <Heart size={20} className={wishlisted ? "fill-rose-500" : ""} />
          </Button>
          <Button variant="outline" size="icon">
            <Share2 size={20} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {features.map((f, i) => (
          <div key={i} className="flex items-center gap-3">
            <f.icon size={18} className="text-muted-foreground" />
            <div>
              <div className="text-sm font-medium text-foreground">{f.title}</div>
              <div className="text-xs text-muted-foreground">{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {product.features.length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold text-foreground mb-3">Key Features</h3>
          <ul className="space-y-2">
            {product.features.map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      {Object.keys(product.specifications).length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold text-foreground mb-3">Specifications</h3>
          <div className="rounded-xl border divide-y">
            {Object.entries(product.specifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-muted-foreground">{key}</span>
                <span className="font-medium text-foreground">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
