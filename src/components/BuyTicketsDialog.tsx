import { useState, useMemo, useEffect } from 'react';
import { Ticket, ExternalLink, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
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
  bgColor: string;
  avgPrice: number; // Average ticket price in USD
}

const theaters: Theater[] = [
  {
    name: 'Cinemark',
    logo: '🎬',
    getUrl: (zipCode, movieTitle) => 
      `https://www.cinemark.com/search?query=${encodeURIComponent(movieTitle)}`,
    bgColor: 'bg-blue-600 hover:bg-blue-700',
    avgPrice: 10.50,
  },
  {
    name: 'Regal',
    logo: '👑',
    getUrl: (zipCode, movieTitle) => 
      `https://www.regmovies.com/movies?query=${encodeURIComponent(movieTitle)}`,
    bgColor: 'bg-red-600 hover:bg-red-700',
    avgPrice: 12.00,
  },
  {
    name: 'Atom Tickets',
    logo: '⚛️',
    getUrl: (zipCode, movieTitle) => 
      `https://www.atomtickets.com/movies?postal_code=${zipCode}&query=${encodeURIComponent(movieTitle)}`,
    bgColor: 'bg-purple-600 hover:bg-purple-700',
    avgPrice: 12.50,
  },
  {
    name: 'Fandango',
    logo: '🎟️',
    getUrl: (zipCode, movieTitle) => 
      `https://www.fandango.com/search?q=${encodeURIComponent(movieTitle)}&zipcode=${zipCode}`,
    bgColor: 'bg-orange-500 hover:bg-orange-600',
    avgPrice: 13.00,
  },
  {
    name: 'AMC Theatres',
    logo: '🍿',
    getUrl: (zipCode, movieTitle) => 
      `https://www.amctheatres.com/movies?query=${encodeURIComponent(movieTitle)}`,
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

  const handleTheaterClick = (theater: Theater) => {
    const url = theater.getUrl(zipCode, movieTitle);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

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
              <Label htmlFor="zipcode">Zip Code</Label>
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
            <div className="flex items-center justify-between mb-4">
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
                Price: {sortAscending ? 'Low → High' : 'High → Low'}
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
                    <span className="text-xs opacity-80">~${theater.avgPrice.toFixed(2)}</span>
                  </span>
                  <ExternalLink className="h-4 w-4" />
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
