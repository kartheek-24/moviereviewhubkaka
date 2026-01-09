import { useState, useEffect } from 'react';
import { ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useHasVoted, useCreateHelpfulVote } from '@/hooks/useReviews';

interface HelpfulButtonProps {
  reviewId: string;
  initialCount: number;
  className?: string;
}

export function HelpfulButton({ reviewId, initialCount, className }: HelpfulButtonProps) {
  const { deviceId } = useApp();
  const { user } = useAuth();
  
  const voterId = user?.id || deviceId;
  const { data: hasVotedFromDb, isLoading } = useHasVoted(reviewId, voterId);
  const createVote = useCreateHelpfulVote();
  
  const [hasVoted, setHasVoted] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (hasVotedFromDb !== undefined) {
      setHasVoted(hasVotedFromDb);
    }
  }, [hasVotedFromDb]);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  const handleVote = () => {
    if (hasVoted || isLoading) return;

    setIsAnimating(true);
    setHasVoted(true);
    setCount((prev) => prev + 1);

    createVote.mutate({
      reviewId,
      voterUserId: user?.id || null,
      voterDeviceId: deviceId,
    }, {
      onError: () => {
        // Revert on error
        setHasVoted(false);
        setCount((prev) => prev - 1);
      },
    });

    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleVote}
      disabled={hasVoted || isLoading}
      className={cn(
        'gap-2 transition-all duration-200',
        hasVoted 
          ? 'bg-primary/10 border-primary/30 text-primary cursor-default'
          : 'hover:bg-primary/10 hover:border-primary/30 hover:text-primary',
        isAnimating && 'scale-105',
        className
      )}
    >
      <ThumbsUp className={cn(
        'w-4 h-4 transition-transform duration-200',
        isAnimating && 'scale-125',
        hasVoted && 'fill-primary'
      )} />
      <span>Helpful ({count})</span>
    </Button>
  );
}
