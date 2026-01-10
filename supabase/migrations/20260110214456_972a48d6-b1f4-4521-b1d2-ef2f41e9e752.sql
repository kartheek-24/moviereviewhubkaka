-- Drop the overly permissive UPDATE policy for comments
DROP POLICY IF EXISTS "Anyone can report comments" ON public.comments;

-- Create a secure RPC function for reporting comments
-- This provides field-level protection by only allowing the reported fields to be updated
CREATE OR REPLACE FUNCTION public.report_comment(
  comment_id UUID,
  reason TEXT DEFAULT 'Inappropriate content'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate inputs
  IF comment_id IS NULL THEN
    RAISE EXCEPTION 'comment_id is required';
  END IF;
  
  -- Validate reason length
  IF length(reason) > 500 THEN
    RAISE EXCEPTION 'Reason must be 500 characters or less';
  END IF;
  
  -- Only update the reported fields, nothing else
  UPDATE public.comments
  SET reported = true, reported_reason = reason
  WHERE id = comment_id;
  
  -- Check if the comment exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Comment not found';
  END IF;
END;
$$;

-- Grant execute permission to both anonymous and authenticated users
GRANT EXECUTE ON FUNCTION public.report_comment TO anon, authenticated;