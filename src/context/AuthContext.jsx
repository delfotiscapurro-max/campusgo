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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) loadProfile(session.user.id)
      else { setUser(null); setIsLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, reviews(reviewer_id, rating, text, created_at)')
      .eq('id', userId)
      .single()

    if (data) {
      const profile = transformProfile(data)
      // attach reviews with author names
      profile.reviews = (data.reviews || []).map(r => ({
        rating: r.rating,
        text: r.text,
        date: r.created_at,
        author: 'Usuario',
      }))
      setUser(profile)
    }
    setIsLoading(false)
  }

  const login = useCallback(async (email, password) => {
    setIsLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setIsLoading(false); throw error }
    return data.user
  }, [])

  const register = useCallback(async (formData) => {
    setIsLoading(true)
    const { name, email, password, university, career, year, instagram, hasCar, car, bio } = formData

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, university, career, year, instagram, bio: bio || '' }
      }
    })
    if (error) { setIsLoading(false); throw error }

    // Update profile with extra info (car, etc.)
    if (data.user) {
      await supabase.from('profiles').update({
        name,
        university,
        career,
        year,
        instagram,
        car: hasCar && car?.make ? car : null,
        points: 100, // bienvenida
      }).eq('id', data.user.id)
    }

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
