import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Star, Car, Users, MapPin, Clock, Leaf, MessageCircle, Share2, Instagram, Navigation, ChevronRight } from 'lucide-react'
import { useTrips } from '../../context/TripsContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotifications } from '../../context/NotificationsContext.jsx'
import TopBar from '../../components/layout/TopBar.jsx'
import Avatar from '../../components/ui/Avatar.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import RequestRow from '../../components/trip/RequestRow.jsx'
import { formatTime, formatDate } from '../../utils/dateUtils.js'

export default function TripDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getTrip, getTripById, enrichTrip, requestToJoin, acceptRequest, denyRequest, isLoading } = useTrips()
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const [joinLoading, setJoinLoading] = useState(false)
  const [joined, setJoined] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)
  const [trip, setTrip] = useState(null)
  const [loadingTrip, setLoadingTrip] = useState(true)

  async function refreshTrip() {
    const { data } = await import('../../lib/supabase.js').then(m =>
      m.supabase.from('trips').select(
        `*, driver:profiles!trips_driver_id_fkey(id,name,avatar_url,university,instagram,instagram_verified,rating,total_ratings,trips_as_driver,trips_as_passenger,co2_saved_kg,points,bio,car),
        trip_passengers(user_id,profiles(id,name,avatar_url,university,instagram_verified,rating,total_ratings)),
        trip_requests(id,user_id,status,profiles(id,name,avatar_url,university,instagram_verified,rating,trips_as_passenger,bio))`
      ).eq('id', id).single()
    )
    if (data) {
      const { transformTrip } = await import('../../lib/supabase.js')
      setTrip(transformTrip(data))
    }
  }

  useEffect(() => {
    getTripById(id).then(t => { setTrip(t); setLoadingTrip(false) })
  }, [id])

  if (loadingTrip) return (
    <div className="min-h-dvh flex items-center justify-center bg-[#f5f6ff]">
      <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" style={{borderWidth:'3px'}} />
    </div>
  )
  if (!trip) return (
    <div className="page-content flex items-center justify-center">
      <TopBar back title="Viaje" />
      <p className="text-slate-500">Viaje no encontrado</p>
    </div>
  )

  const { driver, passengers, pendingRequests, origin, destination, departureAt, seats, price, tags, description } = trip

  const isDriver = user?.id === trip.driverId
  const isPassenger = trip.passengerIds?.includes(user?.id)
  const hasPending = trip.pendingRequestIds?.includes(user?.id)
  const isFull = seats.available === 0


  async function handleJoin() {
    setJoinLoading(true)
    await requestToJoin(trip.id, user.id)
    await addNotification({
      recipientId: trip.driverId,
      type: 'join_request',
      tripId: trip.id,
      actorId: user.id,
      message: `${user.name} quiere unirse a tu viaje 🚗`,
      actions: ['accept', 'deny'],
    })
    setJoined(true)
    setJoinLoading(false)
    await refreshTrip()
  }

  async function handleAccept(userId) {
    setActionLoading(userId)
    await acceptRequest(trip.id, userId)
    await addNotification({
      recipientId: userId,
      type: 'request_accepted',
      tripId: trip.id,
      actorId: user.id,
      message: `${user.name} aceptó tu solicitud 🎉 ¡Ya sos parte del viaje!`,
      actions: [],
    })
    setActionLoading(null)
    await refreshTrip()
  }

  async function handleDeny(userId) {
    setActionLoading(userId)
    await denyRequest(trip.id, userId)
    await addNotification({
      recipientId: userId,
      type: 'request_denied',
      tripId: trip.id,
      actorId: user.id,
      message: `${user.name} no pudo aceptarte esta vez 😕`,
      actions: [],
    })
    setActionLoading(null)
    await refreshTrip()
  }

  return (
    <div className="min-h-dvh bg-[#f5f6ff]">
      {/* Hero header with gradient */}
      <div className="gradient-bg-br relative overflow-hidden pt-12 pb-8 px-4">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-20 translate-x-20" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
        <div className="flex items-center justify-between mb-2 relative z-10">
          <button onClick={() => navigate(-1)} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center press-effect">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center press-effect">
            <Share2 size={16} className="text-white" />
          </button>
        </div>

        {/* Departure time prominent */}
        <div className="text-center relative z-10 mt-2">
          <div className="text-5xl font-black text-white">{formatTime(departureAt)}</div>
          <div className="text-indigo-200 text-sm font-medium mt-1">{formatDate(departureAt)}</div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="px-4 -mt-4 pb-32 flex flex-col gap-4 page-enter">
        {/* Route card */}
        <div className="bg-white rounded-3xl p-5 card-shadow">
          <div className="flex items-stretch gap-4">
            <div className="flex flex-col items-center gap-1 py-1">
              <div className="w-3 h-3 rounded-full border-2 border-indigo-500 bg-white" />
              <div className="w-0.5 bg-gradient-to-b from-indigo-400 to-violet-500 flex-1" />
              <div className="w-3 h-3 rounded-full bg-violet-500" />
            </div>
            <div className="flex flex-col gap-4 flex-1">
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">Origen</p>
                <p className="font-semibold text-slate-800">{origin.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">Radio de recogida: {trip.radiusKm}km</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">Destino</p>
                <p className="font-semibold text-slate-800">{destination.label}</p>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex gap-3 mt-4 pt-4 border-t border-slate-50">
            <div className="flex-1 flex flex-col items-center gap-1 bg-indigo-50 rounded-2xl py-3">
              <Users size={16} className="text-indigo-500" />
              <span className="text-xs font-semibold text-indigo-700">{seats.available} lugar{seats.available !== 1 ? 'es' : ''}</span>
              <span className="text-[10px] text-indigo-400">disponibles</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1 bg-violet-50 rounded-2xl py-3">
              <span className="text-base font-black text-violet-700">${price.toLocaleString('es-AR')}</span>
              <span className="text-[10px] text-violet-400">por persona</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1 bg-emerald-50 rounded-2xl py-3">
              <Leaf size={16} className="text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-700">{trip.co2SavedKg}kg</span>
              <span className="text-[10px] text-emerald-400">CO₂ ahorrado</span>
            </div>
          </div>
        </div>

        {/* Driver card */}
        {driver && (
          <div className="bg-white rounded-3xl p-5 card-shadow">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Conductor</p>
            <div className="flex items-center gap-4">
              <Avatar src={driver.avatar} name={driver.name} size="lg" verified={driver.instagramVerified} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">{driver.name}</span>
                  {driver.instagramVerified && (
                    <Badge variant="verified" size="xs"><Instagram size={8} /> Verificado</Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={13} className={i <= Math.round(driver.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} />
                  ))}
                  <span className="text-sm font-semibold text-slate-600 ml-1">{driver.rating?.toFixed(1)}</span>
                  <span className="text-xs text-slate-400">({driver.totalRatings})</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{driver.university}</p>
              </div>
              <button
                onClick={() => navigate(`/profile/${driver.id}`)}
                className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center press-effect"
              >
                <ChevronRight size={16} className="text-slate-500" />
              </button>
            </div>

            {description && (
              <div className="mt-4 bg-slate-50 rounded-2xl p-3">
                <p className="text-sm text-slate-600">"{description}"</p>
              </div>
            )}

            {driver.car && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50">
                <Car size={16} className="text-slate-400" />
                <span className="text-sm text-slate-600 font-medium">
                  {driver.car.make} {driver.car.model} {driver.car.year} — {driver.car.color}
                </span>
                <span className="ml-auto text-xs text-slate-400 font-mono">{driver.car.plate}</span>
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {tags?.length > 0 && (
          <div className="bg-white rounded-3xl p-5 card-shadow">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Características del viaje</p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Passengers */}
        {passengers?.length > 0 && (
          <div className="bg-white rounded-3xl p-5 card-shadow">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
              Pasajeros confirmados ({passengers.length})
            </p>
            <div className="flex flex-col gap-3">
              {passengers.map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <Avatar src={p.avatar} name={p.name} size="sm" verified={p.instagramVerified} />
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.university?.split(' - ')[1]}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1">
                    <Star size={11} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs text-slate-500">{p.rating?.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending requests (driver only) */}
        {isDriver && pendingRequests?.length > 0 && (
          <div className="bg-white rounded-3xl p-5 card-shadow">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
              Solicitudes pendientes ({pendingRequests.length})
            </p>
            <div className="flex flex-col gap-3">
              {pendingRequests.map((req) => (
                <RequestRow
                  key={req.id}
                  user={req}
                  loading={actionLoading === req.id}
                  onAccept={() => handleAccept(req.id)}
                  onDeny={() => handleDeny(req.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom action */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-width-[430px] max-w-[430px] bg-white/95 backdrop-blur border-t border-slate-100 px-4 py-4 pb-[calc(1rem+var(--safe-bottom))] flex gap-3">
        {isDriver ? (
          <>
            <button className="flex-1 flex items-center justify-center gap-2 bg-slate-100 rounded-2xl py-3.5 text-slate-700 font-semibold text-sm press-effect">
              <MessageCircle size={18} /> Chat del viaje
            </button>
          </>
        ) : isPassenger ? (
          <div className="flex-1 bg-emerald-50 rounded-2xl py-3.5 flex items-center justify-center gap-2">
            <span className="text-emerald-600 font-bold">✓ Confirmado en este viaje</span>
          </div>
        ) : hasPending || joined ? (
          <div className="flex-1 bg-amber-50 rounded-2xl py-3.5 flex items-center justify-center gap-2">
            <span className="text-amber-600 font-bold">⏳ Solicitud enviada, esperando aprobación</span>
          </div>
        ) : isFull ? (
          <div className="flex-1 bg-slate-100 rounded-2xl py-3.5 flex items-center justify-center">
            <span className="text-slate-500 font-semibold">Auto completo 😕</span>
          </div>
        ) : (
          <>
            <button className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center press-effect flex-shrink-0">
              <MessageCircle size={20} className="text-slate-600" />
            </button>
            <Button onClick={handleJoin} loading={joinLoading} fullWidth size="lg">
              Solicitar unirme 🚗
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
