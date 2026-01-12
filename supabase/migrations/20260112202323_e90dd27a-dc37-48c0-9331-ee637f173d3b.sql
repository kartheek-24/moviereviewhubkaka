-- Add parent_id column for replies to comments table
ALTER TABLE public.comments 
ADD COLUMN parent_id uuid REFERENCES public.comments(id) ON DELETE CASCADE;

-- Create index for faster reply lookups
CREATE INDEX idx_comments_parent_id ON public.comments(parent_id);

-- Create comment_reactions table for like/dislike/love
CREATE TABLE public.comment_reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id uuid NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  reaction_type text NOT NULL CHECK (reaction_type IN ('like', 'dislike', 'love')),
  user_id uuid,
  device_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT comment_reactions_voter_check CHECK (user_id IS NOT NULL OR device_id IS NOT NULL),
  CONSTRAINT comment_reactions_unique_vote UNIQUE (comment_id, user_id, device_id)
);

-- Enable RLS on comment_reactions
ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;

-- Anyone can read reactions
CREATE POLICY "Anyone can read comment reactions"
ON public.comment_reactions
FOR SELECT
USING (true);

-- Anyone can create reactions
CREATE POLICY "Anyone can create comment reactions"
ON public.comment_reactions
FOR INSERT
WITH CHECK (true);

-- Users can update their own reactions
CREATE POLICY "Users can update own reactions"
ON public.comment_reactions
FOR UPDATE
USING (
  (auth.uid() = user_id) OR 
  (user_id IS NULL AND device_id IS NOT NULL)
);

-- Users can delete their own reactions
CREATE POLICY "Users can delete own reactions"
ON public.comment_reactions
FOR DELETE
USING (
  (auth.uid() = user_id) OR 
  (user_id IS NULL AND device_id IS NOT NULL)
);

-- Add reaction counts to comments table
ALTER TABLE public.comments
ADD COLUMN like_count integer NOT NULL DEFAULT 0,
ADD COLUMN dislike_count integer NOT NULL DEFAULT 0,
ADD COLUMN love_count integer NOT NULL DEFAULT 0;

-- Create function to update reaction counts
CREATE OR REPLACE FUNCTION public.update_comment_reaction_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.reaction_type = 'like' THEN
      UPDATE public.comments SET like_count = like_count + 1 WHERE id = NEW.comment_id;
    ELSIF NEW.reaction_type = 'dislike' THEN
      UPDATE public.comments SET dislike_count = dislike_count + 1 WHERE id = NEW.comment_id;
    ELSIF NEW.reaction_type = 'love' THEN
      UPDATE public.comments SET love_count = love_count + 1 WHERE id = NEW.comment_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.reaction_type = 'like' THEN
      UPDATE public.comments SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.comment_id;
    ELSIF OLD.reaction_type = 'dislike' THEN
      UPDATE public.comments SET dislike_count = GREATEST(0, dislike_count - 1) WHERE id = OLD.comment_id;
    ELSIF OLD.reaction_type = 'love' THEN
      UPDATE public.comments SET love_count = GREATEST(0, love_count - 1) WHERE id = OLD.comment_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' AND OLD.reaction_type != NEW.reaction_type THEN
    -- Decrement old reaction
    IF OLD.reaction_type = 'like' THEN
      UPDATE public.comments SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.comment_id;
    ELSIF OLD.reaction_type = 'dislike' THEN
      UPDATE public.comments SET dislike_count = GREATEST(0, dislike_count - 1) WHERE id = OLD.comment_id;
    ELSIF OLD.reaction_type = 'love' THEN
      UPDATE public.comments SET love_count = GREATEST(0, love_count - 1) WHERE id = OLD.comment_id;
    END IF;
    -- Increment new reaction
    IF NEW.reaction_type = 'like' THEN
      UPDATE public.comments SET like_count = like_count + 1 WHERE id = NEW.comment_id;
    ELSIF NEW.reaction_type = 'dislike' THEN
      UPDATE public.comments SET dislike_count = dislike_count + 1 WHERE id = NEW.comment_id;
    ELSIF NEW.reaction_type = 'love' THEN
      UPDATE public.comments SET love_count = love_count + 1 WHERE id = NEW.comment_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for reaction count updates
CREATE TRIGGER update_comment_reaction_counts_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.comment_reactions
FOR EACH ROW
EXECUTE FUNCTION public.update_comment_reaction_counts();