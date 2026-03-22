import React, { createContext, useContext, useState, useCallback } from 'react'
import { mockNotifications } from '../data/mockNotifications.js'
import { useTrips } from './TripsContext.jsx'

const NotificationsContext = createContext(null)

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState(mockNotifications)
  const { acceptRequest, denyRequest } = useTrips()

  const unreadCount = notifications.filter((n) => !n.read).length

  const markRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const respondToRequest = useCallback(
    async (notificationId, action) => {
      const notif = notifications.find((n) => n.id === notificationId)
      if (!notif) return
      if (action === 'accept') {
        await acceptRequest(notif.tripId, notif.actorId)
      } else {
        await denyRequest(notif.tripId, notif.actorId)
      }
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? {
                ...n,
                read: true,
                actions: [],
                message:
                  action === 'accept'
                    ? n.message.replace('quiere unirse', 'fue aceptado/a ✅')
                    : n.message.replace('quiere unirse', 'fue rechazado/a ❌'),
              }
            : n
        )
      )
    },
    [notifications, acceptRequest, denyRequest]
  )

  const addNotification = useCallback((notif) => {
    setNotifications((prev) => [{ ...notif, id: 'n_' + Date.now(), read: false, createdAt: new Date().toISOString() }, ...prev])
  }, [])

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, respondToRequest, addNotification }}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be inside NotificationsProvider')
  return ctx
}
