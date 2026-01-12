import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ReactionType = 'like' | 'dislike' | 'love';

interface CommentReactionsProps {
  commentId: string;
  likeCount: number;
  dislikeCount: number;
  loveCount: number;
  userReaction: ReactionType | null;
  onReact: (commentId: string, reactionType: ReactionType) => void;
}

export function CommentReactions({
  commentId,
  likeCount,
  dislikeCount,
  loveCount,
  userReaction,
  onReact,
}: CommentReactionsProps) {
  const [isAnimating, setIsAnimating] = useState<ReactionType | null>(null);

  const handleReact = (type: ReactionType) => {
    setIsAnimating(type);
    onReact(commentId, type);
    setTimeout(() => setIsAnimating(null), 300);
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleReact('like')}
        className={cn(
          'h-7 px-2 gap-1 text-xs',
          userReaction === 'like'
            ? 'text-blue-500 hover:text-blue-600'
            : 'text-muted-foreground hover:text-foreground',
          isAnimating === 'like' && 'scale-110'
        )}
      >
        <ThumbsUp className={cn('h-3.5 w-3.5', userReaction === 'like' && 'fill-current', isAnimating === 'like' && 'animate-bounce')} />
        <span>{likeCount}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleReact('dislike')}
        className={cn(
          'h-7 px-2 gap-1 text-xs',
          userReaction === 'dislike'
            ? 'text-orange-500 hover:text-orange-600'
            : 'text-muted-foreground hover:text-foreground',
          isAnimating === 'dislike' && 'scale-110'
        )}
      >
        <ThumbsDown className={cn('h-3.5 w-3.5', userReaction === 'dislike' && 'fill-current', isAnimating === 'dislike' && 'animate-bounce')} />
        <span>{dislikeCount}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleReact('love')}
        className={cn(
          'h-7 px-2 gap-1 text-xs',
          userReaction === 'love'
            ? 'text-red-500 hover:text-red-600'
            : 'text-muted-foreground hover:text-foreground',
          isAnimating === 'love' && 'scale-110'
        )}
      >
        <Heart className={cn('h-3.5 w-3.5', userReaction === 'love' && 'fill-current', isAnimating === 'love' && 'animate-bounce')} />
        <span>{loveCount}</span>
      </Button>
    </div>
  );
}
