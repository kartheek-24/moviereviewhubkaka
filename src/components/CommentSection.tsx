import { useState } from 'react';
import { Send, Flag, Trash2, User } from 'lucide-react';
import { Comment } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { EmptyState } from './EmptyState';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface CommentSectionProps {
  reviewId: string;
  comments: Comment[];
  onAddComment?: (text: string, isAnonymous: boolean) => void;
  onDeleteComment?: (commentId: string) => void;
  onReportComment?: (commentId: string, reason: string) => void;
}

// Mock auth state
const isLoggedIn = false;
const currentUserId: string | null = null;
const isAdmin = false;

export function CommentSection({
  comments,
  onAddComment,
  onDeleteComment,
  onReportComment,
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    if (newComment.length > 500) {
      toast({
        title: 'Comment too long',
        description: 'Comments must be 500 characters or less.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      onAddComment?.(newComment.trim(), isAnonymous);
      setNewComment('');
      toast({
        title: 'Comment posted',
        description: 'Your comment has been added successfully.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to post comment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReport = (commentId: string) => {
    onReportComment?.(commentId, 'Inappropriate content');
    toast({
      title: 'Comment reported',
      description: 'Thank you for helping keep our community safe.',
    });
  };

  const handleDelete = (commentId: string) => {
    onDeleteComment?.(commentId);
    toast({
      title: 'Comment deleted',
      description: 'The comment has been removed.',
    });
  };

  const canDelete = (comment: Comment) => {
    if (isAdmin) return true;
    if (currentUserId && comment.userId === currentUserId) return true;
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Comment Composer */}
      <div className="glass-card rounded-xl p-4">
        <div className="mb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <User className="w-4 h-4" />
            <span>
              {isLoggedIn 
                ? (isAnonymous ? 'Posting as Anonymous' : 'Posting as You')
                : (isAnonymous ? 'Posting as Anonymous' : 'Posting as Guest')
              }
            </span>
          </div>
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
            disabled={!newComment.trim() || isSubmitting}
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
        
        {comments.length === 0 ? (
          <EmptyState type="comments" />
        ) : (
          <div className="space-y-3">
            {comments.map((comment, index) => (
              <article
                key={comment.id}
                className={cn(
                  'glass-card rounded-lg p-4 animate-fade-in',
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        'text-sm font-medium',
                        comment.displayName === 'Anonymous' || comment.displayName === 'Guest'
                          ? 'text-muted-foreground italic'
                          : 'text-foreground'
                      )}>
                        {comment.displayName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(comment.createdAt, 'MMM d, yyyy')}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                      {comment.text}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1 flex-shrink-0">
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
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleReport(comment.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-amber-500"
                    >
                      <Flag className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
