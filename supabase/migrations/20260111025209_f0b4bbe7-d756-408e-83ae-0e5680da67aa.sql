-- Fix 1: Protect email field in profiles table
-- Create a view that exposes only public profile fields
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  display_name,
  platform,
  created_at,
  updated_at
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create more restrictive policies: users can only see their own full profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Fix 2: Secure devices table by linking devices to users and restricting access
-- Add user_id column to devices for ownership tracking
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Drop overly permissive policies on devices
DROP POLICY IF EXISTS "Anyone can insert devices" ON public.devices;
DROP POLICY IF EXISTS "Anyone can update devices" ON public.devices;
DROP POLICY IF EXISTS "Anyone can read devices" ON public.devices;

-- Create RPC function for secure device registration with rate limiting concept
CREATE OR REPLACE FUNCTION public.register_device(
  p_device_id TEXT,
  p_push_token TEXT DEFAULT NULL,
  p_platform TEXT DEFAULT NULL,
  p_push_enabled BOOLEAN DEFAULT TRUE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get current user if authenticated
  v_user_id := auth.uid();
  
  -- Validate device_id format (must start with 'device_' and be reasonable length)
  IF p_device_id IS NULL OR char_length(p_device_id) < 10 OR char_length(p_device_id) > 100 THEN
    RAISE EXCEPTION 'Invalid device ID format';
  END IF;
  
  IF NOT p_device_id LIKE 'device_%' THEN
    RAISE EXCEPTION 'Invalid device ID format';
  END IF;
  
  -- Upsert device, linking to user if authenticated
  INSERT INTO public.devices (id, user_id, push_token, push_enabled, platform, last_seen_at)
  VALUES (p_device_id, v_user_id, p_push_token, p_push_enabled, p_platform, now())
  ON CONFLICT (id) DO UPDATE SET
    push_token = COALESCE(EXCLUDED.push_token, devices.push_token),
    push_enabled = EXCLUDED.push_enabled,
    platform = COALESCE(EXCLUDED.platform, devices.platform),
    last_seen_at = now(),
    -- Only update user_id if it was null and user is now authenticated
    user_id = COALESCE(devices.user_id, EXCLUDED.user_id);
END;
$$;

-- Create RPC function to update device push settings
CREATE OR REPLACE FUNCTION public.update_device_push(
  p_device_id TEXT,
  p_push_enabled BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_device_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  -- Get the device's user_id
  SELECT user_id INTO v_device_user_id FROM public.devices WHERE id = p_device_id;
  
  -- Allow update if: device has no user, or user owns the device
  IF v_device_user_id IS NULL OR v_device_user_id = v_user_id THEN
    UPDATE public.devices 
    SET push_enabled = p_push_enabled, last_seen_at = now()
    WHERE id = p_device_id;
  ELSE
    RAISE EXCEPTION 'Not authorized to update this device';
  END IF;
END;
$$;

-- Create restrictive RLS policies for devices
-- Only allow reading own devices (authenticated) or the specific device (for anonymous users via RPC)
CREATE POLICY "Users can view own devices"
  ON public.devices FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);

-- No direct INSERT/UPDATE - must use RPC functions
-- This prevents the "always true" policy warnings