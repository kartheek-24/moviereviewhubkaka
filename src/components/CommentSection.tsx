import { useState, useMemo, useCallback, useEffect } from 'react';
import { Send, Flag, Trash2, User, Reply, ChevronDown, ChevronUp, Info, Pencil, X, Check } from 'lucide-react';
import { Comment, ReactionType } from '@/services/reviewService';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { EmptyState } from './EmptyState';
import { CommentReactions } from './CommentReactions';
import { LinkifiedText } from './LinkifiedText';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface CommentSectionProps {
  reviewId: string;
  comments: Comment[];
  isLoading?: boolean;
  onAddComment?: (text: string, isAnonymous: boolean, customName?: string, parentId?: string | null) => void;
  onEditComment?: (commentId: string, text: string) => void;
  onDeleteComment?: (commentId: string) => void;
  onReportComment?: (commentId: string, reason?: string) => void;
  onReactToComment?: (commentId: string, reactionType: ReactionType) => void;
  currentUserId: string | null;
  isAdmin: boolean;
  isLoggedIn: boolean;
  userReactions?: Map<string, ReactionType>;
}

interface CommentWithReplies extends Comment {
  replies: Comment[];
}

export function CommentSection({
  comments,
  isLoading = false,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onReportComment,
  onReactToComment,
  currentUserId,
  isAdmin,
  isLoggedIn,
  userReactions = new Map(),
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [customName, setCustomName] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('guestCommentName') || '';
    }
    return '';
  });
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyName, setReplyName] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('guestCommentName') || '';
    }
    return '';
  });
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Persist custom name to localStorage
  useEffect(() => {
    if (customName.trim()) {
      localStorage.setItem('guestCommentName', customName.trim());
    }
  }, [customName]);

  useEffect(() => {
    if (replyName.trim()) {
      localStorage.setItem('guestCommentName', replyName.trim());
    }
  }, [replyName]);

  // Organize comments into threads
  const commentThreads = useMemo(() => {
    const topLevelComments: CommentWithReplies[] = [];
    const repliesMap = new Map<string, Comment[]>();

    // Group replies by parent_id
    comments.forEach(comment => {
      if (comment.parent_id) {
        const existing = repliesMap.get(comment.parent_id) || [];
        existing.push(comment);
        repliesMap.set(comment.parent_id, existing);
      }
    });

    // Build top-level comments with their replies
    comments.forEach(comment => {
      if (!comment.parent_id) {
        topLevelComments.push({
          ...comment,
          replies: (repliesMap.get(comment.id) || []).sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          ),
        });
      }
    });

    return topLevelComments;
  }, [comments]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      onAddComment?.(newComment.trim(), isAnonymous, customName.trim() || undefined);
      setNewComment('');
      setCustomName('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplySubmit = async (parentId: string) => {
    if (!replyText.trim()) return;

    setIsSubmitting(true);
    try {
      onAddComment?.(replyText.trim(), isAnonymous, replyName.trim() || undefined, parentId);
      setReplyText('');
      setReplyName('');
      setReplyingTo(null);
      // Auto-expand replies for the parent comment
      setExpandedReplies(prev => new Set(prev).add(parentId));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReport = (commentId: string) => {
    onReportComment?.(commentId, 'Inappropriate content');
  };

  const handleDelete = (commentId: string) => {
    onDeleteComment?.(commentId);
  };

  const handleReact = useCallback((commentId: string, reactionType: ReactionType) => {
    onReactToComment?.(commentId, reactionType);
  }, [onReactToComment]);

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const canDelete = (comment: Comment) => {
    if (isAdmin) return true;
    if (currentUserId && comment.user_id === currentUserId) return true;
    return false;
  };

  const canEdit = (comment: Comment) => {
    // Only logged-in users can edit their own comments
    if (currentUserId && comment.user_id === currentUserId) return true;
    return false;
  };

  const handleStartEdit = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditText(comment.text);
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditText('');
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editText.trim()) return;
    setIsSubmitting(true);
    try {
      onEditComment?.(commentId, editText.trim());
      setEditingComment(null);
      setEditText('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIdentityLabel = () => {
    if (isAnonymous) return 'Posting as Anonymous';
    if (isLoggedIn) return 'Posting as You';
    if (customName.trim()) return `Posting as ${customName.trim()}`;
    return 'Posting as Guest';
  };

  const showNameInput = !isAnonymous;

  const renderComment = (comment: Comment, isReply = false, index = 0) => {
    const isEditing = editingComment === comment.id;

    return (
      <article
        key={comment.id}
        className={cn(
          'glass-card rounded-lg p-4 animate-fade-in',
          isReply && 'ml-6 border-l-2 border-primary/20'
        )}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn(
                'text-sm font-medium',
                comment.display_name === 'Anonymous' || comment.display_name === 'Guest'
                  ? 'text-muted-foreground italic'
                  : 'text-foreground'
              )}>
                {comment.display_name}
              </span>
              <span className="text-xs text-muted-foreground">
                {format(new Date(comment.created_at), 'MMM d, yyyy')}
              </span>
              {comment.reported && (
                <span className="text-xs text-amber-500">Reported</span>
              )}
            </div>
            
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="min-h-[80px] bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary resize-none"
                  maxLength={500}
                  autoFocus
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {editText.length}/500
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelEdit}
                      className="h-7 px-2 gap-1 text-xs"
                    >
                      <X className="h-3.5 w-3.5" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSaveEdit(comment.id)}
                      disabled={!editText.trim() || isSubmitting || editText.length > 500}
                      className="h-7 px-2 gap-1 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-foreground/90 whitespace-pre-wrap mb-2">
                  <LinkifiedText text={comment.text} />
                </p>
                
                {/* Reactions and Reply button */}
                <div className="flex items-center gap-2">
                  <CommentReactions
                    commentId={comment.id}
                    likeCount={comment.like_count}
                    dislikeCount={comment.dislike_count}
                    loveCount={comment.love_count}
                    userReaction={userReactions.get(comment.id) || null}
                    onReact={handleReact}
                  />
                  
                  {!isReply && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      className="h-7 px-2 gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Reply className="h-3.5 w-3.5" />
                      Reply
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
          
          {!isEditing && (
            <div className="flex items-center gap-1 flex-shrink-0">
              {canEdit(comment) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleStartEdit(comment)}
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              )}
              {canDelete(comment) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(comment.id)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              {!comment.reported && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleReport(comment.id)}
                  className="h-8 w-8 text-muted-foreground hover:text-amber-500"
                >
                  <Flag className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </article>
    );
  };

  return (
    <div className="space-y-6">
      {/* Comment Composer */}
      <div className="glass-card rounded-xl p-4">
        <div className="mb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <User className="w-4 h-4" />
            <span>{getIdentityLabel()}</span>
          </div>
          
          {showNameInput && (
            <div className="mb-2">
              <div className="flex items-center gap-1 mb-1">
                <Label className="text-xs text-muted-foreground">Display Name</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[200px]">
                    <p className="text-xs">Your name will be saved for future visits so you don't have to enter it again.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Your name (optional)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="flex-1 bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary"
                  maxLength={50}
                />
                {customName && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCustomName('');
                      localStorage.removeItem('guestCommentName');
                    }}
                    className="text-muted-foreground hover:text-destructive px-2"
                  >
                    Clear
                  </Button>
                )}
              </div>
              <div className="flex justify-end mt-1">
                <span className="text-xs text-muted-foreground">
                  {customName.length}/50
                </span>
              </div>
            </div>
          )}
          
          <Textarea
            placeholder="Share your thoughts..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px] bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary resize-none"
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-muted-foreground">
              {newComment.length}/500
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
            />
            <Label htmlFor="anonymous" className="text-sm text-muted-foreground cursor-pointer">
              Post as Anonymous
            </Label>
          </div>
          
          <Button
            onClick={handleSubmit}
            disabled={!newComment.trim() || isSubmitting || newComment.length > 500}
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Send className="w-4 h-4 mr-2" />
            Post
          </Button>
        </div>
      </div>
      
      {/* Comments List */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">
          Comments ({comments.length})
        </h3>
        
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-card rounded-lg p-4 animate-pulse">
                <div className="h-4 w-24 rounded skeleton-shimmer mb-2" />
                <div className="h-4 w-full rounded skeleton-shimmer" />
              </div>
            ))}
          </div>
        ) : commentThreads.length === 0 ? (
          <EmptyState type="comments" />
        ) : (
          <div className="space-y-3">
            {commentThreads.map((thread, index) => (
              <div key={thread.id} className="space-y-2">
                {renderComment(thread, false, index)}
                
                {/* Reply composer */}
                {replyingTo === thread.id && (
                  <div className="ml-6 glass-card rounded-lg p-3 border-l-2 border-primary/20 animate-fade-in">
                    {showNameInput && (
                      <div className="mb-2">
                        <div className="flex items-center gap-1 mb-1">
                          <Label className="text-xs text-muted-foreground">Display Name</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-[200px]">
                              <p className="text-xs">Your name will be saved for future visits so you don't have to enter it again.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Your name (optional)"
                            value={replyName}
                            onChange={(e) => setReplyName(e.target.value)}
                            className="flex-1 bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary"
                            maxLength={50}
                          />
                          {replyName && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setReplyName('');
                                localStorage.removeItem('guestCommentName');
                              }}
                              className="text-muted-foreground hover:text-destructive px-2"
                            >
                              Clear
                            </Button>
                          )}
                        </div>
                        <div className="flex justify-end mt-1">
                          <span className="text-xs text-muted-foreground">
                            {replyName.length}/50
                          </span>
                        </div>
                      </div>
                    )}
                    <Textarea
                      placeholder={`Reply to ${thread.display_name}...`}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="min-h-[80px] bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary resize-none mb-2"
                      maxLength={500}
                      autoFocus
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {replyText.length}/500
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText('');
                            setReplyName('');
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleReplySubmit(thread.id)}
                          disabled={!replyText.trim() || isSubmitting || replyText.length > 500}
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          <Send className="w-3.5 h-3.5 mr-1" />
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Replies */}
                {thread.replies.length > 0 && (
                  <div className="ml-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleReplies(thread.id)}
                      className="h-7 px-2 gap-1 text-xs text-muted-foreground hover:text-foreground mb-2"
                    >
                      {expandedReplies.has(thread.id) ? (
                        <>
                          <ChevronUp className="h-3.5 w-3.5" />
                          Hide {thread.replies.length} {thread.replies.length === 1 ? 'reply' : 'replies'}
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3.5 w-3.5" />
                          Show {thread.replies.length} {thread.replies.length === 1 ? 'reply' : 'replies'}
                        </>
                      )}
                    </Button>
                    
                    {expandedReplies.has(thread.id) && (
                      <div className="space-y-2">
                        {thread.replies.map((reply, replyIndex) => 
                          renderComment(reply, true, replyIndex)
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
