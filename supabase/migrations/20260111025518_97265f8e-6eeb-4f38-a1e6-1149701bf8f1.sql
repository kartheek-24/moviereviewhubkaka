-- Fix the Security Definer View warning by recreating with SECURITY INVOKER
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles 
WITH (security_invoker = true) AS
SELECT 
  id,
  display_name,
  platform,
  created_at,
  updated_at
FROM public.profiles;

-- Re-grant access to the view
GRANT SELECT ON public.public_profiles TO anon, authenticated;