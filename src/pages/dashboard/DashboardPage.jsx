import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Car, Users, Clock, CheckCircle, XCircle, ChevronRight, MapPin } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useTrips } from '../../context/TripsContext.jsx'
import TopBar from '../../components/layout/TopBar.jsx'
import { formatTime, formatDateShort } from '../../utils/dateUtils.js'

export default function DashboardPage() {
  const { user } = useAuth()
  const { getUserTrips, confirmTrip, getPendingConfirmationTrips } = useTrips()
  const navigate = useNavigate()
  const [tab, setTab] = useState('upcoming')
  const [confirming, setConfirming] = useState(null)
  const [showAllConfirmations, setShowAllConfirmations] = useState(false)

  const myTrips = getUserTrips(user?.id)
  const now = new Date()
  const upcoming = myTrips.filter(t => new Date(t.departureAt) > now && t.status !== 'completed' && t.status !== 'cancelled')
  const completed = myTrips.filter(t => t.status === 'completed')
  const pendingConfirmations = getPendingConfirmationTrips()

  const displayed = tab === 'upcoming' ? upcoming : completed

  const handleConfirm = async (tripId, attended) => {
    setConfirming(tripId)
    await confirmTrip(tripId, attended)
    setConfirming(null)
  }

  const statusConfig = {
    open: { icon: Clock, label: 'Abierto', color: 'text-indigo-600 bg-indigo-50' },
    full: { icon: CheckCircle, label: 'Completo', color: 'text-emerald-600 bg-emerald-50' },
    completed: { icon: CheckCircle, label: 'Completado', color: 'text-emerald-600 bg-emerald-50' },
    cancelled: { icon: XCircle, label: 'Cancelado', color: 'text-rose-600 bg-rose-50' },
  }

  return (
    <div className="page-content">
      <TopBar title="Mis viajes" />
      <div className="px-4 pt-4 page-enter">

        {/* Viajes por confirmar */}
        <div className="gradient-bg-br rounded-3xl p-5 mb-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
          <p className="text-white font-bold text-base mb-1 relative z-10">¿Realizaste estos viajes?</p>
          <p className="text-indigo-200 text-xs mb-4 relative z-10">Confirmá para registrar tu historial</p>

          {pendingConfirmations.length === 0 ? (
            <div className="bg-white/10 rounded-2xl p-4 text-center relative z-10">
              <p className="text-white/80 text-sm">Todo al día</p>
              <p className="text-indigo-200 text-xs mt-0.5">No hay viajes pendientes de confirmar</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 relative z-10">
              {(showAllConfirmations ? pendingConfirmations : pendingConfirmations.slice(0, 1)).map(trip => {
                const isDriver = trip.driverId === user?.id
                const isLoading = confirming === trip.id
                return (
                  <div key={trip.id} className="bg-white/10 rounded-2xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      {isDriver ? <Car size={14} className="text-indigo-200" /> : <Users size={14} className="text-indigo-200" />}
                      <span className="text-white text-xs font-semibold truncate">{trip.origin?.label} → {trip.destination?.label}</span>
                      <span className="text-indigo-300 text-xs ml-auto flex-shrink-0">{formatTime(trip.departureAt)} · {formatDateShort(trip.departureAt)}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        disabled={isLoading}
                        onClick={() => handleConfirm(trip.id, true)}
                        className="flex-1 bg-emerald-400/30 hover:bg-emerald-400/50 text-white text-xs font-semibold py-2 rounded-xl transition-colors disabled:opacity-50"
                      >
                        ✓ Sí, fui
                      </button>
                      <button
                        disabled={isLoading}
                        onClick={() => handleConfirm(trip.id, false)}
                        className="flex-1 bg-white/10 hover:bg-white/20 text-indigo-200 text-xs font-semibold py-2 rounded-xl transition-colors disabled:opacity-50"
                      >
                        ✗ No fui
                      </button>
                    </div>
                  </div>
                )
              })}
              {pendingConfirmations.length > 1 && (
                <button
                  onClick={() => setShowAllConfirmations(v => !v)}
                  className="text-indigo-200 text-xs font-semibold text-left pt-1"
                >
                  {showAllConfirmations ? 'Ver menos' : `Ver ${pendingConfirmations.length - 1} más`}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-100 rounded-2xl p-1 mb-4">
          {[
            { key: 'upcoming', label: `Próximos (${upcoming.length})` },
            { key: 'completed', label: `Completados (${completed.length})` },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === t.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Trip list */}
        {displayed.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">{tab === 'upcoming' ? '🗓️' : '✅'}</div>
            <p className="font-semibold text-slate-700">
              {tab === 'upcoming' ? 'No tenés viajes próximos' : 'No hay viajes completados aún'}
            </p>
            <p className="text-slate-400 text-sm mt-1">
              {tab === 'upcoming' ? 'Publicá un viaje o unite a uno del feed' : '¡Completá tu primer viaje!'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {displayed.map((trip) => {
              const isDriver = trip.driverId === user?.id
              const status = statusConfig[trip.status] || statusConfig.open
              const StatusIcon = status.icon
              return (
                <button
                  key={trip.id}
                  onClick={() => navigate(`/trip/${trip.id}`)}
                  className="w-full bg-white rounded-3xl card-shadow p-4 flex gap-4 text-left press-effect"
                >
                  {/* Left: icon */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${isDriver ? 'bg-indigo-50' : 'bg-violet-50'}`}>
                    {isDriver ? <Car size={20} className="text-indigo-500" /> : <Users size={20} className="text-violet-500" />}
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs text-slate-400 truncate">{trip.origin?.label}</p>
                        <p className="font-semibold text-slate-800 text-sm truncate">→ {trip.destination?.label}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-slate-700 text-sm">{formatTime(trip.departureAt)}</p>
                        <p className="text-xs text-slate-400">{formatDateShort(trip.departureAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${status.color}`}>
                          {isDriver ? '🗝️ Conductor' : '🚶 Pasajero'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <StatusIcon size={12} className={status.color.split(' ')[0]} />
                        <span className={`text-[11px] font-medium ${status.color.split(' ')[0]}`}>{status.label}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 self-center flex-shrink-0" />
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
