import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchReviews, 
  fetchReviewById, 
  fetchCommentsByReviewId,
  fetchLanguages,
  createComment,
  deleteComment,
  reportComment,
  createHelpfulVote,
  checkHelpfulVote,
  createReview,
  updateReview,
  deleteReview,
  fetchReportedComments,
  fetchUserReactions,
  toggleCommentReaction,
  Review,
  Comment,
  ReactionType,
} from '@/services/reviewService';
import { SortOption } from '@/types';
import { useToast } from '@/hooks/use-toast';

// Hook to fetch all reviews
export function useReviews(options?: {
  language?: string | null;
  searchQuery?: string;
  sortBy?: SortOption;
}) {
  return useQuery({
    queryKey: ['reviews', options?.language, options?.searchQuery, options?.sortBy],
    queryFn: () => fetchReviews(options),
    staleTime: 1000 * 60, // 1 minute
  });
}

// Hook to fetch a single review
export function useReview(id: string | undefined) {
  return useQuery({
    queryKey: ['review', id],
    queryFn: () => fetchReviewById(id!),
    enabled: !!id,
  });
}

// Hook to fetch comments for a review
export function useComments(reviewId: string | undefined) {
  return useQuery({
    queryKey: ['comments', reviewId],
    queryFn: () => fetchCommentsByReviewId(reviewId!),
    enabled: !!reviewId,
  });
}

// Hook to fetch user reactions for comments
export function useUserReactions(
  commentIds: string[],
  userId: string | null,
  deviceId: string | undefined
) {
  return useQuery({
    queryKey: ['userReactions', commentIds, userId, deviceId],
    queryFn: () => fetchUserReactions(commentIds, userId, deviceId!),
    enabled: commentIds.length > 0 && !!deviceId,
  });
}

// Hook to toggle comment reaction with optimistic updates
export function useToggleCommentReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, reactionType, userId, deviceId }: {
      commentId: string;
      reactionType: ReactionType;
      userId: string | null;
      deviceId: string;
      reviewId: string;
    }) => toggleCommentReaction(commentId, reactionType, userId, deviceId),
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['comments', variables.reviewId] });
      await queryClient.cancelQueries({ queryKey: ['userReactions'], exact: false });

      // Snapshot the previous values
      const previousComments = queryClient.getQueryData<Comment[]>(['comments', variables.reviewId]);

      // Get current user reaction for this comment from all userReactions queries
      const allReactionsQueries = queryClient.getQueriesData<Array<{ comment_id: string; reaction_type: ReactionType }>>({ 
        queryKey: ['userReactions'] 
      });
      let currentReaction: ReactionType | undefined;
      for (const [, data] of allReactionsQueries) {
        const found = data?.find(r => r.comment_id === variables.commentId);
        if (found) {
          currentReaction = found.reaction_type;
          break;
        }
      }

      // Optimistically update comments
      if (previousComments) {
        queryClient.setQueryData<Comment[]>(['comments', variables.reviewId], (old) => {
          if (!old) return old;
          return old.map(comment => {
            if (comment.id !== variables.commentId) return comment;

            let newLikeCount = comment.like_count;
            let newDislikeCount = comment.dislike_count;
            let newLoveCount = comment.love_count;

            // If clicking the same reaction, remove it
            if (currentReaction === variables.reactionType) {
              if (variables.reactionType === 'like') newLikeCount = Math.max(0, newLikeCount - 1);
              if (variables.reactionType === 'dislike') newDislikeCount = Math.max(0, newDislikeCount - 1);
              if (variables.reactionType === 'love') newLoveCount = Math.max(0, newLoveCount - 1);
            } else {
              // Remove old reaction count if exists
              if (currentReaction === 'like') newLikeCount = Math.max(0, newLikeCount - 1);
              if (currentReaction === 'dislike') newDislikeCount = Math.max(0, newDislikeCount - 1);
              if (currentReaction === 'love') newLoveCount = Math.max(0, newLoveCount - 1);

              // Add new reaction count
              if (variables.reactionType === 'like') newLikeCount += 1;
              if (variables.reactionType === 'dislike') newDislikeCount += 1;
              if (variables.reactionType === 'love') newLoveCount += 1;
            }

            return { 
              ...comment, 
              like_count: newLikeCount,
              dislike_count: newDislikeCount,
              love_count: newLoveCount,
            };
          });
        });
      }

      return { previousComments };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousComments) {
        queryClient.setQueryData(['comments', variables.reviewId], context.previousComments);
      }
    },
    onSettled: (_, __, variables) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['comments', variables.reviewId] });
      queryClient.invalidateQueries({ queryKey: ['userReactions'], exact: false });
    },
  });
}

