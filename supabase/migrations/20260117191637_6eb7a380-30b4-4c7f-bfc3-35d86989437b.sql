-- Create table to track PWA install attempts
CREATE TABLE public.pwa_install_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id text NOT NULL,
  user_id uuid NULL,
  outcome text NOT NULL CHECK (outcome IN ('prompted', 'accepted', 'dismissed', 'fallback')),
  platform text NULL,
  source text NULL DEFAULT 'floating_button',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pwa_install_attempts ENABLE ROW LEVEL SECURITY;

-- Anyone can insert install attempts (for tracking)
CREATE POLICY "Anyone can record install attempts"
ON public.pwa_install_attempts
FOR INSERT
WITH CHECK (true);

-- Only admin can read install attempts (for analytics)
CREATE POLICY "Admin can read install attempts"
ON public.pwa_install_attempts
FOR SELECT
USING ((auth.jwt() ->> 'email'::text) = 'kakasphotography@gmail.com'::text);

-- Create index for faster queries
CREATE INDEX idx_pwa_install_attempts_created_at ON public.pwa_install_attempts(created_at DESC);
CREATE INDEX idx_pwa_install_attempts_outcome ON public.pwa_install_attempts(outcome);