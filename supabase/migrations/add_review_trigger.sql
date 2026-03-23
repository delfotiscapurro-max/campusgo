-- Correr en el SQL Editor de Supabase
-- Agrega trigger para recalcular rating automáticamente + unique constraint en reviews

-- 1. Unique constraint para evitar reseñas duplicadas
ALTER TABLE public.reviews
  DROP CONSTRAINT IF EXISTS reviews_reviewer_reviewee_trip_unique;
ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_reviewer_reviewee_trip_unique UNIQUE (reviewer_id, reviewee_id, trip_id);

-- 2. Cambiar default de rating a NULL (nuevos usuarios arrancan sin rating)
ALTER TABLE public.profiles ALTER COLUMN rating SET DEFAULT NULL;

-- 3. Función que recalcula rating y total_ratings del perfil
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

-- 4. Trigger que se dispara después de cada INSERT en reviews
DROP TRIGGER IF EXISTS on_review_inserted ON public.reviews;
CREATE TRIGGER on_review_inserted
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_profile_rating();
