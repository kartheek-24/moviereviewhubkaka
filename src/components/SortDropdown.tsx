import { ArrowUpDown, Clock, Star, MessageCircle, ThumbsUp, CalendarDays, Globe } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { SortOption } from '@/types';
import { useLanguages } from '@/hooks/useReviews';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from '@/components/ui/select';

const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
  { value: 'release-date', label: 'Release Date', icon: <CalendarDays className="w-4 h-4" /> },
  { value: 'newest', label: 'Newest', icon: <Clock className="w-4 h-4" /> },
  { value: 'highest-rated', label: 'Highest Rated', icon: <Star className="w-4 h-4" /> },
  { value: 'most-commented', label: 'Most Commented', icon: <MessageCircle className="w-4 h-4" /> },
  { value: 'most-helpful', label: 'Most Helpful', icon: <ThumbsUp className="w-4 h-4" /> },
];

export function SortDropdown() {
  const { sortBy, setSortBy, selectedLanguage, setSelectedLanguage } = useApp();
  const { data: languages = [] } = useLanguages();

  // Combined value: "sort:value" or "lang:value"
  const currentValue = `sort:${sortBy}`;

  const handleValueChange = (value: string) => {
    if (value.startsWith('sort:')) {
      setSortBy(value.replace('sort:', '') as SortOption);
    } else if (value.startsWith('lang:')) {
      const lang = value.replace('lang:', '');
      setSelectedLanguage(lang === 'all' ? null : lang);
    }
  };

  return (
    <Select value={currentValue} onValueChange={handleValueChange}>
      <SelectTrigger className="w-[160px] h-9 bg-secondary border-0 focus:ring-1 focus:ring-primary">
        <ArrowUpDown className="w-4 h-4 mr-2 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-popover border-border">
        <SelectGroup>
          <SelectLabel className="text-xs text-muted-foreground">Sort By</SelectLabel>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={`sort:${option.value}`}>
              <div className="flex items-center gap-2">
                {option.icon}
                {option.label}
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
        
        <SelectSeparator />
        
        <SelectGroup>
          <SelectLabel className="text-xs text-muted-foreground">Language</SelectLabel>
          <SelectItem value="lang:all">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              All Languages {selectedLanguage === null && '✓'}
            </div>
          </SelectItem>
          {languages.map((lang) => (
            <SelectItem key={lang} value={`lang:${lang}`}>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                {lang} {selectedLanguage === lang && '✓'}
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
