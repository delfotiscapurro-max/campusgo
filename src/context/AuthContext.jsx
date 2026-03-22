import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase, transformProfile } from '../lib/supabase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) loadProfile(session.user.id)
      else setIsLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) loadProfile(session.user.id)
      else if (event !== 'INITIAL_SESSION') { setUser(null); setIsLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, reviews(reviewer_id, rating, text, created_at)')
        .eq('id', userId)
        .single()

      if (data) {
        const profile = transformProfile(data)
        profile.reviews = (data.reviews || []).map(r => ({
          rating: r.rating,
          text: r.text,
          date: r.created_at,
          author: 'Usuario',
        }))
        setUser(profile)
      } else {
        // Profile row doesn't exist yet (trigger may not have run) — use auth metadata
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          const meta = authUser.user_metadata || {}
          // Try to create the profile row
          await supabase.from('profiles').upsert({
            id: userId,
            name: meta.name || authUser.email?.split('@')[0] || 'Usuario',
            email: authUser.email,
            university: meta.university || '',
            career: meta.career || '',
            year: meta.year || '',
            instagram: meta.instagram || '',
            bio: meta.bio || '',
            points: 100,
          }, { onConflict: 'id' })
          setUser({
            id: userId,
            name: meta.name || authUser.email?.split('@')[0] || 'Usuario',
            email: authUser.email,
            university: meta.university || '',
            career: meta.career || '',
            year: meta.year || '',
            instagram: meta.instagram || '',
            instagramVerified: false,
            rating: 5.0,
            totalRatings: 0,
            tripsAsDriver: 0,
            tripsAsPassenger: 0,
            co2SavedKg: 0,
            points: 100,
            bio: meta.bio || '',
            car: null,
            reviews: [],
          })
        }
      }
    } catch (e) {
      console.error('loadProfile error:', e)
    }
    setIsLoading(false)
  }

  const login = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    // onAuthStateChange will call loadProfile and set isLoading = false
    return data.user
  }, [])

  const register = useCallback(async (formData) => {
    const { name, email, password, university, career, year, instagram, hasCar, car, bio } = formData

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, university, career, year, instagram, bio: bio || '' }
      }
    })
    if (error) throw error

    // Upsert profile row
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        name,
        email,
        university,
        career,
        year,
        instagram: instagram || '',
        car: hasCar && car?.make ? car : null,
        points: 100,
      }, { onConflict: 'id' })
    }

    // Set user immediately so ProtectedRoute lets us through
    const profile = {
      id: data.user.id,
      name,
      email,
      university,
      career,
      year,
      instagram: instagram || '',
      instagramVerified: false,
      rating: 5.0,
      totalRatings: 0,
      tripsAsDriver: 0,
      tripsAsPassenger: 0,
      co2SavedKg: 0,
      points: 100,
      bio: bio || '',
      car: hasCar && car?.make ? car : null,
      reviews: [],
    }
    setUser(profile)
    setIsLoading(false)

    return data.user
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  const updateProfile = useCallback(async (fields) => {
    if (!user) return
    const dbFields = {}
    if (fields.name) dbFields.name = fields.name
    if (fields.bio) dbFields.bio = fields.bio
    if (fields.university) dbFields.university = fields.university
    if (fields.career) dbFields.career = fields.career
    if (fields.car !== undefined) dbFields.car = fields.car
    if (fields.instagram !== undefined) dbFields.instagram = fields.instagram
    if (fields.instagramVerified !== undefined) dbFields.instagram_verified = fields.instagramVerified
    dbFields.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('profiles')
      .update(dbFields)
      .eq('id', user.id)
      .select()
      .single()

    if (data) {
      const updated = transformProfile(data)
      setUser(prev => ({ ...prev, ...updated }))
      return updated
    }
  }, [user])

  const connectInstagram = useCallback(async (handle) => {
    const cleanHandle = handle.startsWith('@') ? handle : '@' + handle
    return updateProfile({ instagram: cleanHandle, instagramVerified: true })
  }, [updateProfile])

  return (
    <AuthContext.Provider value={{
      user, isLoading,
      isAuthenticated: !!user,
      login, register, logout, updateProfile, connectInstagram
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
