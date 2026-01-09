import { ArrowUpDown, Clock, Star, MessageCircle, ThumbsUp } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { SortOption } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
  { value: 'newest', label: 'Newest', icon: <Clock className="w-4 h-4" /> },
  { value: 'highest-rated', label: 'Highest Rated', icon: <Star className="w-4 h-4" /> },
  { value: 'most-commented', label: 'Most Commented', icon: <MessageCircle className="w-4 h-4" /> },
  { value: 'most-helpful', label: 'Most Helpful', icon: <ThumbsUp className="w-4 h-4" /> },
];

export function SortDropdown() {
  const { sortBy, setSortBy } = useApp();

  return (
    <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
      <SelectTrigger className="w-[160px] h-9 bg-secondary border-0 focus:ring-1 focus:ring-primary">
        <ArrowUpDown className="w-4 h-4 mr-2 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-popover border-border">
        {sortOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center gap-2">
              {option.icon}
              {option.label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
