import { useState } from 'react';
import { Ticket, ExternalLink } from 'lucide-react';
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
}

const theaters: Theater[] = [
  {
    name: 'Fandango',
    logo: '🎟️',
    getUrl: (zipCode, movieTitle) => 
      `https://www.fandango.com/search?q=${encodeURIComponent(movieTitle)}&zipcode=${zipCode}`,
    bgColor: 'bg-orange-500 hover:bg-orange-600',
  },
  {
    name: 'Regal',
    logo: '👑',
    getUrl: (zipCode, movieTitle) => 
      `https://www.regmovies.com/movies?query=${encodeURIComponent(movieTitle)}`,
    bgColor: 'bg-red-600 hover:bg-red-700',
  },
  {
    name: 'Cinemark',
    logo: '🎬',
    getUrl: (zipCode, movieTitle) => 
      `https://www.cinemark.com/search?query=${encodeURIComponent(movieTitle)}`,
    bgColor: 'bg-blue-600 hover:bg-blue-700',
  },
  {
    name: 'AMC Theatres',
    logo: '🍿',
    getUrl: (zipCode, movieTitle) => 
      `https://www.amctheatres.com/movies?query=${encodeURIComponent(movieTitle)}`,
    bgColor: 'bg-red-700 hover:bg-red-800',
  },
  {
    name: 'Atom Tickets',
    logo: '⚛️',
    getUrl: (zipCode, movieTitle) => 
      `https://www.atomtickets.com/movies?postal_code=${zipCode}&query=${encodeURIComponent(movieTitle)}`,
    bgColor: 'bg-purple-600 hover:bg-purple-700',
  },
];

interface BuyTicketsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movieTitle: string;
}

export function BuyTicketsDialog({ open, onOpenChange, movieTitle }: BuyTicketsDialogProps) {
  const [zipCode, setZipCode] = useState('');
  const [showTheaters, setShowTheaters] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic US zip code validation (5 digits)
    const zipRegex = /^\d{5}$/;
    if (!zipRegex.test(zipCode)) {
      setError('Please enter a valid 5-digit zip code');
      return;
    }
    
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
            <p className="text-sm text-muted-foreground text-center mb-4">
              Showing theaters near <span className="font-semibold text-foreground">{zipCode}</span>
            </p>
            <div className="grid gap-2">
              {theaters.map((theater) => (
                <Button
                  key={theater.name}
                  onClick={() => handleTheaterClick(theater)}
                  className={`w-full justify-between ${theater.bgColor} text-white`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{theater.logo}</span>
                    {theater.name}
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
