const now = new Date()

function minutesAgo(m) {
  return new Date(now.getTime() - m * 60000).toISOString()
}
function hoursAgo(h) {
  return minutesAgo(h * 60)
}

export const mockNotifications = [
  {
    id: 'n1',
    recipientId: 'u1',
    type: 'join_request',
    tripId: 't7',
    actorId: 'u6',
    message: 'Tomás quiere unirse a tu viaje a Ciudad Universitaria 🚗',
    read: false,
    actions: ['accept', 'deny'],
    createdAt: minutesAgo(8),
  },
  {
    id: 'n2',
    recipientId: 'u1',
    type: 'join_request',
    tripId: 't7',
    actorId: 'u4',
    message: 'Santiago quiere unirse a tu viaje de mañana a Ciudad U ✨',
    read: false,
    actions: ['accept', 'deny'],
    createdAt: minutesAgo(25),
  },
  {
    id: 'n3',
    recipientId: 'u1',
    type: 'request_accepted',
    tripId: 't9',
    actorId: 'u2',
    message: 'Mateo aceptó tu solicitud 🎉 Ya sos parte del viaje!',
    read: false,
    actions: [],
    createdAt: hoursAgo(2),
  },
  {
    id: 'n4',
    recipientId: 'u1',
    type: 'trip_reminder',
    tripId: 't7',
    actorId: null,
    message: 'Tu viaje a Ciudad U es mañana a las 7:45 ⏰ Tenés 2 pasajeros',
    read: true,
    actions: [],
    createdAt: hoursAgo(4),
  },
  {
    id: 'n5',
    recipientId: 'u1',
    type: 'new_rating',
    tripId: 't8',
    actorId: 'u3',
    message: 'Lucía te dejó 5 estrellas ⭐ "Excelente conductora!"',
    read: true,
    actions: [],
    createdAt: hoursAgo(6),
  },
  {
    id: 'n6',
    recipientId: 'u1',
    type: 'request_denied',
    tripId: 't3',
    actorId: 'u6',
    message: 'Tomás no pudo aceptarte en su viaje esta vez 😕',
    read: true,
    actions: [],
    createdAt: hoursAgo(10),
  },
]
