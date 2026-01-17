-- Drop the existing permissive policy on devices table
DROP POLICY IF EXISTS "Users can view own devices" ON public.devices;

-- Create a stricter policy that only allows authenticated users to view their own devices
CREATE POLICY "Users can view own devices"
ON public.devices
FOR SELECT
USING (auth.uid() = user_id);