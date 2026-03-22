import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from './AuthContext.jsx'
import { useTrips } from './TripsContext.jsx'

const NotificationsContext = createContext(null)

export function NotificationsProvider({ children }) {
  const { user } = useAuth()
  const { acceptRequest, denyRequest } = useTrips()
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    if (!user?.id) return
    loadNotifications()

    // Realtime: escucha notificaciones nuevas en tiempo real
    const channel = supabase
      .channel('notifications:' + user.id)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `recipient_id=eq.${user.id}`,
      }, (payload) => {
        setNotifications(prev => [mapRow(payload.new), ...prev])
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user?.id])

  async function loadNotifications() {
    const { data } = await supabase
      .from('notifications')
      .select('*, actor:profiles!notifications_actor_id_fkey(id, name, avatar_url, instagram_verified, rating)')
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (data) setNotifications(data.map(mapRow))
  }

  function mapRow(row) {
    return {
      id: row.id,
      recipientId: row.recipient_id,
      type: row.type,
      tripId: row.trip_id,
      actorId: row.actor_id,
      actor: row.actor ? {
        id: row.actor.id,
        name: row.actor.name,
        avatar: row.actor.avatar_url,
        instagramVerified: row.actor.instagram_verified,
        rating: row.actor.rating,
      } : null,
      message: row.message,
      read: row.read,
      actions: row.actions || [],
      createdAt: row.created_at,
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const markRead = useCallback(async (id) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])

  const markAllRead = useCallback(async () => {
    if (!user?.id) return
    await supabase.from('notifications')
      .update({ read: true })
      .eq('recipient_id', user.id)
      .eq('read', false)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [user?.id])

  const respondToRequest = useCallback(async (notificationId, action) => {
    const notif = notifications.find(n => n.id === notificationId)
    if (!notif) return

    if (action === 'accept') {
      await acceptRequest(notif.tripId, notif.actorId)
      // Send accepted notification to the requester
      await addNotification({
        recipientId: notif.actorId,
        type: 'request_accepted',
        tripId: notif.tripId,
        actorId: user.id,
        message: `${user.name} aceptó tu solicitud 🎉 ¡Ya sos parte del viaje!`,
        actions: [],
      })
    } else {
      await denyRequest(notif.tripId, notif.actorId)
      await addNotification({
        recipientId: notif.actorId,
        type: 'request_denied',
        tripId: notif.tripId,
        actorId: user.id,
        message: `${user.name} no pudo aceptarte esta vez 😕`,
        actions: [],
      })
    }

    // Mark as read + remove actions
    await supabase.from('notifications')
      .update({ read: true, actions: [] })
      .eq('id', notificationId)

    setNotifications(prev => prev.map(n =>
      n.id === notificationId
        ? { ...n, read: true, actions: [] }
        : n
    ))
  }, [notifications, acceptRequest, denyRequest, user])

  const addNotification = useCallback(async (notif) => {
    const { data, error } = await supabase.from('notifications').insert({
      recipient_id: notif.recipientId,
      type: notif.type,
      trip_id: notif.tripId || null,
      actor_id: notif.actorId || null,
      message: notif.message,
      actions: notif.actions || [],
      read: false,
    }).select().single()

    if (error) console.error('addNotification error:', error)

    // Only add to local state if it's for current user
    if (data && data.recipient_id === user?.id) {
      setNotifications(prev => [mapRow(data), ...prev])
    }
  }, [user?.id])

  return (
    <NotificationsContext.Provider value={{
      notifications, unreadCount,
      markRead, markAllRead, respondToRequest, addNotification
    }}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be inside NotificationsProvider')
  return ctx
}
