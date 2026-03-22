import React, { createContext, useContext, useState, useCallback } from 'react'
import { mockTrips } from '../data/mockTrips.js'
import { mockUsers } from '../data/mockUsers.js'

const TripsContext = createContext(null)

export function TripsProvider({ children }) {
  const [trips, setTrips] = useState(mockTrips)
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState({ role: 'all', date: 'today', radiusKm: 5 })

  const getTrip = useCallback((id) => trips.find((t) => t.id === id), [trips])

  const enrichTrip = useCallback(
    (trip) => ({
      ...trip,
      driver: trip.driverId ? mockUsers.find((u) => u.id === trip.driverId) : null,
      passengers: (trip.passengerIds || []).map((id) => mockUsers.find((u) => u.id === id)).filter(Boolean),
      pendingRequests: (trip.pendingRequestIds || []).map((id) => mockUsers.find((u) => u.id === id)).filter(Boolean),
    }),
    []
  )

  const getFeedTrips = useCallback(() => {
    const now = new Date()
    return trips
      .filter((t) => new Date(t.departureAt) > now && t.status !== 'completed')
      .map(enrichTrip)
      .sort((a, b) => new Date(a.departureAt) - new Date(b.departureAt))
  }, [trips, enrichTrip])

  const getUserTrips = useCallback(
    (userId) =>
      trips
        .filter(
          (t) =>
            t.driverId === userId ||
            (t.passengerIds || []).includes(userId) ||
            t.passengerId === userId
        )
        .map(enrichTrip)
        .sort((a, b) => new Date(b.departureAt) - new Date(a.departureAt)),
    [trips, enrichTrip]
  )

  const publishTrip = useCallback(async (tripData, userId) => {
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    const newTrip = {
      id: 'trip_' + Date.now(),
      type: tripData.type || 'offer',
      driverId: tripData.type !== 'request' ? userId : null,
      passengerId: tripData.type === 'request' ? userId : null,
      origin: tripData.origin,
      destination: tripData.destination,
      departureAt: tripData.departureAt,
      seats: tripData.seats,
      radiusKm: tripData.radiusKm || 2,
      price: tripData.price || 0,
      description: tripData.description || '',
      tags: tripData.tags || [],
      passengerIds: [],
      pendingRequestIds: [],
      status: 'open',
      co2SavedKg: 0,
      createdAt: new Date().toISOString(),
    }
    setTrips((prev) => [newTrip, ...prev])
    setIsLoading(false)
    return newTrip
  }, [])

  const requestToJoin = useCallback(async (tripId, userId) => {
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 700))
    setTrips((prev) =>
      prev.map((t) =>
        t.id === tripId && !t.pendingRequestIds.includes(userId)
          ? { ...t, pendingRequestIds: [...t.pendingRequestIds, userId] }
          : t
      )
    )
    setIsLoading(false)
  }, [])

  const acceptRequest = useCallback(async (tripId, userId) => {
    await new Promise((r) => setTimeout(r, 500))
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id !== tripId) return t
        const newAvailable = Math.max(0, t.seats.available - 1)
        return {
          ...t,
          pendingRequestIds: t.pendingRequestIds.filter((id) => id !== userId),
          passengerIds: [...t.passengerIds, userId],
          seats: { ...t.seats, available: newAvailable },
          status: newAvailable === 0 ? 'full' : t.status,
        }
      })
    )
  }, [])

  const denyRequest = useCallback(async (tripId, userId) => {
    await new Promise((r) => setTimeout(r, 500))
    setTrips((prev) =>
      prev.map((t) =>
        t.id === tripId
          ? { ...t, pendingRequestIds: t.pendingRequestIds.filter((id) => id !== userId) }
          : t
      )
    )
  }, [])

  const cancelTrip = useCallback(async (tripId) => {
    await new Promise((r) => setTimeout(r, 600))
    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, status: 'cancelled' } : t))
    )
  }, [])

  return (
    <TripsContext.Provider
      value={{ trips, isLoading, filter, setFilter, getTrip, enrichTrip, getFeedTrips, getUserTrips, publishTrip, requestToJoin, acceptRequest, denyRequest, cancelTrip }}
    >
      {children}
    </TripsContext.Provider>
  )
}

export function useTrips() {
  const ctx = useContext(TripsContext)
  if (!ctx) throw new Error('useTrips must be inside TripsProvider')
  return ctx
}
