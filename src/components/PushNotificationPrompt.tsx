import { useState, useEffect } from 'react';
import { Bell, BellOff, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const NEVER_ASK_KEY = 'push_notification_never_ask';
const PUSH_ENABLED_KEY = 'push_notifications_enabled';

interface PushNotificationPromptProps {
  onEnableNotifications?: () => Promise<boolean>;
}

export function PushNotificationPrompt({ onEnableNotifications }: PushNotificationPromptProps) {
  const [open, setOpen] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    // Check if we should show the prompt
    const neverAsk = localStorage.getItem(NEVER_ASK_KEY) === 'true';
    const alreadyEnabled = localStorage.getItem(PUSH_ENABLED_KEY) === 'true';
    
    // Check browser notification permission
    const hasNativePermission = 'Notification' in window && Notification.permission === 'granted';
    
    if (!neverAsk && !alreadyEnabled && !hasNativePermission) {
      // Small delay to not interrupt initial app load
      const timer = setTimeout(() => {
        setOpen(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleEnableNotifications = async () => {
    setIsRequesting(true);
    
    try {
      // Request browser notification permission
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          localStorage.setItem(PUSH_ENABLED_KEY, 'true');
          
          // Call custom handler if provided
          if (onEnableNotifications) {
            await onEnableNotifications();
          }
          
          // Show a test notification
          new Notification('MovieReviewHub', {
            body: 'Notifications enabled! You\'ll be notified when new reviews are added.',
            icon: '/favicon.png',
          });
          
          setOpen(false);
        }
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleNeverAsk = () => {
    localStorage.setItem(NEVER_ASK_KEY, 'true');
    setOpen(false);
  };

  const handleMaybeLater = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <Bell className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <DialogTitle className="text-center text-xl">
            Stay Updated!
          </DialogTitle>
          <DialogDescription className="text-center space-y-2">
            <p>
              Enable push notifications to be the first to know when new movie reviews are added.
            </p>
            <p className="text-xs text-muted-foreground">
              You can change this anytime in settings.
            </p>
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={handleEnableNotifications}
            disabled={isRequesting}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Bell className="w-4 h-4 mr-2" />
            {isRequesting ? 'Enabling...' : 'Enable Notifications'}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleMaybeLater}
            className="w-full"
          >
            Maybe Later
          </Button>
          
          <Button
            variant="ghost"
            onClick={handleNeverAsk}
            className="w-full text-muted-foreground hover:text-foreground"
          >
            <BellOff className="w-4 h-4 mr-2" />
            Never Ask Again
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
