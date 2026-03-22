import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Car, Users, Leaf, Star, Trophy, Clock, CheckCircle, XCircle, ChevronRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useTrips } from '../../context/TripsContext.jsx'
import TopBar from '../../components/layout/TopBar.jsx'
import Avatar from '../../components/ui/Avatar.jsx'
import StatCard from '../../components/ui/StatCard.jsx'
import { formatTime, formatDateShort } from '../../utils/dateUtils.js'

export default function DashboardPage() {
  const { user } = useAuth()
  const { getUserTrips } = useTrips()
  const navigate = useNavigate()
  const [tab, setTab] = useState('upcoming')

  const myTrips = getUserTrips(user?.id)
  const now = new Date()
  const upcoming = myTrips.filter(t => new Date(t.departureAt) > now && t.status !== 'completed' && t.status !== 'cancelled')
  const completed = myTrips.filter(t => t.status === 'completed')
  const asDriver = myTrips.filter(t => t.driverId === user?.id)
  const asPassenger = myTrips.filter(t => (t.passengerIds || []).includes(user?.id))

  const displayed = tab === 'upcoming' ? upcoming : completed

  const co2Total = user?.co2SavedKg || 0
  const pointsTotal = user?.points || 0

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

        {/* User summary */}
        <div className="gradient-bg-br rounded-3xl p-5 mb-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <Avatar src={user?.avatar} name={user?.name} size="md" verified={user?.instagramVerified} />
            <div>
              <p className="text-white font-bold">{user?.name}</p>
              <p className="text-indigo-200 text-sm">{user?.university}</p>
            </div>
            <div className="ml-auto flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full">
              <Trophy size={14} className="text-amber-300" />
              <span className="text-white font-bold text-sm">{pointsTotal.toLocaleString()}</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 relative z-10">
            <div className="bg-white/15 rounded-2xl p-3 text-center">
              <p className="text-white text-xl font-black">{user?.tripsAsDriver || 0}</p>
              <p className="text-indigo-200 text-[11px] font-medium">como conductor</p>
            </div>
            <div className="bg-white/15 rounded-2xl p-3 text-center">
              <p className="text-white text-xl font-black">{user?.tripsAsPassenger || 0}</p>
              <p className="text-indigo-200 text-[11px] font-medium">como pasajero</p>
            </div>
            <div className="bg-white/15 rounded-2xl p-3 text-center">
              <div className="flex items-center justify-center gap-0.5">
                <Star size={14} className="text-amber-300 fill-amber-300" />
                <p className="text-white text-xl font-black">{user?.rating?.toFixed(1)}</p>
              </div>
              <p className="text-indigo-200 text-[11px] font-medium">calificación</p>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatCard emoji="🌎" value={`${co2Total}kg`} label="CO₂ ahorrado" color="emerald" />
          <StatCard emoji="⭐" value={`${pointsTotal.toLocaleString()}`} label="Puntos ganados" color="amber" />
        </div>

        {/* Level progress */}
        <div className="bg-white rounded-3xl p-4 card-shadow mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏆</span>
              <div>
                <p className="font-bold text-slate-800 text-sm">Nivel Explorador</p>
                <p className="text-xs text-slate-400">{pointsTotal} / 2000 puntos para Aventurero</p>
              </div>
            </div>
            <span className="text-indigo-600 font-bold text-sm">{Math.round((pointsTotal / 2000) * 100)}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full">
            <div className="h-2 gradient-bg rounded-full transition-all duration-700" style={{ width: `${Math.min((pointsTotal / 2000) * 100, 100)}%` }} />
          </div>
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
