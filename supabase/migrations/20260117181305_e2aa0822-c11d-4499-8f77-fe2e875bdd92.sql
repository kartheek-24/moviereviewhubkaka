-- Change rating column from integer to numeric to allow decimal values
ALTER TABLE public.reviews ALTER COLUMN rating TYPE numeric(3,2) USING rating::numeric(3,2);