-- Create a storage bucket for review posters
INSERT INTO storage.buckets (id, name, public)
VALUES ('posters', 'posters', true);

-- Allow anyone to view posters (public bucket)
CREATE POLICY "Posters are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'posters');

-- Allow authenticated users to upload posters
CREATE POLICY "Authenticated users can upload posters"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'posters' AND auth.role() = 'authenticated');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update posters"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'posters' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete posters
CREATE POLICY "Authenticated users can delete posters"
ON storage.objects
FOR DELETE
USING (bucket_id = 'posters' AND auth.role() = 'authenticated');