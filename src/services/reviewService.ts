import { supabase } from '@/integrations/supabase/client';
import { SortOption } from '@/types';

export interface Review {
  id: string;
  title: string;
  title_lower: string;
  language: string;
  rating: number;
  snippet: string;
  content: string;
  poster_url: string | null;
  tags: string[] | null;
  release_date: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  comment_count: number;
  helpful_count: number;
}

export interface Comment {
  id: string;
  review_id: string;
  text: string;
  is_anonymous: boolean;
  display_name: string;
  user_id: string | null;
  device_id: string | null;
  created_at: string;
  reported: boolean;
  reported_reason: string | null;
  parent_id: string | null;
  like_count: number;
  dislike_count: number;
  love_count: number;
}

export type ReactionType = 'like' | 'dislike' | 'love';

export interface CommentReaction {
  id: string;
  comment_id: string;
  reaction_type: ReactionType;
  user_id: string | null;
  device_id: string | null;
  created_at: string;
}

export interface HelpfulVote {
  id: string;
  review_id: string;
  voter_user_id: string | null;
  voter_device_id: string | null;
  created_at: string;
}

// Fetch all reviews with optional filters
export async function fetchReviews(options?: {
  language?: string | null;
  searchQuery?: string;
  sortBy?: SortOption;
}) {
  let query = supabase.from('reviews').select('*');

  // Filter by language
  if (options?.language) {
    query = query.eq('language', options.language);
  }

  // Search by title
  if (options?.searchQuery) {
    query = query.ilike('title_lower', `%${options.searchQuery.toLowerCase()}%`);
  }

  // Sort
  switch (options?.sortBy) {
    case 'highest-rated':
      query = query.order('rating', { ascending: false });
      break;
    case 'most-commented':
      query = query.order('comment_count', { ascending: false });
      break;
    case 'most-helpful':
      query = query.order('helpful_count', { ascending: false });
      break;
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

  const { data, error } = await query;
  
  if (error) throw error;
  return data as Review[];
}

// Fetch single review by ID
export async function fetchReviewById(id: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Review;
}

// Fetch comments for a review
export async function fetchCommentsByReviewId(reviewId: string) {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('review_id', reviewId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Comment[];
}

// Create a comment (with optional parent_id for replies)
export async function createComment(comment: {
  review_id: string;
  text: string;
  is_anonymous: boolean;
  display_name: string;
  user_id: string | null;
  device_id: string | null;
  parent_id?: string | null;
}) {
  const { data, error } = await supabase
    .from('comments')
    .insert(comment)
    .select()
    .single();

  if (error) throw error;
  return data as Comment;
}

// Fetch user's reactions for comments
export async function fetchUserReactions(
  commentIds: string[],
  userId: string | null,
  deviceId: string
) {
  // Build the filter based on what identifiers we have
  let query = supabase
    .from('comment_reactions')
    .select('*')
    .in('comment_id', commentIds);

  if (userId) {
    query = query.or(`user_id.eq.${userId},device_id.eq.${deviceId}`);
  } else {
    query = query.eq('device_id', deviceId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as CommentReaction[];
}

// Toggle reaction on a comment
export async function toggleCommentReaction(
  commentId: string,
  reactionType: ReactionType,
  userId: string | null,
  deviceId: string
) {
  // Build the filter based on what identifiers we have
  let filterQuery;
  if (userId) {
    filterQuery = `user_id.eq.${userId},device_id.eq.${deviceId}`;
  } else {
    filterQuery = `device_id.eq.${deviceId}`;
  }

  // Check if user already has a reaction on this comment
  const { data: existingReaction, error: fetchError } = await supabase
    .from('comment_reactions')
    .select('*')
    .eq('comment_id', commentId)
    .or(userId ? `user_id.eq.${userId},device_id.eq.${deviceId}` : `device_id.eq.${deviceId}`)
    .maybeSingle();

  if (fetchError) throw fetchError;

  // If same reaction exists, remove it (toggle off)
  if (existingReaction && existingReaction.reaction_type === reactionType) {
    const { error: deleteError } = await supabase
      .from('comment_reactions')
      .delete()
      .eq('id', existingReaction.id);
    
    if (deleteError) throw deleteError;
    return { action: 'removed' as const, reactionType };
  }

  // If different reaction exists, update it
  if (existingReaction) {
    const { error: updateError } = await supabase
      .from('comment_reactions')
      .update({ reaction_type: reactionType })
      .eq('id', existingReaction.id);
    
    if (updateError) throw updateError;
    return { action: 'changed' as const, reactionType, previousType: existingReaction.reaction_type as ReactionType };
  }

  // No reaction exists, create new one
  const { error: insertError } = await supabase
    .from('comment_reactions')
    .insert({
      comment_id: commentId,
      reaction_type: reactionType,
      user_id: userId,
      device_id: deviceId,
    });

  if (insertError) throw insertError;
  return { action: 'added' as const, reactionType };
}

// Delete a comment
export async function deleteComment(commentId: string) {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);

  if (error) throw error;
}

// Report a comment using secure RPC function
export async function reportComment(commentId: string, reason?: string) {
  const { error } = await supabase.rpc('report_comment', {
    comment_id: commentId,
    reason: reason || 'Inappropriate content',
  });

  if (error) throw error;
}

// Check if user/device has voted on a review
export async function checkHelpfulVote(reviewId: string, voterId: string) {
  const voteId = `${reviewId}_${voterId}`;
  
  const { data, error } = await supabase
    .from('helpful_votes')
    .select('id')
    .eq('id', voteId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

// Create a helpful vote
export async function createHelpfulVote(
  reviewId: string,
  voterUserId: string | null,
  voterDeviceId: string
) {
  const voterId = voterUserId || voterDeviceId;
  const voteId = `${reviewId}_${voterId}`;

  const { error } = await supabase
    .from('helpful_votes')
    .insert({
      id: voteId,
      review_id: reviewId,
      voter_user_id: voterUserId,
      voter_device_id: voterDeviceId,
    });

  if (error) {
    // Duplicate vote error is expected, don't throw
    if (error.code === '23505') {
      return { alreadyVoted: true };
    }
    throw error;
  }
  
  return { alreadyVoted: false };
}

// Get unique languages from reviews
export async function fetchLanguages() {
  const { data, error } = await supabase
    .from('reviews')
    .select('language');

  if (error) throw error;
  
  const languages = [...new Set(data.map(r => r.language))];
  return languages.sort();
}

// Create a review (admin only)
export async function createReview(review: {
  title: string;
  language: string;
  rating: number;
  snippet: string;
  content: string;
  poster_url?: string | null;
  tags?: string[] | null;
  release_date?: string | null;
  created_by: string;
}) {
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      ...review,
      title_lower: review.title.toLowerCase(),
    })
    .select()
    .single();

  if (error) throw error;
  return data as Review;
}

// Update a review (admin only)
export async function updateReview(
  id: string,
  review: Partial<{
    title: string;
    language: string;
    rating: number;
    snippet: string;
    content: string;
    poster_url: string | null;
    tags: string[] | null;
    release_date: string | null;
  }>
) {
  const updates: Record<string, unknown> = { ...review };
  if (review.title) {
    updates.title_lower = review.title.toLowerCase();
  }

  const { data, error } = await supabase
    .from('reviews')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Review;
}

// Delete a review (admin only)
export async function deleteReview(id: string) {
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Fetch reported comments (admin only)
export async function fetchReportedComments() {
  const { data, error } = await supabase
    .from('comments')
    .select('*, reviews(title)')
    .eq('reported', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Register device for push notifications using secure RPC
export async function registerDevice(deviceId: string, pushToken?: string, platform?: string) {
  const { error } = await supabase.rpc('register_device', {
    p_device_id: deviceId,
    p_push_token: pushToken || null,
    p_platform: platform || null,
    p_push_enabled: true,
  });

  if (error) throw error;
}

// Update push settings for device using secure RPC
export async function updateDevicePushSettings(deviceId: string, enabled: boolean) {
  const { error } = await supabase.rpc('update_device_push', {
    p_device_id: deviceId,
    p_push_enabled: enabled,
  });

  if (error) throw error;
}
