"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  size?: number;
  showValue?: boolean;
  reviewCount?: number;
  className?: string;
}

export function StarRating({ rating, size = 16, showValue, reviewCount, className }: StarRatingProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={cn(
              "transition-colors",
              star <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
            )}
          />
        ))}
      </div>
      {showValue && <span className="text-sm font-medium text-foreground">{rating}</span>}
      {reviewCount !== undefined && <span className="text-sm text-muted-foreground">({reviewCount})</span>}
    </div>
  );
}
