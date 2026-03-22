import { mockUsers } from './mockUsers.js'

const today = new Date()
const tomorrow = new Date(today)
tomorrow.setDate(tomorrow.getDate() + 1)
const dayAfter = new Date(today)
dayAfter.setDate(dayAfter.getDate() + 2)

function dateAt(base, hour, min) {
  const d = new Date(base)
  d.setHours(hour, min, 0, 0)
  return d.toISOString()
}

export const mockTrips = [
  {
    id: 't1',
    type: 'offer',
    driverId: 'u2',
    origin: { label: 'Belgrano, CABA', lat: -34.558, lng: -58.46 },
    destination: { label: 'Ciudad Universitaria, UBA', lat: -34.543, lng: -58.449 },
    departureAt: dateAt(today, 7, 30),
    seats: { total: 3, available: 1 },
    radiusKm: 2,
    price: 900,
    description: 'Salgo puntual desde Juramento. Música tranquila, AC en verano 🎶❄️',
    tags: ['puntual', 'AC', 'música suave'],
    passengerIds: ['u3', 'u5'],
    pendingRequestIds: ['u6'],
    status: 'open',
    co2SavedKg: 2.8,
    createdAt: dateAt(today, 6, 0),
  },
  {
    id: 't2',
    type: 'offer',
    driverId: 'u4',
    origin: { label: 'Caballito, CABA', lat: -34.618, lng: -58.45 },
    destination: { label: 'Ciudad Universitaria, UBA', lat: -34.543, lng: -58.449 },
    departureAt: dateAt(today, 7, 15),
    seats: { total: 4, available: 2 },
    radiusKm: 3,
    price: 850,
    description: 'Viajo todos los lunes y miércoles. Buena onda siempre 🙌',
    tags: ['regular', 'buena onda'],
    passengerIds: ['u7'],
    pendingRequestIds: [],
    status: 'open',
    co2SavedKg: 3.1,
    createdAt: dateAt(today, 5, 30),
  },
  {
    id: 't3',
    type: 'offer',
    driverId: 'u6',
    origin: { label: 'Almagro, CABA', lat: -34.605, lng: -58.432 },
    destination: { label: 'UTN FRBA, Medrano', lat: -34.604, lng: -58.442 },
    departureAt: dateAt(today, 8, 0),
    seats: { total: 3, available: 3 },
    radiusKm: 1.5,
    price: 700,
    description: 'Primera vez publicando 😊 Auto nuevo, buen viaje garantizado',
    tags: ['no fumar', 'silencioso'],
    passengerIds: [],
    pendingRequestIds: ['u1'],
    status: 'open',
    co2SavedKg: 1.2,
    createdAt: dateAt(today, 7, 0),
  },
  {
    id: 't4',
    type: 'offer',
    driverId: 'u7',
    origin: { label: 'Núñez, CABA', lat: -34.544, lng: -58.464 },
    destination: { label: 'FIUBA, Paseo Colón', lat: -34.619, lng: -58.368 },
    departureAt: dateAt(tomorrow, 7, 0),
    seats: { total: 3, available: 2 },
    radiusKm: 2,
    price: 1100,
    description: 'Viaje largo pero en buena compañía 🚗 Playlist en Spotify',
    tags: ['playlist', 'largo recorrido', 'puntual'],
    passengerIds: ['u3'],
    pendingRequestIds: [],
    status: 'open',
    co2SavedKg: 4.5,
    createdAt: dateAt(today, 20, 0),
  },
  {
    id: 't5',
    type: 'offer',
    driverId: 'u2',
    origin: { label: 'Belgrano, CABA', lat: -34.558, lng: -58.46 },
    destination: { label: 'Ciudad Universitaria, UBA', lat: -34.543, lng: -58.449 },
    departureAt: dateAt(tomorrow, 7, 30),
    seats: { total: 3, available: 3 },
    radiusKm: 2,
    price: 900,
    description: 'Mismo viaje de mañana. Ya se lo sé de memoria 😄',
    tags: ['puntual', 'AC', 'música suave'],
    passengerIds: [],
    pendingRequestIds: [],
    status: 'open',
    co2SavedKg: 2.8,
    createdAt: dateAt(today, 21, 0),
  },
  {
    id: 't6',
    type: 'request',
    driverId: null,
    passengerId: 'u3',
    origin: { label: 'Villa del Parque, CABA', lat: -34.612, lng: -58.502 },
    destination: { label: 'Exactas, Ciudad Universitaria', lat: -34.543, lng: -58.449 },
    departureAt: dateAt(today, 8, 30),
    seats: { total: 1, available: 1 },
    radiusKm: 2,
    price: 800,
    description: 'Busco viaje para hoy, salgo de Villa del Parque. Pago mi parte! 🙏',
    tags: ['urgente', 'pasajera'],
    passengerIds: [],
    pendingRequestIds: [],
    status: 'open',
    co2SavedKg: 0,
    createdAt: dateAt(today, 7, 30),
  },
  {
    id: 't7',
    type: 'offer',
    driverId: 'u1',
    origin: { label: 'Palermo, CABA', lat: -34.5875, lng: -58.4222 },
    destination: { label: 'Ciudad Universitaria, UBA', lat: -34.543, lng: -58.449 },
    departureAt: dateAt(dayAfter, 7, 45),
    seats: { total: 3, available: 1 },
    radiusKm: 2,
    price: 900,
    description: 'Mi viaje habitual. Pasajeros verificados primero ✅',
    tags: ['verificados', 'puntual', 'AC'],
    passengerIds: ['u3', 'u5'],
    pendingRequestIds: [],
    status: 'open',
    co2SavedKg: 2.8,
    createdAt: dateAt(today, 22, 0),
  },
  // Completed trips for My Trips section
  {
    id: 't8',
    type: 'offer',
    driverId: 'u1',
    origin: { label: 'Palermo, CABA', lat: -34.5875, lng: -58.4222 },
    destination: { label: 'Ciudad Universitaria, UBA', lat: -34.543, lng: -58.449 },
    departureAt: dateAt(new Date(today.getTime() - 86400000), 7, 45),
    seats: { total: 3, available: 0 },
    radiusKm: 2,
    price: 900,
    description: 'Viaje completado ayer',
    tags: [],
    passengerIds: ['u3', 'u5', 'u4'],
    pendingRequestIds: [],
    status: 'completed',
    co2SavedKg: 5.2,
    createdAt: new Date(today.getTime() - 2 * 86400000).toISOString(),
  },
  {
    id: 't9',
    type: 'offer',
    driverId: 'u2',
    origin: { label: 'Belgrano, CABA', lat: -34.558, lng: -58.46 },
    destination: { label: 'Ciudad Universitaria, UBA', lat: -34.543, lng: -58.449 },
    departureAt: dateAt(new Date(today.getTime() - 172800000), 7, 30),
    seats: { total: 3, available: 0 },
    radiusKm: 2,
    price: 900,
    description: 'Viaje completado',
    tags: [],
    passengerIds: ['u1', 'u5'],
    pendingRequestIds: [],
    status: 'completed',
    co2SavedKg: 3.4,
    createdAt: new Date(today.getTime() - 3 * 86400000).toISOString(),
  },
]

export function getTripById(id) {
  return mockTrips.find((t) => t.id === id)
}

export function getUpcomingTrips() {
  const now = new Date()
  return mockTrips.filter((t) => new Date(t.departureAt) > now && t.status !== 'completed')
}

export function getCompletedTrips() {
  return mockTrips.filter((t) => t.status === 'completed')
}

export function getUserTrips(userId) {
  return mockTrips.filter(
    (t) =>
      t.driverId === userId ||
      t.passengerIds?.includes(userId) ||
      t.passengerId === userId
  )
}
