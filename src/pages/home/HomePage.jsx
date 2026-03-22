import { useState } from 'react'
import { Search, SlidersHorizontal, Leaf } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useTrips } from '../../context/TripsContext.jsx'
import TopBar from '../../components/layout/TopBar.jsx'
import TripCard from '../../components/trip/TripCard.jsx'
import StoriesBar from '../../components/stories/StoriesBar.jsx'
import { formatDate } from '../../utils/dateUtils.js'

const DATE_FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'today', label: 'Hoy' },
  { key: 'tomorrow', label: 'Mañana' },
]

const ROLE_FILTERS = [
  { key: 'all', label: '🚗 Todos' },
  { key: 'offer', label: '🗝️ Conductores' },
  { key: 'request', label: '🙋 Busco viaje' },
]

export default function HomePage() {
  const { user } = useAuth()
  const { getFeedTrips } = useTrips()
  const [dateFilter, setDateFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  const allTrips = getFeedTrips()

  const filtered = allTrips.filter((trip) => {
    if (roleFilter !== 'all' && trip.type !== roleFilter) return false
    if (dateFilter !== 'all') {
      const dep = new Date(trip.departureAt)
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      if (dateFilter === 'today' && dep.toDateString() !== today.toDateString()) return false
      if (dateFilter === 'tomorrow' && dep.toDateString() !== tomorrow.toDateString()) return false
    }
    if (search) {
      const q = search.toLowerCase()
      if (!trip.origin.label.toLowerCase().includes(q) && !trip.destination.label.toLowerCase().includes(q)) return false
    }
    return true
  })

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="page-content">
      <TopBar />
      <div className="page-enter">
        {/* Greeting */}
        <div className="px-4 pt-4 pb-2">
          <p className="text-slate-500 text-sm font-medium">{greeting} 👋</p>
          <h1 className="text-2xl font-extrabold text-slate-800">
            Hola, <span className="gradient-text">{user?.firstName || user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">¿A dónde vas hoy?</p>
        </div>

        {/* Search bar */}
        <div className="px-4 py-2">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar destino..."
                className="w-full bg-white rounded-2xl pl-10 pr-4 py-3 text-sm text-slate-700 placeholder-slate-400 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 card-shadow"
              />
            </div>
            <button className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center card-shadow press-effect">
              <SlidersHorizontal size={18} className="text-slate-500" />
            </button>
          </div>
        </div>

        {/* CO2 banner */}
        {user?.co2SavedKg > 0 && (
          <div className="mx-4 mb-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
              <Leaf size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">¡Tu impacto importa! 🌎</p>
              <p className="text-emerald-100 text-xs">Ahorraste {user.co2SavedKg}kg de CO₂ compartiendo viajes</p>
            </div>
          </div>
        )}

        {/* Stories — Active Drivers */}
        <div className="mb-2">
          <div className="flex items-center justify-between px-4 mb-3">
            <p className="text-slate-700 font-semibold text-sm">Conductores activos hoy</p>
          </div>
          <StoriesBar />
        </div>

        {/* Date filter */}
        <div className="flex gap-2 px-4 overflow-x-auto hide-scrollbar mb-3">
          {DATE_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setDateFilter(f.key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold flex-shrink-0 transition-all press-effect ${
                dateFilter === f.key
                  ? 'gradient-bg text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
          <div className="w-px h-8 bg-slate-200 self-center mx-1 flex-shrink-0" />
          {ROLE_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setRoleFilter(f.key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold flex-shrink-0 transition-all press-effect ${
                roleFilter === f.key
                  ? 'bg-violet-500 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Feed */}
        <div className="px-4 flex flex-col gap-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🔍</div>
              <p className="font-semibold text-slate-700">No hay viajes disponibles</p>
              <p className="text-slate-400 text-sm mt-1">Probá cambiando los filtros o publicá el tuyo</p>
            </div>
          ) : (
            filtered.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
