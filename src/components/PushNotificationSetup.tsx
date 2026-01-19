import { useState } from 'react';
import { Bell, BellOff, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useToast } from '@/hooks/use-toast';

interface PushNotificationSetupProps {
  showCard?: boolean;
}

export function PushNotificationSetup({ showCard = true }: PushNotificationSetupProps) {
  const { 
    isSupported, 
    isRegistered, 
    token, 
    error, 
    requestPermission, 
    isNative 
  } = usePushNotifications();
  const { toast } = useToast();
  const [isRequesting, setIsRequesting] = useState(false);

  const handleEnableNotifications = async () => {
    setIsRequesting(true);
    const success = await requestPermission();
    setIsRequesting(false);

    if (success) {
      toast({
        title: 'Notifications enabled',
        description: 'You will now receive updates about new reviews and comments.',
      });
    } else {
      toast({
        title: 'Permission denied',
        description: 'Please enable notifications in your device settings.',
        variant: 'destructive',
      });
    }
  };

  // Don't show anything if not on native platform
  if (!isNative) {
    return null;
  }

  if (!showCard) {
    return (
      <Button
        onClick={handleEnableNotifications}
        disabled={isRegistered || isRequesting}
        variant={isRegistered ? 'outline' : 'default'}
        size="sm"
      >
        {isRegistered ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            Notifications On
          </>
        ) : (
          <>
            <Bell className="w-4 h-4 mr-2" />
            {isRequesting ? 'Enabling...' : 'Enable Notifications'}
          </>
        )}
      </Button>
    );
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {isRegistered ? (
            <Bell className="w-5 h-5 text-primary" />
          ) : (
            <BellOff className="w-5 h-5 text-muted-foreground" />
          )}
          Push Notifications
        </CardTitle>
        <CardDescription>
          {isRegistered 
            ? 'You are receiving notifications about new reviews and comments.'
            : 'Get notified when new reviews are posted or someone replies to your comments.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <p className="text-sm text-destructive mb-3 flex items-center gap-1">
            <X className="w-4 h-4" />
            {error}
          </p>
        )}
        
        <Button
          onClick={handleEnableNotifications}
          disabled={isRegistered || isRequesting}
          variant={isRegistered ? 'outline' : 'default'}
          className="w-full"
        >
          {isRegistered ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Notifications Enabled
            </>
          ) : (
            <>
              <Bell className="w-4 h-4 mr-2" />
              {isRequesting ? 'Enabling...' : 'Enable Notifications'}
            </>
          )}
        </Button>

        {isRegistered && token && (
          <p className="text-xs text-muted-foreground mt-2 break-all">
            Device registered for push notifications
          </p>
        )}
      </CardContent>
    </Card>
  );
}
