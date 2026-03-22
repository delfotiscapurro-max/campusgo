import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Navigation, Filter } from 'lucide-react'
import { useTrips } from '../../context/TripsContext.jsx'
import TopBar from '../../components/layout/TopBar.jsx'
import Avatar from '../../components/ui/Avatar.jsx'
import { formatTime } from '../../utils/dateUtils.js'

// Simulated map positions (percentage-based within a "map" div)
const MAP_POSITIONS = [
  { id: 't1', x: 60, y: 35 },
  { id: 't2', x: 38, y: 52 },
  { id: 't3', x: 50, y: 58 },
  { id: 't4', x: 62, y: 22 },
  { id: 't5', x: 58, y: 30 },
  { id: 't6', x: 30, y: 65 },
  { id: 't7', x: 44, y: 38 },
]

const RADII = [1, 2, 5, 10]

export default function DiscoverPage() {
  const navigate = useNavigate()
  const { getFeedTrips } = useTrips()
  const [selectedRadius, setSelectedRadius] = useState(5)
  const [selectedTrip, setSelectedTrip] = useState(null)

  const trips = getFeedTrips()

  const selectedTripData = trips.find(t => t.id === selectedTrip)

  return (
    <div className="page-content">
      <TopBar title="Explorar" />
      <div className="page-enter">
        {/* Map area */}
        <div className="relative mx-4 mt-4 rounded-3xl overflow-hidden" style={{ height: '320px' }}>
          {/* Fake map background */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #e8edf5 0%, #d4dff0 100%)' }}>
            {/* Grid lines to simulate map */}
            <svg width="100%" height="100%" className="opacity-30">
              {Array.from({ length: 8 }).map((_, i) => (
                <line key={`h${i}`} x1="0" y1={`${(i + 1) * 12.5}%`} x2="100%" y2={`${(i + 1) * 12.5}%`} stroke="#94a3b8" strokeWidth="1" />
              ))}
              {Array.from({ length: 8 }).map((_, i) => (
                <line key={`v${i}`} x1={`${(i + 1) * 12.5}%`} y1="0" x2={`${(i + 1) * 12.5}%`} y2="100%" stroke="#94a3b8" strokeWidth="1" />
              ))}
            </svg>

            {/* Roads simulation */}
            <svg width="100%" height="100%" className="absolute inset-0">
              <path d="M 0,45% Q 30%,40% 50%,50% T 100%,45%" stroke="#b0b9d0" strokeWidth="6" fill="none" />
              <path d="M 0,65% Q 30%,60% 60%,65% T 100%,60%" stroke="#b0b9d0" strokeWidth="4" fill="none" />
              <path d="M 40%,0 Q 45%,40% 50%,50% T 45%,100%" stroke="#b0b9d0" strokeWidth="5" fill="none" />
              <path d="M 0,45% Q 30%,40% 50%,50% T 100%,45%" stroke="#c8d0e0" strokeWidth="3" fill="none" />
            </svg>
          </div>

          {/* User location */}
          <div className="absolute" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
            <div className="relative">
              <div className="w-5 h-5 bg-indigo-600 rounded-full border-3 border-white shadow-lg z-10 relative" style={{ borderWidth: '3px' }} />
              {/* Radius ring */}
              <div
                className="absolute rounded-full bg-indigo-400/10 border-2 border-indigo-400/30"
                style={{
                  width: `${selectedRadius * 18}px`,
                  height: `${selectedRadius * 18}px`,
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              />
            </div>
          </div>

          {/* Trip markers */}
          {trips.slice(0, 7).map((trip, i) => {
            const pos = MAP_POSITIONS[i] || { x: 50 + (i * 7) % 30, y: 40 + (i * 11) % 30 }
            const isSelected = selectedTrip === trip.id
            return (
              <button
                key={trip.id}
                onClick={() => setSelectedTrip(isSelected ? null : trip.id)}
                className={`absolute press-effect z-20 transition-transform ${isSelected ? 'scale-110' : ''}`}
                style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: `translate(-50%, -100%) ${isSelected ? 'scale(1.1)' : ''}` }}
              >
                {isSelected ? (
                  <div className="gradient-bg text-white rounded-2xl px-3 py-2 text-xs font-bold shadow-lg whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <img src={trip.driver?.avatar} alt="" className="w-5 h-5 rounded-full" onError={e => e.target.style.display = 'none'} />
                      <span>{formatTime(trip.departureAt)}</span>
                    </div>
                    <div className="text-[10px] opacity-80">${trip.price.toLocaleString()} · {trip.seats.available} asientos</div>
                    <div className="absolute bottom-0 left-1/2 w-2 h-2 gradient-bg rotate-45 -translate-x-1/2 translate-y-1/2" />
                  </div>
                ) : (
                  <div className={`w-9 h-9 rounded-full border-3 border-white shadow-md flex items-center justify-center ${trip.type === 'offer' ? 'gradient-bg' : 'bg-violet-500'}`} style={{ borderWidth: '3px' }}>
                    <span className="text-base">{trip.type === 'offer' ? '🚗' : '🙋'}</span>
                  </div>
                )}
              </button>
            )
          })}

          {/* Map overlay gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#f5f6ff] to-transparent pointer-events-none" />
        </div>

        {/* Radius selector */}
        <div className="px-4 mt-3 mb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Radio de búsqueda</span>
            <span className="text-sm font-bold text-indigo-600">{selectedRadius}km</span>
          </div>
          <div className="flex gap-2">
            {RADII.map(r => (
              <button
                key={r}
                onClick={() => setSelectedRadius(r)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all press-effect ${selectedRadius === r ? 'gradient-bg text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}
              >
                {r}km
              </button>
            ))}
          </div>
        </div>

        {/* Selected trip card */}
        {selectedTripData && (
          <div className="mx-4 mb-3 fade-in">
            <button
              onClick={() => navigate(`/trip/${selectedTripData.id}`)}
              className="w-full bg-white rounded-3xl card-shadow p-4 flex items-center gap-4 press-effect text-left border-2 border-indigo-100"
            >
              <Avatar src={selectedTripData.driver?.avatar} name={selectedTripData.driver?.name} size="md" verified={selectedTripData.driver?.instagramVerified} />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 text-sm">{selectedTripData.driver?.name}</p>
                <p className="text-xs text-slate-500 truncate">{selectedTripData.origin?.label} → {selectedTripData.destination?.label}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold text-indigo-600">{formatTime(selectedTripData.departureAt)}</span>
                  <span className="text-slate-300 text-xs">·</span>
                  <span className="text-xs text-slate-500">{selectedTripData.seats?.available} asiento{selectedTripData.seats?.available !== 1 ? 's' : ''}</span>
                  <span className="text-slate-300 text-xs">·</span>
                  <span className="text-xs font-bold text-emerald-600">${selectedTripData.price?.toLocaleString()}</span>
                </div>
              </div>
              <div className="text-xs gradient-bg text-white px-3 py-1.5 rounded-full font-semibold flex-shrink-0">
                Ver →
              </div>
            </button>
          </div>
        )}

        {/* Trip list below map */}
        <div className="px-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-slate-800 text-sm">{trips.length} viajes cerca tuyo</p>
          </div>
          <div className="flex flex-col gap-2">
            {trips.slice(0, 5).map((trip) => (
              <button
                key={trip.id}
                onClick={() => navigate(`/trip/${trip.id}`)}
                className="w-full bg-white rounded-2xl p-3.5 flex items-center gap-3 press-effect text-left card-shadow"
              >
                <Avatar src={trip.driver?.avatar} name={trip.driver?.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 truncate">
                    {trip.origin?.label} → {trip.destination?.label}
                  </p>
                  <p className="text-xs text-slate-400">{formatTime(trip.departureAt)} · {trip.seats?.available} asientos</p>
                </div>
                <div className="text-sm font-bold text-indigo-600 flex-shrink-0">${trip.price?.toLocaleString()}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
