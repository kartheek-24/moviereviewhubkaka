-- Drop existing permissive storage policies for posters
DROP POLICY IF EXISTS "Authenticated users can upload posters" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update posters" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete posters" ON storage.objects;

-- Create admin-only policies for poster management
CREATE POLICY "Admin can upload posters"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'posters' AND 
  (auth.jwt() ->> 'email' = 'kakasphotography@gmail.com')
);

CREATE POLICY "Admin can update posters"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'posters' AND 
  (auth.jwt() ->> 'email' = 'kakasphotography@gmail.com')
);

CREATE POLICY "Admin can delete posters"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'posters' AND 
  (auth.jwt() ->> 'email' = 'kakasphotography@gmail.com')
);