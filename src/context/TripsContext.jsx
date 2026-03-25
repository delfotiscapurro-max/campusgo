import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { supabase, transformTrip, TRIP_SELECT } from '../lib/supabase.js'
import { useAuth } from './AuthContext.jsx'

const TripsContext = createContext(null)

export function TripsProvider({ children }) {
  const { user, refreshProfile } = useAuth()
  const [trips, setTrips] = useState([])
  const [myTrips, setMyTrips] = useState([])
  const [confirmations, setConfirmations] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Load feed trips on mount
  useEffect(() => {
    loadFeed()
  }, [])

  // Load my trips and confirmations when user changes
  useEffect(() => {
    if (user?.id) {
      loadMyTrips()
      loadConfirmations()
    }
  }, [user?.id])

  async function loadFeed() {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('trips')
      .select(TRIP_SELECT)
      .in('status', ['open', 'full'])
      .gt('departure_at', new Date().toISOString())
      .order('departure_at', { ascending: true })
      .limit(30)

    if (data) setTrips(data.map(transformTrip))
    setIsLoading(false)
  }

  async function loadMyTrips() {
    if (!user?.id) return
    const { data: asDrv } = await supabase
      .from('trips')
      .select(TRIP_SELECT)
      .eq('driver_id', user.id)
      .order('departure_at', { ascending: false })

    const { data: asPax } = await supabase
      .from('trip_passengers')
      .select(`trip_id, trips(${TRIP_SELECT})`)
      .eq('user_id', user.id)

    const driverTrips = (asDrv || []).map(transformTrip)
    const passengerTrips = (asPax || [])
      .map(r => r.trips)
      .filter(Boolean)
      .map(transformTrip)

    // Merge deduplicated
    const seen = new Set()
    const all = [...driverTrips, ...passengerTrips].filter(t => {
      if (seen.has(t.id)) return false
      seen.add(t.id)
      return true
    }).sort((a, b) => new Date(b.departureAt) - new Date(a.departureAt))

    setMyTrips(all)
  }

  async function loadConfirmations() {
    if (!user?.id) return
    const { data } = await supabase
      .from('trip_confirmations')
      .select('trip_id, attended')
      .eq('user_id', user.id)
    setConfirmations(data || [])
  }

  const getTrip = useCallback((id) => {
    return trips.find(t => t.id === id) || myTrips.find(t => t.id === id)
  }, [trips, myTrips])

  // For backward compat — data is already enriched from Supabase
  const enrichTrip = useCallback((trip) => trip, [])

  const getFeedTrips = useCallback(() => trips, [trips])

  const getUserTrips = useCallback((userId) => {
    if (userId === user?.id) return myTrips
    return [...trips, ...myTrips].filter(t =>
      t.driverId === userId || t.passengerIds?.includes(userId)
    )
  }, [myTrips, trips, user?.id])

  const getTripById = useCallback(async (id) => {
    // First check cache
    const cached = getTrip(id)
    if (cached) return cached

    // Fetch from Supabase
    const { data } = await supabase
      .from('trips')
      .select(TRIP_SELECT)
      .eq('id', id)
      .single()

    return data ? transformTrip(data) : null
  }, [getTrip])

  const publishTrip = useCallback(async (tripData, userId) => {
    setIsLoading(true)
    const row = {
      type: tripData.type || 'offer',
      driver_id: tripData.type !== 'request' ? userId : null,
      passenger_id: tripData.type === 'request' ? userId : null,
      origin: tripData.origin,
      destination: tripData.destination,
      departure_at: tripData.departureAt,
      seats_total: tripData.seats?.total || 3,
      seats_available: tripData.seats?.available || 3,
      radius_km: tripData.radiusKm || 2,
      price: tripData.price || 0,
      description: tripData.description || '',
      tags: tripData.tags || [],
      status: 'open',
      co2_saved_kg: 0,
    }

    const { data, error } = await supabase
      .from('trips')
      .insert(row)
      .select(TRIP_SELECT)
      .single()

    if (data) {
      const newTrip = transformTrip(data)
      setTrips(prev => [newTrip, ...prev])
      setMyTrips(prev => [newTrip, ...prev])

      // Award points for publishing
      await supabase.from('profiles')
        .update({ points: (user?.points || 0) + 50 })
        .eq('id', userId)

      setIsLoading(false)
      return newTrip
    }
    setIsLoading(false)
    throw error
  }, [user])

  const requestToJoin = useCallback(async (tripId, userId) => {
    const { error } = await supabase
      .from('trip_requests')
      .upsert({ trip_id: tripId, user_id: userId, status: 'pending' })

    if (!error) {
      // Optimistic update
      setTrips(prev => prev.map(t =>
        t.id === tripId && !t.pendingRequestIds.includes(userId)
          ? { ...t, pendingRequestIds: [...t.pendingRequestIds, userId] }
          : t
      ))
    }
  }, [])

  const acceptRequest = useCallback(async (tripId, userId) => {
    // 1. Update request status
    await supabase.from('trip_requests')
      .update({ status: 'accepted' })
      .eq('trip_id', tripId)
      .eq('user_id', userId)

    // 2. Add to trip_passengers
    await supabase.from('trip_passengers')
      .upsert({ trip_id: tripId, user_id: userId })

    // 3. Decrement available seats
    const trip = getTrip(tripId)
    if (trip) {
      const newAvailable = Math.max(0, trip.seats.available - 1)
      await supabase.from('trips')
        .update({
          seats_available: newAvailable,
          status: newAvailable === 0 ? 'full' : 'open'
        })
        .eq('id', tripId)

    }

    // Refresh feed
    await loadFeed()
    if (user?.id) await loadMyTrips()
  }, [getTrip, user])

  const denyRequest = useCallback(async (tripId, userId) => {
    await supabase.from('trip_requests')
      .update({ status: 'denied' })
      .eq('trip_id', tripId)
      .eq('user_id', userId)

    setTrips(prev => prev.map(t =>
      t.id === tripId
        ? { ...t, pendingRequestIds: t.pendingRequestIds.filter(id => id !== userId) }
        : t
    ))
  }, [])

  const getPendingConfirmationTrips = useCallback(() => {
    const now = new Date()
    return myTrips.filter(t =>
      new Date(t.departureAt) < now &&
      ['open', 'full'].includes(t.status) &&
      !confirmations.find(c => c.trip_id === t.id)
    )
  }, [myTrips, confirmations])

  const confirmTrip = useCallback(async (tripId, attended) => {
    await supabase.from('trip_confirmations')
      .upsert({ trip_id: tripId, user_id: user.id, attended })

    setConfirmations(prev => [...prev.filter(c => c.trip_id !== tripId), { trip_id: tripId, attended }])

    await loadMyTrips()
    await refreshProfile()
  }, [user, refreshProfile])

  const cancelTrip = useCallback(async (tripId) => {
    await supabase.from('trips')
      .update({ status: 'cancelled' })
      .eq('id', tripId)

    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, status: 'cancelled' } : t))
    setMyTrips(prev => prev.map(t => t.id === tripId ? { ...t, status: 'cancelled' } : t))
  }, [])

  return (
    <TripsContext.Provider value={{
      trips, myTrips, isLoading,
      getTrip, getTripById, enrichTrip,
      getFeedTrips, getUserTrips,
      publishTrip, requestToJoin, acceptRequest, denyRequest, cancelTrip, confirmTrip, getPendingConfirmationTrips,
      loadFeed, loadMyTrips,
    }}>
      {children}
    </TripsContext.Provider>
  )
}

export function useTrips() {
  const ctx = useContext(TripsContext)
  if (!ctx) throw new Error('useTrips must be inside TripsProvider')
  return ctx
}
