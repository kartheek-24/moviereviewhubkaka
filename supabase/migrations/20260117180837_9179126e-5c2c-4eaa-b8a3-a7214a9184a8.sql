-- Enable realtime for reviews table to get live updates when reviews are added/updated/deleted
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;