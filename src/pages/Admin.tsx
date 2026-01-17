import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, MessageCircle, Flag, Image, CalendarIcon, Upload, Link, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

import { useAuth } from '@/contexts/AuthContext';
import { useReviews, useCreateReview, useUpdateReview, useDeleteReview, useReportedComments, useDeleteComment, useApproveComment } from '@/hooks/useReviews';
import { Review } from '@/services/reviewService';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

const LANGUAGES = ['English', 'Telugu', 'Hindi', 'Kannada', 'Tamil', 'Malayalam', 'Korean', 'Japanese', 'Spanish', 'French'];

interface ReviewFormProps {
  title: string;
  setTitle: (value: string) => void;
  language: string;
  setLanguage: (value: string) => void;
  rating: number;
  setRating: (value: number) => void;
  snippet: string;
  setSnippet: (value: string) => void;
  content: string;
  setContent: (value: string) => void;
  posterUrl: string;
  setPosterUrl: (value: string) => void;
  tags: string;
  setTags: (value: string) => void;
  releaseDate: Date | undefined;
  setReleaseDate: (value: Date | undefined) => void;
  posterInputMode: 'url' | 'file';
  setPosterInputMode: (value: 'url' | 'file') => void;
  posterFile: File | null;
  posterPreview: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearPosterFile: () => void;
  onSubmit: () => void;
  submitLabel: string;
  isPending: boolean;
  isUploading: boolean;
  resetForm: () => void;
}

