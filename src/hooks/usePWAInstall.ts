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

export interface PlatformBreakdown {
  platform: string;
  count: number;
  fill: string;
}

const PLATFORM_COLORS: Record<string, string> = {
  android: 'hsl(160, 60%, 45%)',
  ios: 'hsl(220, 70%, 50%)',
  desktop: 'hsl(38, 92%, 50%)',
};

const PLATFORM_LABELS: Record<string, string> = {
  android: 'Android',
  ios: 'iOS',
  desktop: 'Desktop',
};

export function usePWAInstallsByPlatform() {
  const [data, setData] = useState<PlatformBreakdown[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlatformBreakdown = async () => {
      try {
        const { data: installs, error } = await supabase
          .from('pwa_installs')
          .select('platform');

        if (error) throw error;

        // Count by platform
        const counts: Record<string, number> = {};
        installs?.forEach((install) => {
          const platform = install.platform || 'desktop';
          counts[platform] = (counts[platform] || 0) + 1;
        });

        // Transform to chart data
        const breakdown: PlatformBreakdown[] = Object.entries(counts).map(([platform, count]) => ({
          platform: PLATFORM_LABELS[platform] || platform,
          count,
          fill: PLATFORM_COLORS[platform] || 'hsl(280, 60%, 50%)',
        }));

        setData(breakdown);
      } catch (error) {
        console.error('Failed to fetch PWA platform breakdown:', error);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlatformBreakdown();
  }, []);

  return { data, isLoading };
}
