import { useState } from 'react'
import { Search, SlidersHorizontal, Leaf, X, Check } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useTrips } from '../../context/TripsContext.jsx'
import TopBar from '../../components/layout/TopBar.jsx'
import TripCard from '../../components/trip/TripCard.jsx'
import StoriesBar from '../../components/stories/StoriesBar.jsx'
import { UNIVERSITIES } from '../../data/universities.js'

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

const SORT_OPTIONS = [
  { key: 'time', label: '🕐 Hora de salida' },
  { key: 'price', label: '💰 Menor precio' },
  { key: 'rating', label: '⭐ Mejor conductor' },
]

const MAX_PRICE_SLIDER = 30000

const SEAT_OPTIONS = [
  { key: 0, label: 'Cualquiera' },
  { key: 1, label: '1+ lugar' },
  { key: 2, label: '2+ lugares' },
  { key: 3, label: '3+ lugares' },
]

export default function HomePage() {
  const { user } = useAuth()
  const { getFeedTrips } = useTrips()
  const [dateFilter, setDateFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Advanced filters
  const [sortBy, setSortBy] = useState('time')
  const [maxPrice, setMaxPrice] = useState(0)
  const [minSeats, setMinSeats] = useState(0)
  const [onlyVerified, setOnlyVerified] = useState(false)
  const [destFilter, setDestFilter] = useState('')

  const activeFilterCount = [
    sortBy !== 'time',
    maxPrice > 0,
    minSeats > 0,
    onlyVerified,
    destFilter !== '',
  ].filter(Boolean).length

  const allTrips = getFeedTrips()

  let filtered = allTrips.filter((trip) => {
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
      if (!trip.origin?.label?.toLowerCase().includes(q) && !trip.destination?.label?.toLowerCase().includes(q)) return false
    }
    if (maxPrice > 0 && trip.price > maxPrice) return false
    if (minSeats > 0 && trip.seats?.available < minSeats) return false
    if (onlyVerified && !trip.driver?.instagramVerified) return false
    if (destFilter && !trip.destination?.label?.toLowerCase().includes(destFilter.toLowerCase())) return false
    return true
  })

  if (sortBy === 'time') filtered.sort((a, b) => new Date(a.departureAt) - new Date(b.departureAt))
  else if (sortBy === 'price') filtered.sort((a, b) => a.price - b.price)
  else if (sortBy === 'rating') filtered.sort((a, b) => (b.driver?.rating || 0) - (a.driver?.rating || 0))

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
            <button
              onClick={() => setShowFilters(true)}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center card-shadow press-effect relative ${activeFilterCount > 0 ? 'gradient-bg' : 'bg-white'}`}
            >
              <SlidersHorizontal size={18} className={activeFilterCount > 0 ? 'text-white' : 'text-slate-500'} />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
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

        {/* Stories */}
        <div className="mb-2">
          <div className="flex items-center justify-between px-4 mb-3">
            <p className="text-slate-700 font-semibold text-sm">Conductores activos hoy</p>
          </div>
          <StoriesBar />
        </div>

        {/* Date + Role filter pills */}
        <div className="flex gap-2 px-4 overflow-x-auto hide-scrollbar mb-3">
          {DATE_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setDateFilter(f.key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold flex-shrink-0 transition-all press-effect ${
                dateFilter === f.key ? 'gradient-bg text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'
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
                roleFilter === f.key ? 'bg-violet-500 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'
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
            filtered.map((trip) => <TripCard key={trip.id} trip={trip} />)
          )}
        </div>
      </div>

      {/* Filter bottom sheet */}
      {showFilters && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setShowFilters(false)} />
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white rounded-t-3xl z-50 px-5 pt-4 pb-[calc(1.5rem+var(--safe-bottom))]">
            {/* Handle */}
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">Filtros</h2>
              <div className="flex items-center gap-2">
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => { setSortBy('time'); setMaxPrice(0); setMinSeats(0); setOnlyVerified(false); setDestFilter('') }}
                    className="text-xs text-rose-500 font-semibold"
                  >
                    Limpiar todo
                  </button>
                )}
                <button onClick={() => setShowFilters(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                  <X size={16} className="text-slate-500" />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-5 overflow-y-auto max-h-[70vh]">
              {/* Ordenar por */}
              <div>
                <p className="text-sm font-bold text-slate-700 mb-2">Ordenar por</p>
                <div className="flex flex-col gap-2">
                  {SORT_OPTIONS.map(o => (
                    <button
                      key={o.key}
                      onClick={() => setSortBy(o.key)}
                      className={`flex items-center justify-between px-4 py-3 rounded-2xl border transition-all ${sortBy === o.key ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-white'}`}
                    >
                      <span className={`text-sm font-semibold ${sortBy === o.key ? 'text-indigo-700' : 'text-slate-700'}`}>{o.label}</span>
                      {sortBy === o.key && <Check size={16} className="text-indigo-500" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Destino */}
              <div>
                <p className="text-sm font-bold text-slate-700 mb-2">Destino</p>
                <div className="relative">
                  <select
                    value={destFilter}
                    onChange={e => setDestFilter(e.target.value)}
                    className="w-full appearance-none bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    <option value="">Cualquier destino</option>
                    {UNIVERSITIES.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </div>
              </div>

              {/* Precio máximo */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-slate-700">Precio máximo por persona</p>
                  <span className={`text-sm font-bold ${maxPrice > 0 ? 'text-indigo-600' : 'text-slate-400'}`}>
                    {maxPrice === 0 ? 'Sin límite' : `$${maxPrice.toLocaleString('es-AR')}`}
                  </span>
                </div>
                <div className="px-1">
                  <input
                    type="range"
                    min={0}
                    max={MAX_PRICE_SLIDER}
                    step={500}
                    value={maxPrice}
                    onChange={e => setMaxPrice(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: maxPrice === 0
                        ? '#e2e8f0'
                        : `linear-gradient(to right, #6366f1 0%, #8b5cf6 ${(maxPrice / MAX_PRICE_SLIDER) * 100}%, #e2e8f0 ${(maxPrice / MAX_PRICE_SLIDER) * 100}%)`,
                    }}
                  />
                  <div className="flex justify-between mt-1.5">
                    <span className="text-xs text-slate-400">$0</span>
                    <span className="text-xs text-slate-400">${MAX_PRICE_SLIDER.toLocaleString('es-AR')}</span>
                  </div>
                </div>
              </div>

              {/* Lugares disponibles */}
              <div>
                <p className="text-sm font-bold text-slate-700 mb-2">Lugares disponibles</p>
                <div className="grid grid-cols-4 gap-2">
                  {SEAT_OPTIONS.map(o => (
                    <button
                      key={o.key}
                      onClick={() => setMinSeats(o.key)}
                      className={`py-2.5 rounded-2xl text-sm font-semibold border transition-all ${minSeats === o.key ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-600'}`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Solo verificados */}
              <button
                onClick={() => setOnlyVerified(v => !v)}
                className={`flex items-center justify-between px-4 py-3.5 rounded-2xl border transition-all ${onlyVerified ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-white'}`}
              >
                <div className="text-left">
                  <p className={`text-sm font-bold ${onlyVerified ? 'text-indigo-700' : 'text-slate-700'}`}>✨ Solo verificados</p>
                  <p className="text-xs text-slate-400 mt-0.5">Conductores con Instagram verificado</p>
                </div>
                <div className={`w-12 h-6 rounded-full transition-all ${onlyVerified ? 'gradient-bg' : 'bg-slate-200'} flex items-center px-1`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${onlyVerified ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </button>

              <button
                onClick={() => setShowFilters(false)}
                className="w-full gradient-bg text-white py-3.5 rounded-2xl font-bold text-sm"
              >
                Ver {filtered.length} viaje{filtered.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
