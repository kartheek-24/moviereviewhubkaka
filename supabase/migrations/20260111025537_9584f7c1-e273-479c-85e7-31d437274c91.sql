-- Drop the view entirely - we don't need it since we have proper RLS on profiles
DROP VIEW IF EXISTS public.public_profiles;

-- Fix app_config exposure - restrict to admin only
DROP POLICY IF EXISTS "Anyone can read app config" ON public.app_config;

CREATE POLICY "Only admin can read app config"
  ON public.app_config FOR SELECT
  USING ((auth.jwt() ->> 'email') = 'kakasphotography@gmail.com');