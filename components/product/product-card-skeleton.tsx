export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border bg-card shadow-sm" aria-hidden>
      <div className="shimmer aspect-square" />
      <div className="p-5 space-y-3">
        <div className="shimmer h-3 w-1/4 rounded" />
        <div className="shimmer h-5 w-3/4 rounded" />
        <div className="shimmer h-3 w-1/3 rounded" />
        <div className="shimmer h-6 w-1/4 rounded" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6, className = "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" }: { count?: number; className?: string }) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
