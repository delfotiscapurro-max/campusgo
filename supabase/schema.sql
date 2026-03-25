-- ============================================
-- CampusGo - Supabase Schema
-- Correr una vez en el SQL Editor de Supabase
-- ============================================

-- Profiles (extiende auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  university TEXT DEFAULT '',
  career TEXT DEFAULT '',
  year TEXT DEFAULT '',
  instagram TEXT DEFAULT '',
  instagram_verified BOOLEAN DEFAULT FALSE,
  avatar_url TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  rating DECIMAL(3,2) DEFAULT NULL,
  total_ratings INT DEFAULT 0,
  trips_as_driver INT DEFAULT 0,
  trips_as_passenger INT DEFAULT 0,
  co2_saved_kg DECIMAL(10,2) DEFAULT 0,
  points INT DEFAULT 0,
  car JSONB DEFAULT NULL,
  location JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trips
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'offer' CHECK (type IN ('offer', 'request')),
  driver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  passenger_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  origin JSONB NOT NULL,
  destination JSONB NOT NULL,
  departure_at TIMESTAMPTZ NOT NULL,
  seats_total INT DEFAULT 3,
  seats_available INT DEFAULT 3,
  radius_km DECIMAL(5,2) DEFAULT 2,
  price INT DEFAULT 0,
  description TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'full', 'completed', 'cancelled')),
  co2_saved_kg DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pasajeros confirmados
CREATE TABLE IF NOT EXISTS public.trip_passengers (
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (trip_id, user_id)
);

-- Solicitudes de unión pendientes
CREATE TABLE IF NOT EXISTS public.trip_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'denied')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (trip_id, user_id)
);

-- Notificaciones
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  actions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Confirmaciones de viaje
CREATE TABLE IF NOT EXISTS public.trip_confirmations (
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  attended BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (trip_id, user_id)
);

-- Reseñas
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (reviewer_id, reviewee_id, trip_id)
);

-- Trigger: recalcula rating del perfil cuando se inserta una reseña
CREATE OR REPLACE FUNCTION public.update_profile_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET
    rating = (SELECT ROUND(AVG(rating)::NUMERIC, 2) FROM public.reviews WHERE reviewee_id = NEW.reviewee_id),
    total_ratings = (SELECT COUNT(*) FROM public.reviews WHERE reviewee_id = NEW.reviewee_id)
  WHERE id = NEW.reviewee_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_review_inserted ON public.reviews;
CREATE TRIGGER on_review_inserted
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_profile_rating();

-- Trigger: crea perfil automáticamente cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, university, career, year, instagram, bio)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'university', ''),
    COALESCE(NEW.raw_user_meta_data->>'career', ''),
    COALESCE(NEW.raw_user_meta_data->>'year', ''),
    COALESCE(NEW.raw_user_meta_data->>'instagram', ''),
    COALESCE(NEW.raw_user_meta_data->>'bio', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Trips policies
DROP POLICY IF EXISTS "trips_select" ON public.trips;
DROP POLICY IF EXISTS "trips_insert" ON public.trips;
DROP POLICY IF EXISTS "trips_update" ON public.trips;
CREATE POLICY "trips_select" ON public.trips FOR SELECT USING (true);
CREATE POLICY "trips_insert" ON public.trips FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "trips_update" ON public.trips FOR UPDATE USING (auth.uid() = driver_id OR auth.uid() = passenger_id);

-- Trip passengers policies
DROP POLICY IF EXISTS "trip_passengers_select" ON public.trip_passengers;
DROP POLICY IF EXISTS "trip_passengers_insert" ON public.trip_passengers;
DROP POLICY IF EXISTS "trip_passengers_delete" ON public.trip_passengers;
CREATE POLICY "trip_passengers_select" ON public.trip_passengers FOR SELECT USING (true);
CREATE POLICY "trip_passengers_insert" ON public.trip_passengers FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "trip_passengers_delete" ON public.trip_passengers FOR DELETE USING (auth.uid() = user_id);

-- Trip requests policies
DROP POLICY IF EXISTS "trip_requests_select" ON public.trip_requests;
DROP POLICY IF EXISTS "trip_requests_insert" ON public.trip_requests;
DROP POLICY IF EXISTS "trip_requests_update" ON public.trip_requests;
CREATE POLICY "trip_requests_select" ON public.trip_requests FOR SELECT USING (
  auth.uid() = user_id OR
  auth.uid() IN (SELECT driver_id FROM public.trips WHERE id = trip_id)
);
CREATE POLICY "trip_requests_insert" ON public.trip_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "trip_requests_update" ON public.trip_requests FOR UPDATE USING (
  auth.uid() IN (SELECT driver_id FROM public.trips WHERE id = trip_id) OR auth.uid() = user_id
);

-- Notifications policies
DROP POLICY IF EXISTS "notifications_select" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update" ON public.notifications;
CREATE POLICY "notifications_select" ON public.notifications FOR SELECT USING (auth.uid() = recipient_id);
CREATE POLICY "notifications_insert" ON public.notifications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "notifications_update" ON public.notifications FOR UPDATE USING (auth.uid() = recipient_id);

-- Reviews policies
DROP POLICY IF EXISTS "reviews_select" ON public.reviews;
DROP POLICY IF EXISTS "reviews_insert" ON public.reviews;
CREATE POLICY "reviews_select" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Habilitar Realtime para notificaciones
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_requests;
