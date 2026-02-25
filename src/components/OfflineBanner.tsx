import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-destructive/95 text-destructive-foreground flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5"
      style={{ paddingBottom: 'calc(0.625rem + env(safe-area-inset-bottom))' }}
    >
      <WifiOff className="h-4 w-4 shrink-0" />
      You're offline — check your connection
    </div>
  );
}
