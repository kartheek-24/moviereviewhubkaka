import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Comment } from '@/services/reviewService';

export function useRealtimeComments(reviewId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!reviewId) return;

    const channel = supabase
      .channel(`comments-${reviewId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `review_id=eq.${reviewId}`,
        },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          queryClient.setQueryData<Comment[]>(['comments', reviewId], (oldData) => {
            if (!oldData) return oldData;

            switch (eventType) {
              case 'INSERT':
                // Add new comment if not already present
                if (!oldData.find(c => c.id === (newRecord as Comment).id)) {
                  return [newRecord as Comment, ...oldData];
                }
                return oldData;

              case 'UPDATE':
                // Update existing comment (includes reaction count updates)
                return oldData.map(comment =>
                  comment.id === (newRecord as Comment).id
                    ? { ...comment, ...(newRecord as Comment) }
                    : comment
                );

              case 'DELETE':
                // Remove deleted comment
                return oldData.filter(comment => comment.id !== (oldRecord as Comment).id);

              default:
                return oldData;
            }
          });

          // Also invalidate to ensure consistency
          if (eventType === 'INSERT' || eventType === 'DELETE') {
            queryClient.invalidateQueries({ queryKey: ['review', reviewId] });
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [reviewId, queryClient]);
}
