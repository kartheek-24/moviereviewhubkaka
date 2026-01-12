import { useState } from 'react';
import { Menu, Search, X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  showMenu?: boolean;
  onBack?: () => void;
}

export function Header({ 
  title = 'MovieReviewHub', 
  showSearch = true, 
  showMenu = true,
}: HeaderProps) {
  const { toggleDrawer, searchQuery, setSearchQuery } = useApp();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full safe-area-inset-top">
      <div className="glass-card border-b border-border/50">
        <div className="container flex items-center justify-between h-14 px-4">
          {/* Left side */}
          <div className="flex items-center gap-2">
            {showMenu && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDrawer}
                className="text-foreground hover:bg-muted"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            )}
            
            {!isSearchOpen && (
              <div className="flex items-center gap-2">
                <img 
                  src="/favicon.png" 
                  alt="MovieReviewHub" 
                  className="w-7 h-7 rounded-md"
                />
                <h1 className="font-display font-semibold text-lg">
                  <span className="text-foreground">{title.replace('By Kaka', '')}</span>
                  {title.includes('By Kaka') && (
                    <span className="gold-text ml-1">By Kaka</span>
                  )}
                </h1>
              </div>
            )}
          </div>
          
          {/* Search */}
          {showSearch && (
            <div className={cn(
              'flex items-center gap-2 transition-all duration-300',
              isSearchOpen ? 'flex-1 ml-2' : ''
            )}>
              {isSearchOpen ? (
                <>
                  <Input
                    type="search"
                    placeholder="Search movies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary"
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="flex-shrink-0"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(true)}
                  className="text-foreground hover:bg-muted"
                >
                  <Search className="h-5 w-5" />
                  <span className="sr-only">Search</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
