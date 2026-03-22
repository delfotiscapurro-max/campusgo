import { useNavigate } from 'react-router-dom'
import { MapPin, Clock, Users, Star, ChevronRight, Instagram, Leaf, Navigation } from 'lucide-react'
import { formatTime, formatDateShort } from '../../utils/dateUtils.js'
import Avatar from '../ui/Avatar.jsx'
import Badge from '../ui/Badge.jsx'

export default function TripCard({ trip, compact = false }) {
  const navigate = useNavigate()
  const { driver, origin, destination, departureAt, seats, price, tags, type, passengers, pendingRequests } = trip

  const occupancyPercent = seats.total > 0 ? ((seats.total - seats.available) / seats.total) * 100 : 0
  const isAlmostFull = seats.available <= 1
  const isRequest = type === 'request'

  return (
    <button
      onClick={() => navigate(`/trip/${trip.id}`)}
      className="w-full bg-white rounded-3xl card-shadow p-4 flex flex-col gap-3 text-left press-effect transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <Avatar
            src={driver?.avatar}
            name={driver?.name || 'Usuario'}
            size="md"
            verified={driver?.instagramVerified}
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-800 text-sm">{driver?.name || 'Buscando conductor'}</span>
              {driver?.instagramVerified && (
                <Badge variant="verified" size="xs">
                  <Instagram size={8} />
                  <span>Verificado</span>
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <Star size={11} className="text-amber-400 fill-amber-400" />
              <span className="text-xs text-slate-500 font-medium">{driver?.rating?.toFixed(1)}</span>
              <span className="text-slate-300 text-xs">·</span>
              <span className="text-xs text-slate-400">{driver?.university?.split(' - ')[0]}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-lg font-bold text-indigo-600">{formatTime(departureAt)}</span>
          <span className="text-xs text-slate-400">{formatDateShort(departureAt)}</span>
        </div>
      </div>

      {/* Route */}
      <div className="flex items-stretch gap-3">
        <div className="flex flex-col items-center gap-0.5 py-0.5">
          <div className="w-2.5 h-2.5 rounded-full border-2 border-indigo-500 bg-white flex-shrink-0" />
          <div className="w-0.5 bg-gradient-to-b from-indigo-400 to-violet-400 flex-1 min-h-[16px]" />
          <div className="w-2.5 h-2.5 rounded-full bg-violet-500 flex-shrink-0" />
        </div>
        <div className="flex flex-col justify-between flex-1 gap-1">
          <div className="flex items-center gap-1">
            <span className="text-sm text-slate-700 font-medium truncate">{origin.label}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm text-slate-700 font-medium truncate">{destination.label}</span>
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Seats */}
          <div className="flex items-center gap-1.5">
            <div className="flex gap-0.5">
              {Array.from({ length: seats.total }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${i < seats.total - seats.available ? 'bg-indigo-400' : 'bg-slate-200'}`}
                />
              ))}
            </div>
            <span className={`text-xs font-semibold ${isAlmostFull ? 'text-amber-600' : 'text-slate-500'}`}>
              {isAlmostFull && seats.available > 0 ? '¡Último lugar!' : `${seats.available} lugar${seats.available !== 1 ? 'es' : ''}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {trip.co2SavedKg > 0 && (
            <div className="flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full">
              <Leaf size={10} className="text-emerald-600" />
              <span className="text-[11px] font-semibold text-emerald-700">{trip.co2SavedKg}kg CO₂</span>
            </div>
          )}
          <div className="bg-indigo-600 text-white px-3 py-1.5 rounded-full">
            <span className="text-sm font-bold">${price.toLocaleString('es-AR')}</span>
          </div>
        </div>
      </div>

      {/* Tags */}
      {tags?.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Passenger avatars */}
      {passengers?.length > 0 && (
        <div className="flex items-center gap-1.5 border-t border-slate-50 pt-2.5">
          <div className="flex -space-x-2">
            {passengers.slice(0, 3).map((p) => (
              <Avatar key={p.id} src={p.avatar} name={p.name} size="xs" className="ring-2 ring-white" />
            ))}
          </div>
          <span className="text-xs text-slate-400">
            {passengers.length === 1 ? `${passengers[0].name.split(' ')[0]} se sumó` : `${passengers.length} pasajeros confirmados`}
          </span>
        </div>
      )}
    </button>
  )
}
