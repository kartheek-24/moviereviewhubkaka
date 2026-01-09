import { useState } from 'react';
import { ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';

interface HelpfulButtonProps {
  reviewId: string;
  initialCount: number;
  className?: string;
}

export function HelpfulButton({ reviewId, initialCount, className }: HelpfulButtonProps) {
  const { deviceId } = useApp();
  const { toast } = useToast();
  
  // Check if already voted (persisted in localStorage)
  const getVoteKey = () => `helpful_${reviewId}`;
  const hasVotedInitially = localStorage.getItem(getVoteKey()) === 'true';
  
  const [hasVoted, setHasVoted] = useState(hasVotedInitially);
  const [count, setCount] = useState(initialCount + (hasVotedInitially ? 0 : 0));
  const [isAnimating, setIsAnimating] = useState(false);

  const handleVote = () => {
    if (hasVoted) {
      toast({
        title: 'Already voted',
        description: 'You have already marked this review as helpful.',
      });
      return;
    }

    setIsAnimating(true);
    setHasVoted(true);
    setCount((prev) => prev + 1);
    localStorage.setItem(getVoteKey(), 'true');
    
    // TODO: Save to database with deviceId or userId
    console.log('Vote recorded:', { reviewId, deviceId });

    toast({
      title: 'Thanks!',
      description: 'Glad you found this review helpful.',
    });

    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleVote}
      disabled={hasVoted}
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
