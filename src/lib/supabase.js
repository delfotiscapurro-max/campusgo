import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// Transform Supabase profile row → app user object
export function transformProfile(raw) {
  if (!raw) return null
  return {
    id: raw.id,
    name: raw.name,
    firstName: raw.name?.split(' ')[0],
    email: raw.email,
    avatar: raw.avatar_url,
    university: raw.university,
    career: raw.career,
    year: raw.year,
    instagram: raw.instagram,
    instagramVerified: raw.instagram_verified,
    rating: raw.rating != null ? parseFloat(raw.rating) : null,
    totalRatings: raw.total_ratings || 0,
    tripsAsDriver: raw.trips_as_driver || 0,
    tripsAsPassenger: raw.trips_as_passenger || 0,
    co2SavedKg: parseFloat(raw.co2_saved_kg) || 0,
    points: raw.points || 0,
    bio: raw.bio,
    car: raw.car,
    location: raw.location,
    joinedAt: raw.created_at,
    reviews: raw.reviews || [],
  }
}

// Transform Supabase trip row → app trip object
export function transformTrip(raw) {
  if (!raw) return null
  const passengers = (raw.trip_passengers || []).map(p =>
    transformProfile(p.profiles || p.profile)
  ).filter(Boolean)

  const pendingRequests = (raw.trip_requests || [])
    .filter(r => r.status === 'pending')
    .map(r => transformProfile(r.profiles || r.profile))
    .filter(Boolean)

  return {
    id: raw.id,
    type: raw.type,
    driverId: raw.driver_id,
    passengerId: raw.passenger_id,
    driver: transformProfile(raw.driver),
    origin: raw.origin,
    destination: raw.destination,
    departureAt: raw.departure_at,
    seats: { total: raw.seats_total, available: raw.seats_available },
    radiusKm: raw.radius_km,
    price: raw.price,
    description: raw.description,
    tags: raw.tags || [],
    passengers,
    pendingRequests,
    passengerIds: passengers.map(p => p.id),
    pendingRequestIds: pendingRequests.map(p => p.id),
    status: raw.status,
    co2SavedKg: parseFloat(raw.co2_saved_kg) || 0,
    createdAt: raw.created_at,
  }
}

const TRIP_SELECT = `
  *,
  driver:profiles!trips_driver_id_fkey(
    id, name, avatar_url, university, career, year,
    instagram, instagram_verified, rating, total_ratings,
    trips_as_driver, trips_as_passenger, co2_saved_kg, points, bio, car
  ),
  trip_passengers(
    user_id,
    profiles(id, name, avatar_url, university, instagram_verified, rating, total_ratings)
  ),
  trip_requests(
    id, user_id, status,
    profiles(id, name, avatar_url, university, instagram_verified, rating, trips_as_passenger, bio)
  )
`

export { TRIP_SELECT }
