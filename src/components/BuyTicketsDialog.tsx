import { useState, useMemo, useCallback } from 'react';
import { Ticket, ExternalLink, ArrowUp, ArrowDown, X, Smartphone } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Theater {
  name: string;
  logo: string;
  getUrl: (zipCode: string, movieTitle: string) => string;
  getAppUrl?: (zipCode: string, movieTitle: string) => string; // Deep link URL for mobile apps
  bgColor: string;
  avgPrice: number; // Average ticket price in USD
}

// Helper to detect if user is on mobile
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const theaters: Theater[] = [
  {
    name: 'Cinemark',
    logo: '🎬',
    getUrl: (zipCode, movieTitle) => 
      `https://www.cinemark.com/search?query=${encodeURIComponent(movieTitle)}`,
    // Cinemark app deep link - uses universal link
    getAppUrl: (zipCode, movieTitle) =>
      `https://www.cinemark.com/search?query=${encodeURIComponent(movieTitle)}`,
    bgColor: 'bg-blue-600 hover:bg-blue-700',
    avgPrice: 10.50,
  },
  {
    name: 'Regal',
    logo: '👑',
    getUrl: (zipCode, movieTitle) => 
      `https://www.regmovies.com/movies?query=${encodeURIComponent(movieTitle)}`,
    // Regal app uses universal links
    getAppUrl: (zipCode, movieTitle) =>
      `regal://movies/search?q=${encodeURIComponent(movieTitle)}`,
    bgColor: 'bg-red-600 hover:bg-red-700',
    avgPrice: 12.00,
  },
  {
    name: 'Atom Tickets',
    logo: '⚛️',
    getUrl: (zipCode, movieTitle) => 
      `https://www.atomtickets.com/movies?postal_code=${zipCode}&query=${encodeURIComponent(movieTitle)}`,
    // Atom Tickets app deep link
    getAppUrl: (zipCode, movieTitle) =>
      `atomtickets://search?query=${encodeURIComponent(movieTitle)}&zip=${zipCode}`,
    bgColor: 'bg-purple-600 hover:bg-purple-700',
    avgPrice: 12.50,
  },
  {
    name: 'Fandango',
    logo: '🎟️',
    getUrl: (zipCode, movieTitle) => 
      `https://www.fandango.com/search?q=${encodeURIComponent(movieTitle)}&zipcode=${zipCode}`,
    // Fandango app deep link
    getAppUrl: (zipCode, movieTitle) =>
      `fandango://search?q=${encodeURIComponent(movieTitle)}&zip=${zipCode}`,
    bgColor: 'bg-orange-500 hover:bg-orange-600',
    avgPrice: 13.00,
  },
  {
    name: 'AMC Theatres',
    logo: '🍿',
    getUrl: (zipCode, movieTitle) => 
      `https://www.amctheatres.com/movies?query=${encodeURIComponent(movieTitle)}`,
    // AMC app deep link
    getAppUrl: (zipCode, movieTitle) =>
      `amctheatres://search?query=${encodeURIComponent(movieTitle)}`,
    bgColor: 'bg-red-700 hover:bg-red-800',
    avgPrice: 14.50,
  },
];

interface BuyTicketsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movieTitle: string;
}

const ZIPCODE_STORAGE_KEY = 'moviehub_user_zipcode';

