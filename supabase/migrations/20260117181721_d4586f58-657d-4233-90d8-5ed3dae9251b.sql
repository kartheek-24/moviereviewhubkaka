-- Create table to track PWA installs
CREATE TABLE public.pwa_installs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  user_id UUID,
  platform TEXT,
  installed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(device_id)
);

-- Enable RLS
ALTER TABLE public.pwa_installs ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (to track anonymous installs)
CREATE POLICY "Anyone can record pwa install"
ON public.pwa_installs
FOR INSERT
WITH CHECK (true);

-- Only admin can read all installs for analytics
CREATE POLICY "Admin can read pwa installs"
ON public.pwa_installs
FOR SELECT
USING ((auth.jwt() ->> 'email'::text) = 'kakasphotography@gmail.com'::text);