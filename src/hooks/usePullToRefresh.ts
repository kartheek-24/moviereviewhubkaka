import { useEffect, useRef, useState } from 'react';

const THRESHOLD = 75;

// scrollSelector: CSS selector for a custom scroll container (e.g. Radix ScrollArea viewport).
// If omitted, falls back to window.scrollY.
export function usePullToRefresh(onRefresh: () => void, scrollSelector?: string) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef(0);
  const pullingRef = useRef(false);
  const distanceRef = useRef(0);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  useEffect(() => {
    const getScrollTop = () => {
      if (scrollSelector) {
        return (document.querySelector(scrollSelector) as HTMLElement | null)?.scrollTop ?? 0;
      }
      return window.scrollY;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (getScrollTop() === 0) {
        startYRef.current = e.touches[0].clientY;
        pullingRef.current = true;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!pullingRef.current) return;
      const dy = e.touches[0].clientY - startYRef.current;
      if (dy > 0) {
        distanceRef.current = Math.min(dy * 0.5, THRESHOLD * 1.5);
        setPullDistance(distanceRef.current);
      }
    };

    const onTouchEnd = () => {
      if (!pullingRef.current) return;
      pullingRef.current = false;
      if (distanceRef.current >= THRESHOLD) {
        setIsRefreshing(true);
        onRefreshRef.current();
        setTimeout(() => setIsRefreshing(false), 1200);
      }
      distanceRef.current = 0;
      setPullDistance(0);
    };

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd);

    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [scrollSelector]);

  return { pullDistance, isRefreshing };
}
