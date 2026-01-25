import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNotificationPreferences } from './useNotificationPreferences';

const LAST_SEEN_KEY = 'moviereviewhub_last_seen';

export function useUnreadNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { preferences } = useNotificationPreferences();

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
      let totalCount = 0;
      
      // Count new reviews since last seen (if enabled)
      if (preferences.showReviews) {
        const { count: reviewCount, error: reviewError } = await supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true })
          .gt('created_at', lastSeen.toISOString());

        if (reviewError) throw reviewError;
        totalCount += reviewCount || 0;
      }

      // Count new comments since last seen (if enabled)
      if (preferences.showComments) {
        const { count: commentCount, error: commentError } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .gt('created_at', lastSeen.toISOString());

        if (commentError) throw commentError;
        totalCount += commentCount || 0;
      }

      setUnreadCount(totalCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getLastSeen, preferences.showReviews, preferences.showComments]);

  useEffect(() => {
    fetchUnreadCount();

    // Subscribe to realtime updates for new reviews
    const reviewChannel = supabase
      .channel('unread-reviews')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'reviews' },
        () => {
          if (preferences.showReviews) {
            setUnreadCount(prev => prev + 1);
          }
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
          if (preferences.showComments) {
            setUnreadCount(prev => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(reviewChannel);
      supabase.removeChannel(commentChannel);
    };
  }, [fetchUnreadCount, preferences.showReviews, preferences.showComments]);

  return {
    unreadCount,
    isLoading,
    markAllAsRead,
    refetch: fetchUnreadCount,
    lastSeen: getLastSeen(),
    preferences,
  };
}
