import { Film, Search, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  type: 'reviews' | 'search' | 'comments';
  message?: string;
  className?: string;
}

const icons = {
  reviews: Film,
  search: Search,
  comments: MessageCircle,
};

const defaultMessages = {
  reviews: 'No reviews yet. Check back soon!',
  search: 'No results found. Try a different search.',
  comments: 'Be the first to comment!',
};

export function EmptyState({ type, message, className }: EmptyStateProps) {
  const Icon = icons[type];
  const displayMessage = message || defaultMessages[type];
  
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4', className)}>
      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground text-center max-w-xs">{displayMessage}</p>
    </div>
  );
}