const ReviewForm = ({
  title,
  setTitle,
  language,
  setLanguage,
  rating,
  setRating,
  snippet,
  setSnippet,
  content,
  setContent,
  posterUrl,
  setPosterUrl,
  tags,
  setTags,
  releaseDate,
  setReleaseDate,
  posterInputMode,
  setPosterInputMode,
  posterFile,
  posterPreview,
  fileInputRef,
  handleFileSelect,
  clearPosterFile,
  onSubmit,
  submitLabel,
  isPending,
  isUploading,
  resetForm,
}: ReviewFormProps) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="title">Title *</Label>
      <Input
        id="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Movie title"
        className="bg-muted border-0"
      />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="language">Language *</Label>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="bg-muted border-0">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang} value={lang}>{lang}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="rating">Rating * (0-5)</Label>
        <Input
          id="rating"
          type="number"
          min={0}
          max={5}
          step={0.25}
          value={rating}
          onChange={(e) => setRating(Math.min(5, Math.max(0, parseFloat(e.target.value) || 0)))}
          placeholder="Rating (0-5)"
          className="bg-muted border-0"
        />
      </div>
    </div>

    <div className="space-y-2">
      <Label htmlFor="snippet">Snippet * (short preview)</Label>
      <Textarea
        id="snippet"
        value={snippet}
        onChange={(e) => setSnippet(e.target.value)}
        placeholder="Brief preview of the review..."
        className="bg-muted border-0 min-h-[80px]"
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="content">Full Review *</Label>
      <Textarea
        id="content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your full review..."
        className="bg-muted border-0 min-h-[200px]"
      />
    </div>

    <div className="space-y-2">
      <Label>Poster Image (optional)</Label>
      <div className="flex gap-2 mb-2">
        <Button
          type="button"
          variant={posterInputMode === 'url' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setPosterInputMode('url');
            clearPosterFile();
          }}
        >
          <Link className="w-4 h-4 mr-1" />
          URL
        </Button>
        <Button
          type="button"
          variant={posterInputMode === 'file' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setPosterInputMode('file');
            setPosterUrl('');
          }}
        >
          <Upload className="w-4 h-4 mr-1" />
          Upload
        </Button>
      </div>
      
      {posterInputMode === 'url' ? (
        <div className="flex gap-2">
          <Input
            id="posterUrl"
            value={posterUrl}
            onChange={(e) => setPosterUrl(e.target.value)}
            placeholder="https://..."
            className="bg-muted border-0"
          />
          {posterUrl && (
            <img 
              src={posterUrl} 
              alt="Poster preview" 
              className="w-10 h-14 object-cover rounded"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          {posterPreview ? (
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <img 
                src={posterPreview} 
                alt="Poster preview" 
                className="w-16 h-24 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{posterFile?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {posterFile && (posterFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={clearPosterFile}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="w-full h-24 border-dashed bg-muted border-muted-foreground/30"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center gap-1">
                <Upload className="w-6 h-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Click to upload image</span>
                <span className="text-xs text-muted-foreground/70">Max 5MB</span>
              </div>
            </Button>
          )}
        </div>
      )}
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma separated)</Label>
        <Input
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Action, Drama, Thriller"
          className="bg-muted border-0"
        />
      </div>

      <div className="space-y-2">
        <Label>Release Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal bg-muted border-0",
                !releaseDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {releaseDate ? format(releaseDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={releaseDate}
              onSelect={setReleaseDate}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>

    <div className="flex justify-end gap-2 pt-4">
      <DialogClose asChild>
        <Button variant="outline" onClick={resetForm}>Cancel</Button>
      </DialogClose>
      <Button 
        onClick={onSubmit} 
        disabled={isPending || isUploading}
      >
        {isUploading ? 'Uploading...' : (isPending ? 'Saving...' : submitLabel)}
      </Button>
    </div>
  </div>
);

export default function Admin() {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const { data: reviews = [], isLoading: reviewsLoading } = useReviews();
  const { data: reportedComments = [], isLoading: commentsLoading } = useReportedComments();
  
  const createReview = useCreateReview();
  const updateReview = useUpdateReview();
  const deleteReview = useDeleteReview();
  const deleteComment = useDeleteComment();
  const approveComment = useApproveComment();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('');
  const [rating, setRating] = useState(2.5);
  const [snippet, setSnippet] = useState('');
  const [content, setContent] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [tags, setTags] = useState('');
  const [releaseDate, setReleaseDate] = useState<Date | undefined>(undefined);
  const [posterInputMode, setPosterInputMode] = useState<'url' | 'file'>('url');
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      toast({
        title: 'Access denied',
        description: 'You do not have permission to access this page.',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [user, isAdmin, authLoading, navigate, toast]);

  const resetForm = () => {
    setTitle('');
    setLanguage('');
    setRating(5);
    setSnippet('');
    setContent('');
    setPosterUrl('');
    setTags('');
    setReleaseDate(undefined);
    setPosterInputMode('url');
    setPosterFile(null);
    setPosterPreview(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select an image file.',
          variant: 'destructive',
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select an image under 5MB.',
          variant: 'destructive',
        });
        return;
      }
      setPosterFile(file);
      setPosterPreview(URL.createObjectURL(file));
      setPosterUrl(''); // Clear URL when file is selected
    }
  };

  const clearPosterFile = () => {
    setPosterFile(null);
    if (posterPreview) {
      URL.revokeObjectURL(posterPreview);
    }
    setPosterPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadPosterFile = async (): Promise<string | null> => {
    if (!posterFile) return null;
    
    setIsUploading(true);
    try {
      // Use secure edge function for server-side validation
      const formData = new FormData();
      formData.append('file', posterFile);
      
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      const response = await supabase.functions.invoke('upload-poster', {
        body: formData,
      });

      if (response.error) {
        throw new Error(response.error.message || 'Upload failed');
      }

      const result = response.data;
      
      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }
      
      return result.url;
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload poster image. Please try again.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const openEditDialog = (review: Review) => {
    setEditingReview(review);
    setTitle(review.title);
    setLanguage(review.language);
    setRating(review.rating);
    setSnippet(review.snippet);
    setContent(review.content);
    setPosterUrl(review.poster_url || '');
    setTags(review.tags?.join(', ') || '');
    setReleaseDate(review.release_date ? new Date(review.release_date) : undefined);
  };

  const handleCreate = async () => {
    if (!title || !language || !snippet || !content || !user) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    let finalPosterUrl = posterUrl || null;
    
    // Upload file if selected
    if (posterFile) {
      const uploadedUrl = await uploadPosterFile();
      if (uploadedUrl) {
        finalPosterUrl = uploadedUrl;
      }
    }

    createReview.mutate({
      title,
      language,
      rating,
      snippet,
      content,
      poster_url: finalPosterUrl,
      tags: tags ? tags.split(',').map(t => t.trim()) : null,
      release_date: releaseDate ? format(releaseDate, 'yyyy-MM-dd') : null,
      created_by: user.id,
    }, {
      onSuccess: () => {
        setIsCreateOpen(false);
        resetForm();
      },
    });
  };

  const handleUpdate = async () => {
    if (!editingReview || !title || !language || !snippet || !content) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    let finalPosterUrl = posterUrl || null;
    
    // Upload file if selected
    if (posterFile) {
      const uploadedUrl = await uploadPosterFile();
      if (uploadedUrl) {
        finalPosterUrl = uploadedUrl;
      }
    }

    updateReview.mutate({
      id: editingReview.id,
      review: {
        title,
        language,
        rating,
        snippet,
        content,
        poster_url: finalPosterUrl,
        tags: tags ? tags.split(',').map(t => t.trim()) : null,
        release_date: releaseDate ? format(releaseDate, 'yyyy-MM-dd') : null,
      },
    }, {
      onSuccess: () => {
        setEditingReview(null);
        resetForm();
      },
    });
  };

  const handleDelete = (id: string) => {
    deleteReview.mutate(id, {
      onSuccess: () => {
        setDeleteConfirmId(null);
      },
    });
  };

  const handleDeleteComment = (commentId: string, reviewId: string) => {
    deleteComment.mutate({ commentId, reviewId });
  };

  const handleApproveComment = (commentId: string) => {
    approveComment.mutate(commentId);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen cinema-bg flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const formProps = {
    title,
    setTitle,
    language,
    setLanguage,
    rating,
    setRating,
    snippet,
    setSnippet,
    content,
    setContent,
    posterUrl,
    setPosterUrl,
    tags,
    setTags,
    releaseDate,
    setReleaseDate,
    posterInputMode,
    setPosterInputMode,
    posterFile,
    posterPreview,
    fileInputRef,
    handleFileSelect,
    clearPosterFile,
    isPending: createReview.isPending || updateReview.isPending,
    isUploading,
    resetForm,
  };

  return (
    <div className="min-h-screen cinema-bg">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full safe-area-inset-top">
        <div className="glass-card border-b border-border/50">
          <div className="container flex items-center justify-between h-14 px-4">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                className="text-foreground hover:bg-muted mr-3"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="font-semibold text-foreground">Admin Panel</h1>
            </div>
            
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-primary text-primary-foreground">
                  <Plus className="w-4 h-4 mr-1" />
                  New Review
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Review</DialogTitle>
                </DialogHeader>
                <ReviewForm {...formProps} onSubmit={handleCreate} submitLabel="Publish Review" />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6 pb-20">
        <Tabs defaultValue="reviews">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
            <TabsTrigger value="moderation">
              Moderation ({reportedComments.length})
              {reportedComments.length > 0 && (
                <span className="ml-1 w-2 h-2 bg-destructive rounded-full" />
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reviews">
            {reviewsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="glass-card rounded-lg p-4 animate-pulse">
                    <div className="h-6 w-1/2 rounded skeleton-shimmer mb-2" />
                    <div className="h-4 w-1/4 rounded skeleton-shimmer" />
                  </div>
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No reviews yet</p>
                <Button onClick={() => setIsCreateOpen(true)}>Create your first review</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((review) => (
                  <div key={review.id} className="glass-card rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{review.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span>{review.language}</span>
                          <span>★ {review.rating}</span>
                          <span>{format(new Date(review.created_at), 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{review.helpful_count} helpful</span>
                          <span>{review.comment_count} comments</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 ml-2">
                        <Dialog open={editingReview?.id === review.id} onOpenChange={(open) => !open && setEditingReview(null)}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(review)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Edit Review</DialogTitle>
                            </DialogHeader>
                            <ReviewForm {...formProps} onSubmit={handleUpdate} submitLabel="Save Changes" />
                          </DialogContent>
                        </Dialog>

                        <Dialog open={deleteConfirmId === review.id} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteConfirmId(review.id)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete Review</DialogTitle>
                            </DialogHeader>
                            <p className="text-muted-foreground">
                              Are you sure you want to delete "{review.title}"? This action cannot be undone.
                            </p>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                              </DialogClose>
                              <Button 
                                variant="destructive" 
                                onClick={() => handleDelete(review.id)}
                                disabled={deleteReview.isPending}
                              >
                                {deleteReview.isPending ? 'Deleting...' : 'Delete'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="moderation">
            {commentsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="glass-card rounded-lg p-4 animate-pulse">
                    <div className="h-4 w-full rounded skeleton-shimmer" />
                  </div>
                ))}
              </div>
            ) : reportedComments.length === 0 ? (
              <div className="text-center py-12">
                <Flag className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No reported comments</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reportedComments.map((comment: any) => (
                  <div key={comment.id} className="glass-card rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-foreground">
                            {comment.display_name}
                          </span>
                          <span className="text-xs text-amber-500">
                            Reported: {comment.reported_reason || 'No reason'}
                          </span>
                        </div>
                        <p className="text-sm text-foreground/80 mb-2">{comment.text}</p>
                        <p className="text-xs text-muted-foreground">
                          On: {comment.reviews?.title || 'Unknown review'}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleApproveComment(comment.id)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteComment(comment.id, comment.review_id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
