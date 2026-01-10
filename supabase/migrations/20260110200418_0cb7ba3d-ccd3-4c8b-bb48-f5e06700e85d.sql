-- Add new release_date column
ALTER TABLE public.reviews ADD COLUMN release_date date;

-- Migrate existing data (convert year to date: Jan 1 of that year)
UPDATE public.reviews 
SET release_date = make_date(release_year, 1, 1) 
WHERE release_year IS NOT NULL;

-- Drop old release_year column
ALTER TABLE public.reviews DROP COLUMN release_year;