"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Eye, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "./star-rating";
import { useCartContext } from "@/components/layout/cart-provider";
import { useWishlistContext } from "@/components/layout/wishlist-provider";
import { useToast } from "@/components/layout/toast-provider";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCartContext();
  const { isWishlisted, toggleWishlist } = useWishlistContext();
  const { toast } = useToast();
  const wishlisted = isWishlisted(product.id);
  const discount = calculateDiscount(product.originalPrice, product.price);

  const handleAddToCart = () => {
    addItem(product);
    toast(`${product.name} added to cart`);
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product.id);
    toast(wishlisted ? "Removed from wishlist" : "Added to wishlist", "info");
  };

  const badgeColors = {
    bestseller: "blue",
    new: "emerald",
    sale: "rose",
    limited: "amber",
    trending: "slate",
  } as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -6, transition: { type: "spring", stiffness: 300, damping: 20 } }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      className="group relative rounded-2xl overflow-hidden border bg-card text-card-foreground shadow-sm hover:shadow-xl transition-all duration-500"
    >
      <Link href={`/shop/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
          {product.badge && (
            <div className="absolute top-3 left-3">
              <Badge variant={badgeColors[product.badge]}>{product.badge.charAt(0).toUpperCase() + product.badge.slice(1)}</Badge>
            </div>
          )}
          {discount > 0 && (
            <div className="absolute top-3 right-3">
              <Badge variant="rose">-{discount}%</Badge>
            </div>
          )}
        </div>
      </Link>

      <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
        <Button variant="secondary" size="icon-sm" onClick={handleToggleWishlist} className={wishlisted ? "text-rose-500" : ""}>
          <Heart size={16} className={wishlisted ? "fill-rose-500" : ""} />
        </Button>
        <Link href={`/shop/${product.slug}`}>
          <Button variant="secondary" size="icon-sm"><Eye size={16} /></Button>
        </Link>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <Button className="w-full" onClick={handleAddToCart}>
          <ShoppingBag size={16} className="mr-2" />
          Add to Cart
        </Button>
      </div>

      <div className="p-5">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">{product.categoryName}</div>
        <Link href={`/shop/${product.slug}`}>
          <h3 className="font-semibold text-foreground truncate hover:text-primary transition-colors">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-2 mt-2">
          <StarRating rating={product.rating} size={14} />
          <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-lg font-bold text-foreground">{formatPrice(product.price)}</span>
          {product.originalPrice > product.price && (
            <span className="text-sm line-through text-muted-foreground">{formatPrice(product.originalPrice)}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
