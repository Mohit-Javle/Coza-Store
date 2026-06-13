import { supabase } from './supabase'
import toast from 'react-hot-toast'

// ── Sign Up ──────────────────────────────────────────────────
export const signUp = async ({ email, password, username, fullName }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        full_name: fullName,
      },
    },
  })

  if (error) {
    toast.error(error.message || 'Sign up failed. Try again.')
    return { user: null, error }
  }

  toast.success('Welcome to COZA STORE! 🔥 Check your email to confirm.')
  return { user: data.user, error: null }
}

// ── Sign In ──────────────────────────────────────────────────
export const signIn = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    toast.error(error.message || 'Login failed. Check your credentials.')
    return { user: null, error }
  }

  toast.success('Yo, you\'re in! Welcome back 👌')
  return { user: data.user, error: null }
}


// ── Sign In With Google ──────────────────────────────────────
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/`,
    },
  })

  if (error) {
    toast.error(error.message || 'Google authentication failed.')
    return { error }
  }
  return { data, error: null }
}

// ── Sign Out ─────────────────────────────────────────────────
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    toast.error('Sign out failed.')
    return { error }
  }
  toast.success('Logged out. Stay fresh ✌️')
  return { error: null }
}

// ── Reset Password ───────────────────────────────────────────
export const resetPassword = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth?mode=reset`,
  })

  if (error) {
    toast.error(error.message || 'Reset failed. Try again.')
    return { error }
  }

  toast.success('Reset link sent! Check your inbox 📬')
  return { error: null }
}

// ── Auth State Change Listener ───────────────────────────────
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback)
}

// ── Check Username Availability ──────────────────────────────
export const checkUsernameAvailable = async (username) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username)
    .maybeSingle()

  if (error) {
    console.error('Error checking username availability:', error)
    return true // Fallback to true so missing tables don't block signup from submitting and throwing a clear error
  }
  return data === null // true = available
}
