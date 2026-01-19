import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { 
  PushNotifications, 
  PushNotificationSchema,
  ActionPerformed,
  Token,
} from '@capacitor/push-notifications';

export interface PushNotificationState {
  isSupported: boolean;
  isRegistered: boolean;
  token: string | null;
  error: string | null;
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isRegistered: false,
    token: null,
    error: null,
  });
  const [notifications, setNotifications] = useState<PushNotificationSchema[]>([]);

  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (!isNative) {
      setState(prev => ({ ...prev, isSupported: false }));
      return;
    }

    setState(prev => ({ ...prev, isSupported: true }));

    // Listen for registration success
    const tokenListener = PushNotifications.addListener('registration', (token: Token) => {
      console.log('Push registration success, token:', token.value);
      setState(prev => ({
        ...prev,
        isRegistered: true,
        token: token.value,
        error: null,
      }));
    });

    // Listen for registration errors
    const errorListener = PushNotifications.addListener('registrationError', (error) => {
      console.error('Push registration error:', error);
      setState(prev => ({
        ...prev,
        isRegistered: false,
        error: error.error,
      }));
    });

    // Listen for push notifications received while app is in foreground
    const notificationListener = PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('Push notification received:', notification);
        setNotifications(prev => [...prev, notification]);
      }
    );

    // Listen for notification actions (when user taps on notification)
    const actionListener = PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (action: ActionPerformed) => {
        console.log('Push notification action performed:', action);
        // Handle navigation or other actions based on notification data
        const { notification } = action;
        if (notification.data?.reviewId) {
          // Navigate to review - implement based on your routing
          window.location.href = `/review/${notification.data.reviewId}`;
        }
      }
    );

    // Cleanup listeners on unmount
    return () => {
      tokenListener.then(l => l.remove());
      errorListener.then(l => l.remove());
      notificationListener.then(l => l.remove());
      actionListener.then(l => l.remove());
    };
  }, [isNative]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isNative) {
      console.log('Push notifications not supported on web');
      return false;
    }

    try {
      // Check current permission status
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        // Request permission
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        setState(prev => ({
          ...prev,
          error: 'Push notification permission denied',
        }));
        return false;
      }

      // Register with APNs/FCM
      await PushNotifications.register();
      return true;
    } catch (err: any) {
      console.error('Error requesting push permission:', err);
      setState(prev => ({
        ...prev,
        error: err.message || 'Failed to request push permission',
      }));
      return false;
    }
  }, [isNative]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    ...state,
    notifications,
    requestPermission,
    clearNotifications,
    isNative,
  };
}
