import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Review } from '@/services/reviewService';

export function useRealtimeReviews() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('reviews-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reviews',
        },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          // Invalidate all review queries to refetch with current filters/sorting
          queryClient.invalidateQueries({ queryKey: ['reviews'] });
          queryClient.invalidateQueries({ queryKey: ['languages'] });

          // Update specific review if it exists in cache
          if (eventType === 'UPDATE' && newRecord) {
            queryClient.setQueryData<Review>(['review', (newRecord as Review).id], (oldData) => {
              if (!oldData) return oldData;
              return { ...oldData, ...(newRecord as Review) };
            });
          }

          // Remove deleted review from cache
          if (eventType === 'DELETE' && oldRecord) {
            queryClient.removeQueries({ queryKey: ['review', (oldRecord as Review).id] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
