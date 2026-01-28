import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Share2, Home, Ticket } from 'lucide-react';
import { useReview, useComments, useCreateComment, useUpdateComment, useDeleteComment, useReportComment, useUserReactions, useToggleCommentReaction } from '@/hooks/useReviews';
import { useRealtimeComments } from '@/hooks/useRealtimeComments';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { LanguageBadge } from '@/components/LanguageBadge';
import { HelpfulButton } from '@/components/HelpfulButton';
import { CommentSection } from '@/components/CommentSection';
import { ShareDialog } from '@/components/ShareDialog';
import { BuyTicketsDialog } from '@/components/BuyTicketsDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { ReactionType } from '@/services/reviewService';

export default function ReviewDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin, displayName: authDisplayName } = useAuth();
  const { deviceId } = useApp();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [buyTicketsDialogOpen, setBuyTicketsDialogOpen] = useState(false);
  
  const { data: review, isLoading: reviewLoading, error: reviewError } = useReview(id);
  const { data: comments = [], isLoading: commentsLoading } = useComments(id);
  
  // Enable real-time updates for comments
  useRealtimeComments(id);
  
  const createComment = useCreateComment();
  const updateCommentMutation = useUpdateComment();
  const deleteCommentMutation = useDeleteComment();
  const reportCommentMutation = useReportComment();
  const toggleReactionMutation = useToggleCommentReaction();

  // Fetch user reactions for all comments
  const commentIds = useMemo(() => comments.map(c => c.id), [comments]);
  const { data: userReactionsData = [] } = useUserReactions(commentIds, user?.id || null, deviceId);
  
  // Convert reactions array to Map for easy lookup
  const userReactions = useMemo(() => {
    const map = new Map<string, ReactionType>();
    userReactionsData.forEach(reaction => {
      map.set(reaction.comment_id, reaction.reaction_type);
    });
    return map;
  }, [userReactionsData]);

  const shareUrl = review ? `${window.location.origin}/review/${review.id}` : '';

  const handleShare = () => {
    if (!review) return;
    setShareDialogOpen(true);
  };

  const handleAddComment = (text: string, isAnonymous: boolean, customName?: string, parentId?: string | null) => {
    if (!id) return;

    let displayName = 'Guest';
    if (user) {
      displayName = isAnonymous ? 'Anonymous' : (authDisplayName || user.email?.split('@')[0] || 'User');
    } else if (isAnonymous) {
      displayName = 'Anonymous';
    } else if (customName) {
      displayName = customName;
    } else {
      displayName = 'Guest';
    }

    createComment.mutate({
      review_id: id,
      text,
      is_anonymous: isAnonymous,
      display_name: displayName,
      user_id: user?.id || null,
      device_id: deviceId,
      parent_id: parentId || null,
    });
  };

  const handleEditComment = (commentId: string, text: string) => {
    if (!id) return;
    updateCommentMutation.mutate({ commentId, text, reviewId: id });
  };

  const handleDeleteComment = (commentId: string) => {
    if (!id) return;
    deleteCommentMutation.mutate({ commentId, reviewId: id });
  };

  const handleReportComment = (commentId: string, reason?: string) => {
    reportCommentMutation.mutate({ commentId, reason });
  };

  const handleReactToComment = (commentId: string, reactionType: ReactionType) => {
    if (!id || !deviceId) return;
    toggleReactionMutation.mutate({
      commentId,
      reactionType,
      userId: user?.id || null,
      deviceId,
      reviewId: id,
    });
  };

  const isLoading = reviewLoading;

  if (!review && !isLoading && reviewError) {
    return (
      <div className="min-h-full cinema-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display font-semibold text-foreground mb-2">
            Review not found
          </h1>
          <p className="text-muted-foreground mb-4">
            This review may have been removed or doesn't exist.
          </p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full cinema-bg">
      {/* Custom Header */}
      <header className="sticky top-0 z-40 w-full safe-area-inset-top">
        <div className="glass-card border-b border-border/50">
          <div className="container flex items-center justify-between h-14 px-4">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (window.history.length > 1) {
                    navigate(-1);
                  } else {
                    navigate('/');
                  }
                }}
                className="text-foreground hover:bg-muted"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                className="text-foreground hover:bg-muted"
              >
                <Home className="h-5 w-5" />
              </Button>
            </div>
            <h1 className="font-semibold text-foreground truncate max-w-[200px]">
              {isLoading ? 'Loading...' : review?.title}
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="text-foreground hover:bg-muted"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <ScrollArea className="h-[calc(100vh-3.5rem)]">
        <main className="container px-4 py-6 pb-20">
          {isLoading ? (
            <div className="animate-pulse space-y-6">
              <div className="h-64 rounded-xl skeleton-shimmer" />
              <div className="h-8 w-3/4 rounded skeleton-shimmer" />
              <div className="h-4 w-1/2 rounded skeleton-shimmer" />
              <div className="space-y-2">
                <div className="h-4 w-full rounded skeleton-shimmer" />
                <div className="h-4 w-full rounded skeleton-shimmer" />
                <div className="h-4 w-3/4 rounded skeleton-shimmer" />
              </div>
            </div>
          ) : review && (
            <article className="animate-fade-in">
              {/* Poster */}
              {review.poster_url && (
                <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-6">
                  <img
                    src={review.poster_url}
                    alt={review.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                </div>
              )}

              {/* Header */}
              <div className="mb-6">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h1 className="font-display text-2xl font-bold text-foreground">
                    {review.title}
                  </h1>
                  <LanguageBadge language={review.language} />
                </div>

                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className="flex items-center gap-1 text-primary font-bold text-lg">
                    <span>Rating: {review.rating}/5</span>
                  </div>
                  {review.release_date && (
                    <span className="text-sm text-muted-foreground">
                      Released: {format(new Date(review.release_date), 'MMMM d, yyyy')}
                    </span>
                  )}
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(review.created_at), 'MMMM d, yyyy')}</span>
                  </div>
                </div>

                {review.tags && review.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {review.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    <Button
                      onClick={() => setBuyTicketsDialogOpen(true)}
                      className="ml-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-bold shadow-lg shadow-amber-500/30 animate-pulse hover:animate-none transition-all duration-300"
                      size="sm"
                    >
                      <Ticket className="h-4 w-4 mr-1" />
                      Buy Tickets
                    </Button>
                  </div>
                )}
                
                {(!review.tags || review.tags.length === 0) && (
                  <div className="mb-4">
                    <Button
                      onClick={() => setBuyTicketsDialogOpen(true)}
                      className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-bold shadow-lg shadow-amber-500/30 animate-pulse hover:animate-none transition-all duration-300"
                      size="sm"
                    >
                      <Ticket className="h-4 w-4 mr-1" />
                      Buy Tickets
                    </Button>
                  </div>
                )}

                <HelpfulButton reviewId={review.id} initialCount={review.helpful_count} />
              </div>

              <Separator className="my-6 bg-border/50" />

              {/* Content */}
              <div className="prose prose-invert prose-sm max-w-none mb-8">
                {review.content.split('\n\n').map((paragraph, i) => (
                  <p key={i} className="text-foreground/90 leading-relaxed mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>

              <Separator className="my-6 bg-border/50" />

              <CommentSection
                reviewId={review.id}
                comments={comments}
                isLoading={commentsLoading}
                onAddComment={handleAddComment}
                onEditComment={handleEditComment}
                onDeleteComment={handleDeleteComment}
                onReportComment={handleReportComment}
                onReactToComment={handleReactToComment}
                currentUserId={user?.id || null}
                isAdmin={isAdmin}
                isLoggedIn={!!user}
                userReactions={userReactions}
              />
            </article>
          )}
        </main>
      </ScrollArea>

      {review && (
        <>
          <ShareDialog
            open={shareDialogOpen}
            onOpenChange={setShareDialogOpen}
            title={review.title}
            text={review.snippet}
            url={shareUrl}
          />
          <BuyTicketsDialog
            open={buyTicketsDialogOpen}
            onOpenChange={setBuyTicketsDialogOpen}
            movieTitle={review.title}
          />
        </>
      )}
    </div>
  );
}
