import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';

export function usePWAInstallTracker() {
  const { deviceId } = useApp();
  const { user } = useAuth();

  useEffect(() => {
    const handleAppInstalled = async () => {
      try {
        // Get platform info
        const platform = navigator.userAgent.includes('Android') 
          ? 'android' 
          : navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')
            ? 'ios'
            : 'desktop';

        await supabase.from('pwa_installs').upsert({
          device_id: deviceId,
          user_id: user?.id || null,
          platform,
        }, {
          onConflict: 'device_id',
        });
      } catch (error) {
        console.error('Failed to track PWA install:', error);
      }
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [deviceId, user?.id]);
}

export function usePWAInstallCount() {
  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const { count: installCount, error } = await supabase
          .from('pwa_installs')
          .select('*', { count: 'exact', head: true });

        if (error) throw error;
        setCount(installCount || 0);
      } catch (error) {
        console.error('Failed to fetch PWA install count:', error);
        setCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCount();
  }, []);

  return { count, isLoading };
}
