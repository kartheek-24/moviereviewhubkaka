import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const LAST_SEEN_KEY = 'moviereviewhub_last_seen';

export function useUnreadNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const getLastSeen = useCallback(() => {
    const stored = localStorage.getItem(LAST_SEEN_KEY);
    return stored ? new Date(stored) : new Date(0);
  }, []);

  const markAllAsRead = useCallback(() => {
    localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
    setUnreadCount(0);
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const lastSeen = getLastSeen();
      
      // Count new reviews since last seen
      const { count: reviewCount, error: reviewError } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .gt('created_at', lastSeen.toISOString());

      if (reviewError) throw reviewError;

      // Count new comments since last seen
      const { count: commentCount, error: commentError } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .gt('created_at', lastSeen.toISOString());

      if (commentError) throw commentError;

      setUnreadCount((reviewCount || 0) + (commentCount || 0));
    } catch (error) {
      console.error('Error fetching unread count:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getLastSeen]);

  useEffect(() => {
    fetchUnreadCount();

    // Subscribe to realtime updates for new reviews
    const reviewChannel = supabase
      .channel('unread-reviews')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'reviews' },
        () => {
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    // Subscribe to realtime updates for new comments
    const commentChannel = supabase
      .channel('unread-comments')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments' },
        () => {
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(reviewChannel);
      supabase.removeChannel(commentChannel);
    };
  }, [fetchUnreadCount]);

  return {
    unreadCount,
    isLoading,
    markAllAsRead,
    refetch: fetchUnreadCount,
  };
}
