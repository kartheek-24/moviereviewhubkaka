import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';

// Store the deferred prompt globally so it persists across component re-renders
let deferredPrompt: BeforeInstallPromptEvent | null = null;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstallPrompt() {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone === true;
    
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if we already have a deferred prompt
    if (deferredPrompt) {
      setCanInstall(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event so it can be triggered later
      deferredPrompt = e as BeforeInstallPromptEvent;
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      deferredPrompt = null;
      setCanInstall(false);
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;

    // Clear the deferred prompt - it can only be used once
    deferredPrompt = null;
    setCanInstall(false);

    return outcome === 'accepted';
  }, []);

  return { canInstall, isInstalled, promptInstall };
}

// Track install attempts for analytics
export async function trackInstallAttempt(
  deviceId: string,
  userId: string | null,
  outcome: 'prompted' | 'accepted' | 'dismissed' | 'fallback',
  source: 'floating_button' | 'settings' = 'floating_button'
) {
  try {
    const platform = navigator.userAgent.includes('Android') 
      ? 'android' 
      : navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')
        ? 'ios'
        : 'desktop';

    await supabase.from('pwa_install_attempts').insert({
      device_id: deviceId,
      user_id: userId,
      outcome,
      platform,
      source,
    });
  } catch (error) {
    console.error('Failed to track install attempt:', error);
  }
}

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

// Hook to fetch install attempt analytics
export interface InstallAttemptStats {
  totalPrompted: number;
  totalAccepted: number;
  totalDismissed: number;
  totalFallback: number;
  conversionRate: number;
}

export function useInstallAttemptStats() {
  const [stats, setStats] = useState<InstallAttemptStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data, error } = await supabase
          .from('pwa_install_attempts')
          .select('outcome');

        if (error) throw error;

        const counts = {
          prompted: 0,
          accepted: 0,
          dismissed: 0,
          fallback: 0,
        };

        data?.forEach((attempt: { outcome: string }) => {
          if (attempt.outcome in counts) {
            counts[attempt.outcome as keyof typeof counts]++;
          }
        });

        const totalPrompted = counts.prompted + counts.accepted + counts.dismissed;
        const conversionRate = totalPrompted > 0 
          ? (counts.accepted / totalPrompted) * 100 
          : 0;

        setStats({
          totalPrompted,
          totalAccepted: counts.accepted,
          totalDismissed: counts.dismissed,
          totalFallback: counts.fallback,
          conversionRate,
        });
      } catch (error) {
        console.error('Failed to fetch install attempt stats:', error);
        setStats(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, isLoading };
}
