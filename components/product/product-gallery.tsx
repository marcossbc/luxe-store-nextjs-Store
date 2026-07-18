"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 300 : -300, opacity: 0 }),
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setActiveIndex((prev) => {
      const next = prev + newDirection;
      if (next < 0) return images.length - 1;
      if (next >= images.length) return 0;
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-square rounded-2xl overflow-hidden border bg-muted">
        <AnimatePresence initial={false} custom={direction}>
          <motion.img
            key={activeIndex}
            src={images[activeIndex]}
            alt={`${name} - ${activeIndex + 1}`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
        {images.length > 1 && (
          <>
            <Button variant="ghost" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 glass glass-border border rounded-full" onClick={() => paginate(-1)}>
              <ChevronLeft size={20} />
            </Button>
            <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 glass glass-border border rounded-full" onClick={() => paginate(1)}>
              <ChevronRight size={20} />
            </Button>
          </>
        )}
      </div>

      <div className="flex gap-3">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => { setDirection(i > activeIndex ? 1 : -1); setActiveIndex(i); }}
            className={cn(
              "w-20 h-20 rounded-xl overflow-hidden border-2 transition-all",
              activeIndex === i ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
            )}
          >
            <img src={img} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
