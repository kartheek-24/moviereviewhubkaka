import { Link } from 'react-router-dom';
import { MessageCircle, ThumbsUp, Calendar } from 'lucide-react';
import { Review } from '@/types';
import { StarRating } from './StarRating';
import { LanguageBadge } from './LanguageBadge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ReviewCardProps {
  review: Review;
  className?: string;
}

export function ReviewCard({ review, className }: ReviewCardProps) {
  return (
    <Link
      to={`/review/${review.id}`}
      className={cn(
        'block group',
        className
      )}
    >
      <article className="glass-card card-elevated card-hover rounded-xl overflow-hidden">
        <div className="flex gap-4 p-4">
          {/* Poster */}
          {review.posterUrl && (
            <div className="flex-shrink-0 w-20 h-28 rounded-lg overflow-hidden">
              <img
                src={review.posterUrl}
                alt={review.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          )}
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-display font-semibold text-lg text-foreground truncate group-hover:text-primary transition-colors">
                {review.title}
              </h3>
              <LanguageBadge language={review.language} />
            </div>
            
            {/* Rating & Year */}
            <div className="flex items-center gap-3 mb-2">
              <StarRating rating={review.rating} size="sm" />
              {review.releaseYear && (
                <span className="text-xs text-muted-foreground">
                  {review.releaseYear}
                </span>
              )}
            </div>
            
            {/* Snippet */}
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {review.snippet}
            </p>
            
            {/* Footer */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{format(review.createdAt, 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-1">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{review.helpfulCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{review.commentCount}</span>
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
