-- Create trigger to update comment reaction counts when reactions are added/removed/changed
DROP TRIGGER IF EXISTS on_comment_reaction_change ON public.comment_reactions;

CREATE TRIGGER on_comment_reaction_change
AFTER INSERT OR UPDATE OR DELETE ON public.comment_reactions
FOR EACH ROW
EXECUTE FUNCTION public.update_comment_reaction_counts();

-- Also add UPDATE policy on comments for the trigger to work (using SECURITY DEFINER function)
-- Since the function update_comment_reaction_counts is not SECURITY DEFINER, we need to update it
CREATE OR REPLACE FUNCTION public.update_comment_reaction_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

-- Also need to add an UPDATE policy on comments for admin to approve (clear reported flag)
CREATE POLICY "Admin can update comments"
ON public.comments
FOR UPDATE
USING ((auth.jwt() ->> 'email'::text) = 'kakasphotography@gmail.com'::text);