"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductInfo } from "@/components/product/product-info";
import { RelatedProducts } from "@/components/product/related-products";
import { ReviewsSection } from "@/components/sections/reviews-section";
import { getProductBySlug, getRelatedProducts, getProductReviews } from "@/lib/data";
import { notFound } from "next/navigation";

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const product = getProductBySlug(slug);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h1>
          <Link href="/shop" className="text-primary hover:underline">Back to Shop</Link>
        </div>
      </div>
    );
  }

  const related = getRelatedProducts(product.id, 4);
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

        <div className="grid lg:grid-cols-2 gap-12">
          <ProductGallery images={product.images} name={product.name} />
          <ProductInfo product={product} />
        </div>

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
