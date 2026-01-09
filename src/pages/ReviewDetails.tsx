import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Share2 } from 'lucide-react';
import { mockReviews, mockComments } from '@/data/mockData';
import { Header } from '@/components/Header';
import { StarRating } from '@/components/StarRating';
import { LanguageBadge } from '@/components/LanguageBadge';
import { HelpfulButton } from '@/components/HelpfulButton';
import { CommentSection } from '@/components/CommentSection';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Comment } from '@/types';

export default function ReviewDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);

  const review = mockReviews.find((r) => r.id === id);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
      setComments(mockComments.filter((c) => c.reviewId === id));
    }, 500);
    return () => clearTimeout(timer);
  }, [id]);

  const handleShare = async () => {
    if (navigator.share && review) {
      try {
        await navigator.share({
          title: `${review.title} - MovieReviewHub`,
          text: review.snippet,
          url: window.location.href,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link copied',
        description: 'Review link copied to clipboard.',
      });
    }
  };

  const handleAddComment = (text: string, isAnonymous: boolean) => {
    const newComment: Comment = {
      id: `c${Date.now()}`,
      reviewId: id!,
      text,
      isAnonymous,
      displayName: isAnonymous ? 'Anonymous' : 'Guest',
      userId: null,
      createdAt: new Date(),
      reported: false,
    };
    setComments([newComment, ...comments]);
  };

  const handleDeleteComment = (commentId: string) => {
    setComments(comments.filter((c) => c.id !== commentId));
  };

  if (!review && !isLoading) {
    return (
      <div className="min-h-screen cinema-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display font-semibold text-foreground mb-2">
            Review not found
          </h1>
          <p className="text-muted-foreground mb-4">
            This review may have been removed or doesn't exist.
          </p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cinema-bg">
      {/* Custom Header */}
      <header className="sticky top-0 z-40 w-full safe-area-inset-top">
        <div className="glass-card border-b border-border/50">
          <div className="container flex items-center justify-between h-14 px-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="text-foreground hover:bg-muted"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold text-foreground truncate max-w-[200px]">
              {isLoading ? 'Loading...' : review?.title}
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="text-foreground hover:bg-muted"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <ScrollArea className="h-[calc(100vh-3.5rem)]">
        <main className="container px-4 py-6 pb-20">
          {isLoading ? (
            <div className="animate-pulse space-y-6">
              <div className="h-64 rounded-xl skeleton-shimmer" />
              <div className="h-8 w-3/4 rounded skeleton-shimmer" />
              <div className="h-4 w-1/2 rounded skeleton-shimmer" />
              <div className="space-y-2">
                <div className="h-4 w-full rounded skeleton-shimmer" />
                <div className="h-4 w-full rounded skeleton-shimmer" />
                <div className="h-4 w-3/4 rounded skeleton-shimmer" />
              </div>
            </div>
          ) : review && (
            <article className="animate-fade-in">
              {/* Poster */}
              {review.posterUrl && (
                <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-6">
                  <img
                    src={review.posterUrl}
                    alt={review.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                </div>
              )}

              {/* Header */}
              <div className="mb-6">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h1 className="font-display text-2xl font-bold text-foreground">
                    {review.title}
                  </h1>
                  <LanguageBadge language={review.language} />
                </div>

                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <StarRating rating={review.rating} size="md" />
                  {review.releaseYear && (
                    <span className="text-sm text-muted-foreground">
                      {review.releaseYear}
                    </span>
                  )}
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{format(review.createdAt, 'MMMM d, yyyy')}</span>
                  </div>
                </div>

                {review.tags && review.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {review.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <HelpfulButton reviewId={review.id} initialCount={review.helpfulCount} />
              </div>

              <Separator className="my-6 bg-border/50" />

              {/* Content */}
              <div className="prose prose-invert prose-sm max-w-none mb-8">
                {review.content.split('\n\n').map((paragraph, i) => (
                  <p key={i} className="text-foreground/90 leading-relaxed mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>

              <Separator className="my-6 bg-border/50" />

              {/* Comments */}
              <CommentSection
                reviewId={review.id}
                comments={comments}
                onAddComment={handleAddComment}
                onDeleteComment={handleDeleteComment}
              />
            </article>
          )}
        </main>
      </ScrollArea>
    </div>
  );
}
