-- Create enum for park types
CREATE TYPE public.park_type AS ENUM ('camping', 'bungalowpark', 'glamping', 'vakantiepark', 'resort');

-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create parks table
CREATE TABLE public.parks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  google_place_id TEXT UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  park_type park_type DEFAULT 'vakantiepark',
  google_rating DECIMAL(2, 1),
  google_ratings_total INTEGER DEFAULT 0,
  website TEXT,
  phone TEXT,
  opening_hours JSONB,
  facilities TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create park_photos table (store URLs, not files)
CREATE TABLE public.park_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  park_id UUID NOT NULL REFERENCES public.parks(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  photo_reference TEXT,
  is_primary BOOLEAN DEFAULT false,
  is_from_google BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  park_id UUID NOT NULL REFERENCES public.parks(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table for admin users
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- Enable RLS on all tables
ALTER TABLE public.parks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.park_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Parks policies: everyone can read visible parks, admins can manage
CREATE POLICY "Anyone can view visible parks"
  ON public.parks FOR SELECT
  USING (is_visible = true);

CREATE POLICY "Admins can view all parks"
  ON public.parks FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert parks"
  ON public.parks FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update parks"
  ON public.parks FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete parks"
  ON public.parks FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Park photos policies
CREATE POLICY "Anyone can view park photos"
  ON public.park_photos FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage park photos"
  ON public.park_photos FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Reviews policies: everyone can read approved, anyone can create, admins can manage
CREATE POLICY "Anyone can view approved reviews"
  ON public.reviews FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Anyone can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all reviews"
  ON public.reviews FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update reviews"
  ON public.reviews FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete reviews"
  ON public.reviews FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_parks_updated_at
  BEFORE UPDATE ON public.parks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_parks_province ON public.parks(province);
CREATE INDEX idx_parks_park_type ON public.parks(park_type);
CREATE INDEX idx_parks_is_visible ON public.parks(is_visible);
CREATE INDEX idx_parks_is_featured ON public.parks(is_featured);
CREATE INDEX idx_parks_google_place_id ON public.parks(google_place_id);
CREATE INDEX idx_park_photos_park_id ON public.park_photos(park_id);
CREATE INDEX idx_reviews_park_id ON public.reviews(park_id);
CREATE INDEX idx_reviews_is_approved ON public.reviews(is_approved);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);

-- Create storage bucket for park images
INSERT INTO storage.buckets (id, name, public) VALUES ('park-images', 'park-images', true);

-- Storage policies
CREATE POLICY "Anyone can view park images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'park-images');

CREATE POLICY "Admins can upload park images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'park-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update park images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'park-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete park images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'park-images' AND public.has_role(auth.uid(), 'admin'));