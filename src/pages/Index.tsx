import { useMemo, useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Header } from '@/components/Header';
import { Drawer } from '@/components/Drawer';
import { ReviewCard } from '@/components/ReviewCard';
import { ReviewCardSkeleton } from '@/components/ReviewCardSkeleton';
import { SortDropdown } from '@/components/SortDropdown';
import { EmptyState } from '@/components/EmptyState';
import { mockReviews } from '@/data/mockData';
import { LanguageBadge } from '@/components/LanguageBadge';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Index() {
  const { selectedLanguage, setSelectedLanguage, sortBy, searchQuery } = useApp();
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Filter and sort reviews
  const filteredReviews = useMemo(() => {
    let reviews = [...mockReviews];

    // Filter by language
    if (selectedLanguage) {
      reviews = reviews.filter((r) => r.language === selectedLanguage);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      reviews = reviews.filter((r) => r.titleLower.includes(query));
    }

    // Sort
    switch (sortBy) {
      case 'highest-rated':
        reviews.sort((a, b) => b.rating - a.rating);
        break;
      case 'most-commented':
        reviews.sort((a, b) => b.commentCount - a.commentCount);
        break;
      case 'most-helpful':
        reviews.sort((a, b) => b.helpfulCount - a.helpfulCount);
        break;
      case 'newest':
      default:
        reviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
    }

    return reviews;
  }, [selectedLanguage, sortBy, searchQuery]);

  return (
    <div className="min-h-screen cinema-bg">
      <Header title="MovieReviewHub By Kaka" />
      <Drawer />

      <main className="container px-4 py-4 pb-20">
        {/* Filter Bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {selectedLanguage && (
              <div className="flex items-center gap-2 animate-fade-in">
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
          <SortDropdown />
        </div>

        {/* Reviews List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ReviewCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredReviews.length === 0 ? (
          <EmptyState
            type={searchQuery ? 'search' : 'reviews'}
            message={
              searchQuery
                ? `No reviews found for "${searchQuery}"`
                : selectedLanguage
                ? `No ${selectedLanguage} reviews yet`
                : undefined
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review, index) => (
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
