import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { signOut as authSignOut } from '../lib/auth'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)         // Supabase auth user
  const [profile, setProfile] = useState(null)   // DB profile row
  const [loading, setLoading] = useState(true)   // true while resolving session

  // ── Fetch profile from DB ──────────────────────────────────
  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('fetchProfile error:', error)
      return null
    }

    // Check banned status
    if (data?.is_banned) {
      toast.error('Account suspended. Contact support.', { duration: 5000 })
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      return null
    }

    return data
  }

  // ── Initialize session on mount ────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(session.user)
          const p = await fetchProfile(session.user.id)
          setProfile(p)
        }
      } catch (err) {
        console.error('Session init error:', err)
      } finally {
        setLoading(false)
      }
    }

    init()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
          const p = await fetchProfile(session.user.id)
          setProfile(p)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setUser(session.user)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // ── Sign Out ───────────────────────────────────────────────
  const signOut = async () => {
    await authSignOut()
    setUser(null)
    setProfile(null)
  }

  // ── Refresh profile (after edits) ─────────────────────────
  const refreshProfile = async () => {
    if (!user) return
    const p = await fetchProfile(user.id)
    setProfile(p)
  }

  // ── Computed values ────────────────────────────────────────
  const isLoggedIn = !!user && !!profile
  const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin'
  const isSuperAdmin = profile?.role === 'superadmin'

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoggedIn,
        isAdmin,
        isSuperAdmin,
        loading,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
