import { useState } from 'react';
import { Bell, BellOff, Check, X, Loader2 } from 'lucide-react';
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
    isLoading,
    requestPermission, 
    disableNotifications,
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

  const handleDisableNotifications = async () => {
    setIsRequesting(true);
    const success = await disableNotifications();
    setIsRequesting(false);

    if (success) {
      toast({
        title: 'Notifications disabled',
        description: 'You will no longer receive push notifications.',
      });
    } else {
      toast({
        title: 'Error',
        description: 'Failed to disable notifications. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Don't show anything if not on native platform
  if (!isNative) {
    return null;
  }

  // Show loading state while checking persisted preference
  if (isLoading) {
    if (!showCard) {
      return (
        <Button variant="outline" size="sm" disabled>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Loading...
        </Button>
      );
    }
    return (
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            Push Notifications
          </CardTitle>
          <CardDescription>Loading notification preferences...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!showCard) {
    return (
      <Button
        onClick={isRegistered ? handleDisableNotifications : handleEnableNotifications}
        disabled={isRequesting}
        variant={isRegistered ? 'outline' : 'default'}
        size="sm"
      >
        {isRequesting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {isRegistered ? 'Disabling...' : 'Enabling...'}
          </>
        ) : isRegistered ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            Notifications On
          </>
        ) : (
          <>
            <Bell className="w-4 h-4 mr-2" />
            Enable Notifications
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
          onClick={isRegistered ? handleDisableNotifications : handleEnableNotifications}
          disabled={isRequesting}
          variant={isRegistered ? 'destructive' : 'default'}
          className="w-full"
        >
          {isRequesting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isRegistered ? 'Disabling...' : 'Enabling...'}
            </>
          ) : isRegistered ? (
            <>
              <BellOff className="w-4 h-4 mr-2" />
              Disable Notifications
            </>
          ) : (
            <>
              <Bell className="w-4 h-4 mr-2" />
              Enable Notifications
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
