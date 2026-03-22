import React, { createContext, useContext, useState, useCallback } from 'react'
import { mockUsers, CURRENT_USER_ID } from '../data/mockUsers.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('campusgo_user')
      if (stored) return JSON.parse(stored)
    } catch {}
    return null
  })
  const [isLoading, setIsLoading] = useState(false)

  const login = useCallback(async (email, password) => {
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 900))
    const found = mockUsers.find((u) => u.email === email) || mockUsers.find((u) => u.id === CURRENT_USER_ID)
    if (!found) { setIsLoading(false); throw new Error('Usuario no encontrado') }
    localStorage.setItem('campusgo_user', JSON.stringify(found))
    setUser(found)
    setIsLoading(false)
    return found
  }, [])

  const register = useCallback(async (formData) => {
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    const newUser = { ...mockUsers[0], ...formData, id: 'u_new_' + Date.now() }
    localStorage.setItem('campusgo_user', JSON.stringify(newUser))
    setUser(newUser)
    setIsLoading(false)
    return newUser
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('campusgo_user')
    setUser(null)
  }, [])

  const updateProfile = useCallback(async (fields) => {
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    const updated = { ...user, ...fields }
    localStorage.setItem('campusgo_user', JSON.stringify(updated))
    setUser(updated)
    setIsLoading(false)
    return updated
  }, [user])

  const connectInstagram = useCallback(async (handle) => {
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 1500))
    const updated = { ...user, instagram: handle, instagramVerified: true }
    localStorage.setItem('campusgo_user', JSON.stringify(updated))
    setUser(updated)
    setIsLoading(false)
    return updated
  }, [user])

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, register, logout, updateProfile, connectInstagram }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