export function BuyTicketsDialog({ open, onOpenChange, movieTitle }: BuyTicketsDialogProps) {
  const [zipCode, setZipCode] = useState(() => {
    return localStorage.getItem(ZIPCODE_STORAGE_KEY) || '';
  });
  const [showTheaters, setShowTheaters] = useState(false);
  const [error, setError] = useState('');
  const [sortAscending, setSortAscending] = useState(true);

  const hasSavedZipCode = Boolean(localStorage.getItem(ZIPCODE_STORAGE_KEY));

  const handleClearZipCode = () => {
    localStorage.removeItem(ZIPCODE_STORAGE_KEY);
    setZipCode('');
    setShowTheaters(false);
  };

  const sortedTheaters = useMemo(() => {
    return [...theaters].sort((a, b) => 
      sortAscending ? a.avgPrice - b.avgPrice : b.avgPrice - a.avgPrice
    );
  }, [sortAscending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic US zip code validation (5 digits)
    const zipRegex = /^\d{5}$/;
    if (!zipRegex.test(zipCode)) {
      setError('Please enter a valid 5-digit zip code');
      return;
    }
    
    // Save zip code to localStorage
    localStorage.setItem(ZIPCODE_STORAGE_KEY, zipCode);
    
    setError('');
    setShowTheaters(true);
  };

  // Try to open the app first on mobile, fallback to web URL
  const handleTheaterClick = useCallback((theater: Theater) => {
    const webUrl = theater.getUrl(zipCode, movieTitle);
    
    // If on mobile and app deep link is available, try to open app first
    if (isMobileDevice() && theater.getAppUrl) {
      const appUrl = theater.getAppUrl(zipCode, movieTitle);
      
      // Create a hidden iframe to try opening the app
      // This prevents the page from navigating away if the app isn't installed
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      
      // Set a timeout to fallback to web URL if app doesn't open
      const fallbackTimeout = setTimeout(() => {
        window.open(webUrl, '_blank', 'noopener,noreferrer');
      }, 1500);
      
      // Try to open the app
      try {
        // Use location.href for deep links on mobile
        window.location.href = appUrl;
        
        // If we're still here after a short delay, the app likely opened
        // Clear the fallback timeout on visibility change (app opened)
        const handleVisibilityChange = () => {
          if (document.hidden) {
            clearTimeout(fallbackTimeout);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
          }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Clean up after timeout
        setTimeout(() => {
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        }, 2000);
      } catch (e) {
        // If deep link fails, open web URL
        clearTimeout(fallbackTimeout);
        window.open(webUrl, '_blank', 'noopener,noreferrer');
      }
    } else {
      // Desktop or no app URL - just open web URL
      window.open(webUrl, '_blank', 'noopener,noreferrer');
    }
  }, [zipCode, movieTitle]);

  const handleClose = (open: boolean) => {
    if (!open) {
      // Reset state when closing
      setShowTheaters(false);
      setError('');
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-amber-500" />
            Buy Tickets
          </DialogTitle>
          <DialogDescription>
            {showTheaters 
              ? `Select a theater to book tickets for "${movieTitle}"`
              : 'Enter your zip code to find theaters near you'
            }
          </DialogDescription>
        </DialogHeader>

        {!showTheaters ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="zipcode">Zip Code</Label>
                {hasSavedZipCode && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearZipCode}
                    className="h-auto py-0.5 px-2 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear saved
                  </Button>
                )}
              </div>
              <Input
                id="zipcode"
                type="text"
                placeholder="Enter 5-digit zip code"
                value={zipCode}
                onChange={(e) => {
                  setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5));
                  setError('');
                }}
                maxLength={5}
                className="text-center text-lg tracking-widest"
                autoFocus
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
            <Button 
              type="submit" 
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold"
            >
              Find Theaters
            </Button>
          </form>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">
                Near <span className="font-semibold text-foreground">{zipCode}</span>
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortAscending(!sortAscending)}
                className="flex items-center gap-1.5 text-xs"
              >
                {sortAscending ? (
                  <ArrowUp className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDown className="h-3.5 w-3.5" />
                )}
                Est. Price: {sortAscending ? 'Low → High' : 'High → Low'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground/70 text-center mb-3">
              * Prices are estimates. Actual prices vary by showtime, format & location.
            </p>
            <div className="grid gap-2">
              {sortedTheaters.map((theater) => (
                <Button
                  key={theater.name}
                  onClick={() => handleTheaterClick(theater)}
                  className={`w-full justify-between ${theater.bgColor} text-white`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{theater.logo}</span>
                    {theater.name}
                    <span className="text-xs opacity-80">Est. ${theater.avgPrice.toFixed(2)}</span>
                  </span>
                  {isMobileDevice() && theater.getAppUrl ? (
                    <Smartphone className="h-4 w-4" />
                  ) : (
                    <ExternalLink className="h-4 w-4" />
                  )}
                </Button>
              ))}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-2"
              onClick={() => setShowTheaters(false)}
            >
              Change Zip Code
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
