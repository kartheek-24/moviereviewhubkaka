export function ReviewCardSkeleton() {
  return (
    <div className="glass-card card-elevated rounded-xl overflow-hidden animate-pulse">
      <div className="flex gap-4 p-4">
        {/* Poster skeleton */}
        <div className="flex-shrink-0 w-20 h-28 rounded-lg skeleton-shimmer" />
        
        {/* Content skeleton */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="h-6 w-3/4 rounded skeleton-shimmer" />
            <div className="h-5 w-16 rounded-full skeleton-shimmer" />
          </div>
          
          {/* Rating */}
          <div className="flex items-center gap-3 mb-2">
            <div className="h-4 w-24 rounded skeleton-shimmer" />
            <div className="h-4 w-10 rounded skeleton-shimmer" />
          </div>
          
          {/* Snippet */}
          <div className="space-y-2 mb-3">
            <div className="h-4 w-full rounded skeleton-shimmer" />
            <div className="h-4 w-5/6 rounded skeleton-shimmer" />
          </div>
          
          {/* Footer */}
          <div className="flex items-center gap-4">
            <div className="h-4 w-20 rounded skeleton-shimmer" />
            <div className="h-4 w-12 rounded skeleton-shimmer" />
            <div className="h-4 w-12 rounded skeleton-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}
