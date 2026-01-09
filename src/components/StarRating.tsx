import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

const sizeClasses = {
  sm: 'w-3.5 h-3.5',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  className,
}: StarRatingProps) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: maxRating }, (_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= rating;
        
        return (
          <button
            key={i}
            type={interactive ? 'button' : undefined}
            disabled={!interactive}
            onClick={() => interactive && onChange?.(starValue)}
            className={cn(
              'transition-all duration-200',
              interactive && 'cursor-pointer hover:scale-110 active:scale-95',
              !interactive && 'cursor-default'
            )}
          >
            <Star
              className={cn(
                sizeClasses[size],
                'transition-colors duration-200',
                isFilled ? 'fill-primary text-primary' : 'fill-transparent text-muted-foreground/40'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