// Hook to fetch available languages
export function useLanguages() {
  return useQuery({
    queryKey: ['languages'],
    queryFn: fetchLanguages,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook to check if user has voted
export function useHasVoted(reviewId: string | undefined, voterId: string | undefined) {
  return useQuery({
    queryKey: ['hasVoted', reviewId, voterId],
    queryFn: () => checkHelpfulVote(reviewId!, voterId!),
    enabled: !!reviewId && !!voterId,
  });
}

// Hook to create a comment
export function useCreateComment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createComment,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['comments', data.review_id] });
      queryClient.invalidateQueries({ queryKey: ['review', data.review_id] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast({
        title: 'Comment posted',
        description: 'Your comment has been added successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to post comment. Please try again.',
        variant: 'destructive',
      });
    },
  });
}

// Hook to delete a comment
export function useDeleteComment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ commentId, reviewId }: { commentId: string; reviewId: string }) => 
      deleteComment(commentId).then(() => reviewId),
    onSuccess: (reviewId) => {
      queryClient.invalidateQueries({ queryKey: ['comments', reviewId] });
      queryClient.invalidateQueries({ queryKey: ['review', reviewId] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast({
        title: 'Comment deleted',
        description: 'The comment has been removed.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete comment.',
        variant: 'destructive',
      });
    },
  });
}

// Hook to report a comment
export function useReportComment() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ commentId, reason }: { commentId: string; reason?: string }) =>
      reportComment(commentId, reason),
    onSuccess: () => {
      toast({
        title: 'Comment reported',
        description: 'Thank you for helping keep our community safe.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to report comment.',
        variant: 'destructive',
      });
    },
  });
}

// Hook to create a helpful vote
export function useCreateHelpfulVote() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ reviewId, voterUserId, voterDeviceId }: { 
      reviewId: string; 
      voterUserId: string | null; 
      voterDeviceId: string;
    }) => createHelpfulVote(reviewId, voterUserId, voterDeviceId),
    onSuccess: (result, variables) => {
      if (result.alreadyVoted) {
        toast({
          title: 'Already voted',
          description: 'You have already marked this review as helpful.',
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ['review', variables.reviewId] });
        queryClient.invalidateQueries({ queryKey: ['reviews'] });
        queryClient.invalidateQueries({ queryKey: ['hasVoted', variables.reviewId] });
        toast({
          title: 'Thanks!',
          description: 'Glad you found this review helpful.',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to record vote.',
        variant: 'destructive',
      });
    },
  });
}

// Admin hooks
export function useCreateReview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['languages'] });
      toast({
        title: 'Review created',
        description: 'Your review has been published.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create review.',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, review }: { id: string; review: Partial<Review> }) => 
      updateReview(id, review),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review', data.id] });
      toast({
        title: 'Review updated',
        description: 'Your changes have been saved.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update review.',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast({
        title: 'Review deleted',
        description: 'The review has been removed.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete review.',
        variant: 'destructive',
      });
    },
  });
}

export function useReportedComments() {
  return useQuery({
    queryKey: ['reportedComments'],
    queryFn: fetchReportedComments,
  });
}
