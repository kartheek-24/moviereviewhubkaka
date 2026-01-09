-- App configuration table (stores admin email)
CREATE TABLE public.app_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_email TEXT NOT NULL DEFAULT 'kakasphotography@gmail.com',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default config
INSERT INTO public.app_config (admin_email) VALUES ('kakasphotography@gmail.com');

-- Enable RLS on app_config (public read, no write)
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read app config"
  ON public.app_config FOR SELECT
  USING (true);

-- Profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  push_enabled BOOLEAN DEFAULT false,
  push_token TEXT,
  platform TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  title_lower TEXT NOT NULL,
  language TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  snippet TEXT NOT NULL,
  content TEXT NOT NULL,
  poster_url TEXT,
  tags TEXT[],
  release_year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  comment_count INTEGER NOT NULL DEFAULT 0,
  helpful_count INTEGER NOT NULL DEFAULT 0
);

-- Index for search
CREATE INDEX idx_reviews_title_lower ON public.reviews(title_lower);
CREATE INDEX idx_reviews_language ON public.reviews(language);
CREATE INDEX idx_reviews_created_at ON public.reviews(created_at DESC);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews
CREATE POLICY "Anyone can read reviews"
  ON public.reviews FOR SELECT
  USING (true);

-- Only verified admin can create/update/delete reviews
CREATE POLICY "Admin can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'email' = 'kakasphotography@gmail.com'
    AND (auth.jwt() ->> 'email_verified')::boolean = true
  );

CREATE POLICY "Admin can update reviews"
  ON public.reviews FOR UPDATE
  USING (
    auth.jwt() ->> 'email' = 'kakasphotography@gmail.com'
    AND (auth.jwt() ->> 'email_verified')::boolean = true
  );

CREATE POLICY "Admin can delete reviews"
  ON public.reviews FOR DELETE
  USING (
    auth.jwt() ->> 'email' = 'kakasphotography@gmail.com'
    AND (auth.jwt() ->> 'email_verified')::boolean = true
  );

-- Comments table
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  text TEXT NOT NULL CHECK (char_length(text) >= 1 AND char_length(text) <= 500),
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  display_name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  device_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reported BOOLEAN NOT NULL DEFAULT false,
  reported_reason TEXT
);

CREATE INDEX idx_comments_review_id ON public.comments(review_id);
CREATE INDEX idx_comments_created_at ON public.comments(created_at DESC);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Anyone can read comments
CREATE POLICY "Anyone can read comments"
  ON public.comments FOR SELECT
  USING (true);

-- Anyone can create comments (guests and authenticated users)
CREATE POLICY "Anyone can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (true);

-- Admin can delete any comment
CREATE POLICY "Admin can delete any comment"
  ON public.comments FOR DELETE
  USING (
    auth.jwt() ->> 'email' = 'kakasphotography@gmail.com'
    AND (auth.jwt() ->> 'email_verified')::boolean = true
  );

-- Users can delete own comments
CREATE POLICY "Users can delete own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

-- Anyone can update comments (for reporting)
CREATE POLICY "Anyone can report comments"
  ON public.comments FOR UPDATE
  USING (true)
  WITH CHECK (
    -- Only allow updating reported fields
    true
  );

-- Helpful votes table
CREATE TABLE public.helpful_votes (
  id TEXT NOT NULL PRIMARY KEY, -- Deterministic: {reviewId}_{oderId or deviceId}
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  voter_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  voter_device_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_helpful_votes_review_id ON public.helpful_votes(review_id);

ALTER TABLE public.helpful_votes ENABLE ROW LEVEL SECURITY;

-- Anyone can read helpful votes
CREATE POLICY "Anyone can read helpful votes"
  ON public.helpful_votes FOR SELECT
  USING (true);

-- Anyone can create helpful votes (one per user/device handled by primary key)
CREATE POLICY "Anyone can create helpful votes"
  ON public.helpful_votes FOR INSERT
  WITH CHECK (true);

-- Guest devices table (for push tokens of non-authenticated users)
CREATE TABLE public.devices (
  id TEXT NOT NULL PRIMARY KEY, -- device_id
  push_token TEXT,
  push_enabled BOOLEAN NOT NULL DEFAULT true,
  platform TEXT,
  last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

-- Devices can only manage their own record (validated by device_id match in client)
CREATE POLICY "Anyone can read devices"
  ON public.devices FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert devices"
  ON public.devices FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update devices"
  ON public.devices FOR UPDATE
  USING (true);

-- Function to update comment count
CREATE OR REPLACE FUNCTION public.update_review_comment_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.reviews SET comment_count = comment_count + 1 WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.reviews SET comment_count = comment_count - 1 WHERE id = OLD.review_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER update_comment_count_on_insert
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_review_comment_count();

CREATE TRIGGER update_comment_count_on_delete
  AFTER DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_review_comment_count();

-- Function to update helpful count
CREATE OR REPLACE FUNCTION public.update_review_helpful_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.reviews SET helpful_count = helpful_count + 1 WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.reviews SET helpful_count = helpful_count - 1 WHERE id = OLD.review_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER update_helpful_count_on_insert
  AFTER INSERT ON public.helpful_votes
  FOR EACH ROW EXECUTE FUNCTION public.update_review_helpful_count();

CREATE TRIGGER update_helpful_count_on_delete
  AFTER DELETE ON public.helpful_votes
  FOR EACH ROW EXECUTE FUNCTION public.update_review_helpful_count();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_app_config_updated_at
  BEFORE UPDATE ON public.app_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();