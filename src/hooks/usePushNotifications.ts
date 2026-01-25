import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { 
  PushNotifications, 
  PushNotificationSchema,
  ActionPerformed,
  Token,
} from '@capacitor/push-notifications';
import { supabase } from '@/integrations/supabase/client';

export interface PushNotificationState {
  isSupported: boolean;
  isRegistered: boolean;
  token: string | null;
  error: string | null;
  isLoading: boolean;
}

// Get device ID from localStorage (same as AppContext)
function getDeviceId(): string {
  const stored = localStorage.getItem('deviceId');
  if (stored) return stored;
  
  const newId = 'device_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  localStorage.setItem('deviceId', newId);
  return newId;
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isRegistered: false,
    token: null,
    error: null,
    isLoading: true,
  });
  const [notifications, setNotifications] = useState<PushNotificationSchema[]>([]);

  const isNative = Capacitor.isNativePlatform();
  const deviceId = getDeviceId();

  // Load persisted push notification state from database
  useEffect(() => {
    async function loadPersistedState() {
      if (!isNative) {
        setState(prev => ({ ...prev, isSupported: false, isLoading: false }));
        return;
      }

      try {
        const { data, error } = await supabase
          .from('devices')
          .select('push_enabled, push_token')
          .eq('id', deviceId)
          .maybeSingle();

        if (error) {
          console.error('Error loading push state:', error);
          setState(prev => ({ ...prev, isSupported: true, isLoading: false }));
          return;
        }

        if (data?.push_enabled && data?.push_token) {
          // Device was previously registered, restore state
          setState({
            isSupported: true,
            isRegistered: true,
            token: data.push_token,
            error: null,
            isLoading: false,
          });
          // Re-register to ensure token is still valid
          await PushNotifications.register();
        } else {
          setState(prev => ({ ...prev, isSupported: true, isLoading: false }));
        }
      } catch (err) {
        console.error('Error loading persisted push state:', err);
        setState(prev => ({ ...prev, isSupported: true, isLoading: false }));
      }
    }

    loadPersistedState();
  }, [isNative, deviceId]);

  // Set up push notification listeners
  useEffect(() => {
    if (!isNative) {
      return;
    }

    // Listen for registration success
    const tokenListener = PushNotifications.addListener('registration', async (token: Token) => {
      console.log('Push registration success, token:', token.value);
      
      // Persist token to database
      try {
        await supabase.rpc('register_device', {
          p_device_id: deviceId,
          p_platform: Capacitor.getPlatform(),
          p_push_enabled: true,
          p_push_token: token.value,
        });
      } catch (err) {
        console.error('Error persisting push token:', err);
      }

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
  }, [isNative, deviceId]);

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

  const disableNotifications = useCallback(async (): Promise<boolean> => {
    if (!isNative) {
      return false;
    }

    try {
      // Update database to disable push
      await supabase.rpc('update_device_push', {
        p_device_id: deviceId,
        p_push_enabled: false,
      });

      setState(prev => ({
        ...prev,
        isRegistered: false,
        token: null,
      }));

      return true;
    } catch (err: any) {
      console.error('Error disabling push notifications:', err);
      return false;
    }
  }, [isNative, deviceId]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    ...state,
    notifications,
    requestPermission,
    disableNotifications,
    clearNotifications,
    isNative,
  };
}
