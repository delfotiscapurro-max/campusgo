import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useTrips } from '../../context/TripsContext.jsx'
import TopBar from '../../components/layout/TopBar.jsx'
import Avatar from '../../components/ui/Avatar.jsx'
import { formatTime } from '../../utils/dateUtils.js'

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function createTripIcon(trip, isSelected) {
  const emoji = trip.type === 'offer' ? '🚗' : '🙋'
  const bg = isSelected ? '#6366f1' : (trip.type === 'offer' ? '#6366f1' : '#7c3aed')
  return L.divIcon({
    className: '',
    html: `<div style="
      background:${bg};
      width:${isSelected ? 44 : 36}px;
      height:${isSelected ? 44 : 36}px;
      border-radius:50%;
      border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.25);
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:${isSelected ? '20px' : '16px'};
      transition:all 0.2s;
    ">${emoji}</div>`,
    iconSize: [isSelected ? 44 : 36, isSelected ? 44 : 36],
    iconAnchor: [isSelected ? 22 : 18, isSelected ? 44 : 36],
  })
}

const userIcon = L.divIcon({
  className: '',
  html: `<div style="
    background:#6366f1;
    width:18px;height:18px;
    border-radius:50%;
    border:3px solid white;
    box-shadow:0 2px 8px rgba(99,102,241,0.5);
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

// Buenos Aires center as default
const DEFAULT_CENTER = [-34.6037, -58.3816]
const RADII = [1, 2, 5, 10]

function RecenterMap({ center }) {
  const map = useMap()
  useEffect(() => { map.setView(center, map.getZoom()) }, [center])
  return null
}

export default function DiscoverPage() {
  const navigate = useNavigate()
  const { getFeedTrips } = useTrips()
  const [selectedRadius, setSelectedRadius] = useState(5)
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [userPos, setUserPos] = useState(DEFAULT_CENTER)

  const trips = getFeedTrips()
  const selectedTripData = trips.find(t => t.id === selectedTrip)

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      pos => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      () => {} // fallback to Buenos Aires
    )
  }, [])

  // Assign fixed coords to trips (use origin coords if available, else scatter around user)
  function getTripCoords(trip, index) {
    if (trip.origin?.lat && trip.origin?.lng) return [trip.origin.lat, trip.origin.lng]
    const angle = (index / trips.length) * 2 * Math.PI
    const dist = 0.01 + (index % 3) * 0.008
    return [userPos[0] + Math.cos(angle) * dist, userPos[1] + Math.sin(angle) * dist]
  }

  return (
    <div className="page-content">
      <TopBar title="Explorar" />
      <div className="page-enter">
        {/* Real map */}
        <div className="mx-4 mt-4 rounded-3xl overflow-hidden" style={{ height: '320px' }}>
          <MapContainer
            center={userPos}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <RecenterMap center={userPos} />

            {/* User location */}
            <Marker position={userPos} icon={userIcon} />
            <Circle
              center={userPos}
              radius={selectedRadius * 1000}
              pathOptions={{ color: '#6366f1', fillColor: '#6366f1', fillOpacity: 0.08, weight: 2 }}
            />

            {/* Trip markers */}
            {trips.slice(0, 10).map((trip, i) => (
              <Marker
                key={trip.id}
                position={getTripCoords(trip, i)}
                icon={createTripIcon(trip, selectedTrip === trip.id)}
                eventHandlers={{ click: () => setSelectedTrip(selectedTrip === trip.id ? null : trip.id) }}
              >
                <Popup>
                  <div style={{ minWidth: 140 }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{trip.driver?.name}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{trip.origin?.label} → {trip.destination?.label}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#6366f1', marginTop: 4 }}>
                      {formatTime(trip.departureAt)} · ${trip.price?.toLocaleString()}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
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

        {/* Trip list */}
        <div className="px-4 pb-4">
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
