import { Link } from 'react-router-dom';
import { MessageCircle, ThumbsUp, Calendar } from 'lucide-react';
import { Review } from '@/services/reviewService';
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
          {review.poster_url && (
            <div className="flex-shrink-0 w-20 h-28 rounded-lg overflow-hidden">
              <img
                src={review.poster_url}
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
            
            {/* Rating & Date */}
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-1 text-primary font-semibold">
                <span className="text-sm">{review.rating}/10</span>
              </div>
              {review.release_date && (
                <span className="text-xs text-muted-foreground">
                  {format(new Date(review.release_date), 'MMM d, yyyy')}
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
                <span>{format(new Date(review.created_at), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-1">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{review.helpful_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{review.comment_count}</span>
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
