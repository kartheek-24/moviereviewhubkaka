-- Drop existing broken policies for reviews
DROP POLICY IF EXISTS "Admin can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admin can update reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admin can delete reviews" ON public.reviews;

-- Recreate with simplified check (auto-confirm is enabled, so just check email)
CREATE POLICY "Admin can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = 'kakasphotography@gmail.com');

CREATE POLICY "Admin can update reviews"
  ON public.reviews FOR UPDATE
  USING (auth.jwt() ->> 'email' = 'kakasphotography@gmail.com');

CREATE POLICY "Admin can delete reviews"
  ON public.reviews FOR DELETE
  USING (auth.jwt() ->> 'email' = 'kakasphotography@gmail.com');