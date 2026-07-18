"use client";

import { motion } from "framer-motion";
import { StarRating } from "@/components/product/star-rating";
import { reviews as allReviews } from "@/lib/data";
import type { Review } from "@/lib/types";

interface ReviewsSectionProps {
  reviews?: Review[];
}

export function ReviewsSection({ reviews = allReviews }: ReviewsSectionProps) {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">What Our Customers Say</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Real reviews from real customers who love our products.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <motion.div key={review.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="p-8 rounded-2xl bg-card border shadow-sm">
              <StarRating rating={review.rating} size={16} />
              <p className="mt-4 text-muted-foreground leading-relaxed italic">&ldquo;{review.content}&rdquo;</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-sm font-bold text-foreground">
                  {review.avatar}
                </div>
                <div>
                  <div className="font-semibold text-sm text-foreground">{review.author}</div>
                  <div className="text-xs text-muted-foreground">{review.verified && "Verified Buyer"}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
