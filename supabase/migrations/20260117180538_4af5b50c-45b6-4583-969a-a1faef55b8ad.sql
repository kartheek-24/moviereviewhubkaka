-- Fix double-counting: there are two triggers on public.comment_reactions calling update_comment_reaction_counts()
-- Keep the existing trigger (update_comment_reaction_counts_trigger) and remove the duplicate we created.
DROP TRIGGER IF EXISTS on_comment_reaction_change ON public.comment_reactions;

-- Backfill counts to match actual reactions
WITH agg AS (
  SELECT
    comment_id,
    SUM(CASE WHEN reaction_type = 'like' THEN 1 ELSE 0 END) AS like_count,
    SUM(CASE WHEN reaction_type = 'dislike' THEN 1 ELSE 0 END) AS dislike_count,
    SUM(CASE WHEN reaction_type = 'love' THEN 1 ELSE 0 END) AS love_count
  FROM public.comment_reactions
  GROUP BY comment_id
)
UPDATE public.comments c
SET
  like_count = COALESCE(a.like_count, 0),
  dislike_count = COALESCE(a.dislike_count, 0),
  love_count = COALESCE(a.love_count, 0)
FROM agg a
WHERE c.id = a.comment_id;

-- Ensure comments with no reactions are reset to 0
UPDATE public.comments c
SET like_count = 0, dislike_count = 0, love_count = 0
WHERE NOT EXISTS (
  SELECT 1 FROM public.comment_reactions cr WHERE cr.comment_id = c.id
);