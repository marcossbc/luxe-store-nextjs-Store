"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ProductDetailsView } from "@/components/product/pdp/product-details-view";
import { RelatedProducts } from "@/components/product/related-products";
import { ReviewsSection } from "@/components/sections/reviews-section";
import { getProductReviews } from "@/lib/data";
import type { Product } from "@/lib/types";

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [state, setState] = useState<"loading" | "ok" | "missing">("loading");

  useEffect(() => {
    setState("loading");
    fetch(`/api/products/${slug}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => { setProduct(d.product); setRelated(d.related); setState("ok"); })
      .catch(() => setState("missing"));
  }, [slug]);

  if (state === "loading") {
    return <div className="min-h-screen max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-2 gap-12">
      <div className="shimmer aspect-square rounded-3xl" />
      <div className="space-y-4">
        <div className="shimmer h-4 w-1/4 rounded" />
        <div className="shimmer h-10 w-3/4 rounded" />
        <div className="shimmer h-8 w-1/4 rounded" />
        <div className="shimmer h-24 w-full rounded-2xl" />
        <div className="shimmer h-14 w-full rounded-2xl" />
      </div>
    </div>;
  }

  if (state === "missing" || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h1>
          <Link href="/shop" className="text-primary hover:underline">Back to Shop</Link>
        </div>
      </div>
    );
  }

  const reviews = getProductReviews(product.id);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link href="/shop" className="hover:text-foreground transition-colors">Shop</Link>
          <ChevronRight size={14} />
          <span className="text-foreground">{product.name}</span>
        </div>

        <ProductDetailsView key={product.id} product={product} />

        {reviews.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-foreground mb-8">Customer Reviews</h2>
            <ReviewsSection reviews={reviews} />
          </div>
        )}

        {related.length > 0 && (
          <div className="mt-20">
            <RelatedProducts products={related} />
          </div>
        )}
      </div>
    </div>
  );
}
