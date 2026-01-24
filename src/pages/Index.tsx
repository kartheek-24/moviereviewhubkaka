import { useApp } from '@/contexts/AppContext';
import { useReviews, useLanguages } from '@/hooks/useReviews';
import { useRealtimeReviews } from '@/hooks/useRealtimeReviews';
import { Header } from '@/components/Header';
import { Drawer } from '@/components/Drawer';
import { ReviewCard } from '@/components/ReviewCard';
import { ReviewCardSkeleton } from '@/components/ReviewCardSkeleton';
import { SortDropdown } from '@/components/SortDropdown';
import { EmptyState } from '@/components/EmptyState';
import { LanguageBadge } from '@/components/LanguageBadge';
import { X, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Index() {
  const { selectedLanguage, setSelectedLanguage, sortBy, searchQuery } = useApp();
  
  // Enable real-time updates for reviews
  useRealtimeReviews();
  
  const { data: reviews, isLoading, error } = useReviews({
    language: selectedLanguage,
    searchQuery,
    sortBy,
  });

  const { data: languages = [] } = useLanguages();

  return (
    <div className="min-h-screen cinema-bg">
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
          <div className="flex items-center gap-2">
            {/* Language Filter */}
            <Select 
              value={selectedLanguage || "all"} 
              onValueChange={(value) => setSelectedLanguage(value === "all" ? null : value)}
            >
              <SelectTrigger className="w-[140px] h-9 bg-secondary border-0 focus:ring-1 focus:ring-primary">
                <Globe className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="All Languages" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Languages</SelectItem>
                {languages.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Actual Language Filter - shows when a language is selected */}
            {selectedLanguage && (
              <Select defaultValue="all">
                <SelectTrigger className="w-[160px] h-9 bg-secondary border-0 focus:ring-1 focus:ring-primary animate-fade-in">
                  <SelectValue placeholder="Actual Language" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">All Dialects</SelectItem>
                  <SelectItem value="original">Original</SelectItem>
                  <SelectItem value="dubbed">Dubbed</SelectItem>
                  <SelectItem value="subtitled">Subtitled</SelectItem>
                </SelectContent>
              </Select>
            )}

            <SortDropdown />
          </div>
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
      </main>
    </div>
  );
}
