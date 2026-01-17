-- Enable realtime for comments table to get live reaction count updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;