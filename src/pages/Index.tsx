import { useApp } from '@/contexts/AppContext';
import { useReviews } from '@/hooks/useReviews';
import { useRealtimeReviews } from '@/hooks/useRealtimeReviews';
import { Header } from '@/components/Header';
import { Drawer } from '@/components/Drawer';
import { ReviewCard } from '@/components/ReviewCard';
import { ReviewCardSkeleton } from '@/components/ReviewCardSkeleton';
import { SortDropdown } from '@/components/SortDropdown';
import { EmptyState } from '@/components/EmptyState';
import { LanguageBadge } from '@/components/LanguageBadge';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Index() {
  const { selectedLanguage, setSelectedLanguage, sortBy, searchQuery } = useApp();
  const scrollTest =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('scrollTest');
  
  // Enable real-time updates for reviews
  useRealtimeReviews();
  
  const { data: reviews, isLoading, error } = useReviews({
    language: selectedLanguage,
    searchQuery,
    sortBy,
  });

  return (
    <div className="min-h-full cinema-bg">
      <Header title="MovieReviewHub By Kaka" />
      <Drawer />

      <main className="container px-4 py-4 pb-20">
        {/* Filter Bar */}
        <div className="flex items-center justify-between mb-4 gap-2">
          {/* Left side - Active filters and search results */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Active Filter Badges */}
            {selectedLanguage && (
              <div className="flex items-center gap-1 animate-fade-in">
                <LanguageBadge language={selectedLanguage} />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedLanguage(null)}
                  className="h-6 w-6 rounded-full"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
            {searchQuery && (
              <span className="text-sm text-muted-foreground animate-fade-in">
                Results for "{searchQuery}"
              </span>
            )}
          </div>

          {/* Right side - Filter options */}
          <SortDropdown />
        </div>

        {/* Reviews List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ReviewCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <EmptyState
            type="reviews"
            message="Failed to load reviews. Please try again."
          />
        ) : !reviews || reviews.length === 0 ? (
          <EmptyState
            type={searchQuery ? 'search' : 'reviews'}
            message={
              searchQuery
                ? `No reviews found for "${searchQuery}"`
                : selectedLanguage
                ? `No ${selectedLanguage} reviews yet`
                : 'No reviews yet. Check back soon!'
            }
          />
        ) : (
          <div className="space-y-4">
            {reviews.map((review, index) => (
              <div
                key={review.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ReviewCard review={review} />
              </div>
            ))}
          </div>
        )}

        {/* Debug: add extra height to confirm scrolling works on iOS Safari */}
        {scrollTest && <div aria-hidden="true" style={{ height: '200vh' }} />}
      </main>
    </div>
  );
}
