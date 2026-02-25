import { useState, useMemo, useCallback } from 'react';
import { Ticket, ExternalLink, ArrowUp, ArrowDown, X } from 'lucide-react';
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
  getAppUrl?: (zipCode: string, movieTitle: string) => string;
  bgColor: string;
  basePrice: number; // Base ticket price for Standard format
}

type TheaterFormat = 'standard' | 'dolby' | 'imax';

interface FormatOption {
  id: TheaterFormat;
  name: string;
  icon: string;
  priceMultiplier: number;
  description: string;
}

const formatOptions: FormatOption[] = [
  { id: 'standard', name: 'Standard', icon: '🎬', priceMultiplier: 1, description: 'Regular 2D' },
  { id: 'dolby', name: 'Dolby Cinema', icon: '🔊', priceMultiplier: 1.4, description: 'Premium sound & vision' },
  { id: 'imax', name: 'IMAX', icon: '📽️', priceMultiplier: 1.6, description: 'Giant screen experience' },
];

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
    getAppUrl: (zipCode, movieTitle) =>
      `https://www.cinemark.com/search?query=${encodeURIComponent(movieTitle)}`,
    bgColor: 'bg-blue-600 hover:bg-blue-700',
    basePrice: 10.50,
  },
  {
    name: 'Regal',
    logo: '👑',
    getUrl: (zipCode, movieTitle) => 
      `https://www.regmovies.com/movies?query=${encodeURIComponent(movieTitle)}`,
    getAppUrl: (zipCode, movieTitle) =>
      `regal://movies/search?q=${encodeURIComponent(movieTitle)}`,
    bgColor: 'bg-red-600 hover:bg-red-700',
    basePrice: 12.00,
  },
  {
    name: 'Alamo Drafthouse',
    logo: '🍺',
    getUrl: (zipCode, movieTitle) =>
      `https://drafthouse.com/search#q=${encodeURIComponent(movieTitle)}`,
    bgColor: 'bg-purple-600 hover:bg-purple-700',
    basePrice: 14.00,
  },
  {
    name: 'Fandango',
    logo: '🎟️',
    getUrl: (zipCode, movieTitle) => 
      `https://www.fandango.com/search?q=${encodeURIComponent(movieTitle)}&zipcode=${zipCode}`,
    getAppUrl: (zipCode, movieTitle) =>
      `fandango://search?q=${encodeURIComponent(movieTitle)}&zip=${zipCode}`,
    bgColor: 'bg-orange-500 hover:bg-orange-600',
    basePrice: 13.00,
  },
  {
    name: 'AMC Theatres',
    logo: '🍿',
    getUrl: (zipCode, movieTitle) => 
      `https://www.amctheatres.com/movies?query=${encodeURIComponent(movieTitle)}`,
    getAppUrl: (zipCode, movieTitle) =>
      `amctheatres://search?query=${encodeURIComponent(movieTitle)}`,
    bgColor: 'bg-red-700 hover:bg-red-800',
    basePrice: 14.50,
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
  const [selectedFormat, setSelectedFormat] = useState<TheaterFormat>('standard');

  const hasSavedZipCode = Boolean(localStorage.getItem(ZIPCODE_STORAGE_KEY));
  const currentFormat = formatOptions.find(f => f.id === selectedFormat)!;

  const handleClearZipCode = () => {
    localStorage.removeItem(ZIPCODE_STORAGE_KEY);
    setZipCode('');
    setShowTheaters(false);
  };

  // Calculate prices based on selected format
  const getEstimatedPrice = useCallback((basePrice: number) => {
    return basePrice * currentFormat.priceMultiplier;
  }, [currentFormat]);

  const sortedTheaters = useMemo(() => {
    return [...theaters].sort((a, b) => {
      const priceA = getEstimatedPrice(a.basePrice);
      const priceB = getEstimatedPrice(b.basePrice);
      return sortAscending ? priceA - priceB : priceB - priceA;
    });
  }, [sortAscending, getEstimatedPrice]);

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

  const handleTheaterClick = useCallback((theater: Theater) => {
    const webUrl = theater.getUrl(zipCode, movieTitle);

    if (isMobileDevice() && theater.getAppUrl) {
      const appUrl = theater.getAppUrl(zipCode, movieTitle);
      // Try native app first; fall back to browser after 1.5s if app not installed
      const fallback = setTimeout(() => {
        window.open(webUrl, '_system');
      }, 1500);
      const handleVisibilityChange = () => {
        if (document.hidden) {
          clearTimeout(fallback);
          document.removeEventListener('visibilitychange', handleVisibilityChange);
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.location.href = appUrl;
      setTimeout(() => document.removeEventListener('visibilitychange', handleVisibilityChange), 2000);
    } else {
      window.open(webUrl, '_system');
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
            {/* Format Selection */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Select Format</Label>
              <div className="grid grid-cols-3 gap-2">
                {formatOptions.map((format) => (
                  <Button
                    key={format.id}
                    type="button"
                    variant={selectedFormat === format.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedFormat(format.id)}
                    className={`flex flex-col items-center gap-0.5 h-auto py-2 ${
                      selectedFormat === format.id 
                        ? 'bg-amber-500 hover:bg-amber-600 text-black' 
                        : ''
                    }`}
                  >
                    <span className="text-base">{format.icon}</span>
                    <span className="text-xs font-medium">{format.name}</span>
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {currentFormat.description}
              </p>
            </div>

            <div className="flex items-center justify-between">
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
                    <span className="text-xs opacity-80">
                      Est. ${getEstimatedPrice(theater.basePrice).toFixed(2)}
                    </span>
                  </span>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              ))}
            </div>

            <p className="text-xs text-muted-foreground/70 text-center py-1 border-t border-border">
              💡 Prices vary by showtime, day & location. Estimates based on avg. {currentFormat.name} pricing.
            </p>

            <Button 
              variant="outline" 
              className="w-full"
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
