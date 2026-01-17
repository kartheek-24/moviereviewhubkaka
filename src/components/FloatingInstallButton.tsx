import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InstallAppGuide } from './InstallAppGuide';
import { usePWAInstallPrompt, trackInstallAttempt } from '@/hooks/usePWAInstall';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';

const STORAGE_KEY = 'pwa_install_dismissed';
const DISMISS_DURATION_DAYS = 7;

export function FloatingInstallButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const { canInstall, isInstalled, promptInstall } = usePWAInstallPrompt();
  const { toast } = useToast();
  const { deviceId } = useApp();
  const { user } = useAuth();

  useEffect(() => {
    // Hide if already installed
    if (isInstalled) {
      setIsVisible(false);
      return;
    }

    // Check if user dismissed recently
    const dismissedAt = localStorage.getItem(STORAGE_KEY);
    if (dismissedAt) {
      const dismissDate = new Date(dismissedAt);
      const now = new Date();
      const daysSinceDismiss = (now.getTime() - dismissDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceDismiss < DISMISS_DURATION_DAYS) {
        setIsVisible(false);
        return;
      }
    }

    // Show after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isInstalled]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    setIsVisible(false);
  };

  const handleClick = async () => {
    // If native install prompt is available, use it
    if (canInstall) {
      setIsInstalling(true);
      
      // Track that we prompted
      await trackInstallAttempt(deviceId, user?.id || null, 'prompted', 'floating_button');
      
      try {
        const accepted = await promptInstall();
        
        // Track the outcome
        await trackInstallAttempt(
          deviceId, 
          user?.id || null, 
          accepted ? 'accepted' : 'dismissed', 
          'floating_button'
        );
        
        if (accepted) {
          toast({
            title: 'Installing...',
            description: 'The app is being installed on your device.',
          });
          setIsVisible(false);
        } else {
          toast({
            title: 'Installation cancelled',
            description: 'You can install the app anytime from Settings.',
          });
        }
      } catch (error) {
        console.error('Install error:', error);
        // Fallback to guide if something goes wrong
        await trackInstallAttempt(deviceId, user?.id || null, 'fallback', 'floating_button');
        setGuideOpen(true);
      } finally {
        setIsInstalling(false);
      }
    } else {
      // Fallback: Show manual installation guide (for iOS Safari, etc.)
      await trackInstallAttempt(deviceId, user?.id || null, 'fallback', 'floating_button');
      setGuideOpen(true);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="fixed bottom-20 right-4 z-50 animate-slide-in-right">
        <div className="relative group">
          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="absolute -top-2 -right-2 w-6 h-6 bg-muted hover:bg-destructive rounded-full flex items-center justify-center transition-colors shadow-lg z-10"
            aria-label="Dismiss install prompt"
          >
            <X className="w-3 h-3 text-foreground" />
          </button>
          
          {/* Main button */}
          <Button
            onClick={handleClick}
            disabled={isInstalling}
            className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90 text-primary-foreground pr-4 pl-3 py-5 rounded-full"
          >
            <div className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center">
              <Download className={`w-4 h-4 ${isInstalling ? 'animate-pulse' : 'animate-bounce'}`} />
            </div>
            <span className="font-medium text-sm">
              {isInstalling ? 'Installing...' : 'Install App'}
            </span>
          </Button>
        </div>
      </div>

      <InstallAppGuide open={guideOpen} onOpenChange={setGuideOpen} />
    </>
  );
}
