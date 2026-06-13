import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Footer from '../components/ui/Footer'
import { motion, AnimatePresence } from 'framer-motion'
import {
  KeyRound, Mail, User, Eye, EyeOff, Check, X, AlertCircle, ArrowRight, Globe,
} from 'lucide-react'
import { signIn, signUp, resetPassword, checkUsernameAvailable, signInWithGoogle } from '../lib/auth'

// ── Password Strength ─────────────────────────────────────────
const getPasswordStrength = (pw) => {
  if (!pw) return { score: 0, label: '', color: '' }
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++

  if (score <= 1) return { score, label: 'WEAK', color: 'bg-red-500' }
  if (score === 2) return { score, label: 'FAIR', color: 'bg-yellow-500' }
  if (score === 3) return { score, label: 'GOOD', color: 'bg-lime-400' }
  return { score, label: 'STRONG', color: 'bg-[#E8FF00]' }
}

const AuthPage = () => {
  const { isLoggedIn, profile } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || ''

  const [mode, setMode] = useState('login')

  // Form fields
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  // UI states
  const [showPass, setShowPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState(null) // null | 'checking' | 'available' | 'taken'
  const [resetMode, setResetMode] = useState(false)

  const debounceRef = useRef(null)
  const pwStrength = getPasswordStrength(password)

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn && profile) {
      navigate(redirect ? `/${redirect}` : `/profile/${profile.username}`)
    }
  }, [isLoggedIn, profile])

  // Username availability check with 500ms debounce
  useEffect(() => {
    if (mode !== 'signup' || !username) {
      setUsernameStatus(null)
      return
    }
    if (username.length < 3) {
      setUsernameStatus('too_short')
      return
    }
    setUsernameStatus('checking')
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const available = await checkUsernameAvailable(username)
      setUsernameStatus(available ? 'available' : 'taken')
    }, 500)
    return () => clearTimeout(debounceRef.current)
  }, [username, mode])

  // ── Handle Login ──────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    const { error } = await signIn({ email, password })
    setLoading(false)
    if (!error) {
      navigate(redirect ? `/${redirect}` : '/')
    }
  }

  // ── Handle Signup ─────────────────────────────────────────
  const handleSignup = async (e) => {
    e.preventDefault()
    if (!fullName || !username || !email || !password || !confirmPassword) return
    if (password !== confirmPassword) return
    if (usernameStatus !== 'available') return
    if (!agreedToTerms) return
    if (pwStrength.score < 2) return

    setLoading(true)
    const { error } = await signUp({ email, password, username, fullName })
    setLoading(false)
    if (!error) {
      navigate('/')
    }
  }

  // ── Handle Reset ──────────────────────────────────────────
  const handleReset = async (e) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    await resetPassword(email)
    setLoading(false)
    setResetMode(false)
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    setUsername('')
    setFullName('')
    setPassword('')
    setConfirmPassword('')
    setUsernameStatus(null)
    setResetMode(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="grain-overlay w-full min-h-screen bg-black flex flex-col pt-24 justify-between"
    >
      <div className="flex-grow flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-8 shadow-[8px_8px_0px_rgba(232,255,0,0.08)] relative overflow-hidden">
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#E8FF00]" />

            {/* Logo */}
            <div className="text-center mb-8">
              <span className="font-bebas text-4xl tracking-widest text-[#F5F0E8] uppercase block">
                COZA STORE
              </span>
              <p className="font-space text-zinc-500 text-[10px] mt-1 uppercase tracking-widest">
                {mode === 'login' ? 'Access your archive' : 'Join the movement'}
              </p>
            </div>

            {/* Tab switcher */}
            {!resetMode && (
              <div className="flex border-b border-zinc-800 mb-6 relative">
                {['login', 'signup'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => switchMode(tab)}
                    className={`flex-1 text-center py-2.5 font-bebas text-lg tracking-widest transition-colors ${
                      mode === tab ? 'text-[#E8FF00]' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {tab === 'login' ? 'LOGIN' : 'SIGN UP'}
                  </button>
                ))}
                <motion.div
                  className="absolute bottom-0 h-0.5 bg-[#E8FF00]"
                  initial={false}
                  animate={{ left: mode === 'login' ? '0%' : '50%', width: '50%' }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                />
              </div>
            )}

            {/* RESET PASSWORD MODE */}
            <AnimatePresence mode="wait">
              {resetMode ? (
                <motion.form
                  key="reset"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleReset}
                  className="space-y-4"
                >
                  <div className="text-center mb-4">
                    <span className="font-bebas text-2xl text-[#F5F0E8] uppercase block">Reset Password</span>
                    <p className="font-space text-zinc-500 text-[10px] mt-1">
                      Enter your email to receive a reset link
                    </p>
                  </div>
                  <InputField
                    label="EMAIL ADDRESS"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    icon={<Mail size={14} />}
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full raw-btn py-3 bg-[#E8FF00] hover:bg-[#F5F0E8] text-black font-extrabold tracking-widest text-sm disabled:opacity-60"
                  >
                    {loading ? 'SENDING...' : 'SEND RESET LINK'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setResetMode(false)}
                    className="w-full text-center font-space text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors py-2"
                  >
                    ← Back to login
                  </button>
                </motion.form>
              ) : mode === 'login' ? (
                /* LOGIN FORM */
                <motion.form
                  key="login"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleLogin}
                  className="space-y-4"
                >
                  <InputField
                    label="EMAIL ADDRESS"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    icon={<Mail size={14} />}
                    required
                  />
                  <PasswordField
                    label="PASSWORD"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    show={showPass}
                    onToggle={() => setShowPass(!showPass)}
                    required
                  />

                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setResetMode(true)}
                      className="font-space text-[10px] text-zinc-500 hover:text-[#E8FF00] transition-colors uppercase tracking-wider"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !email || !password}
                    className="w-full raw-btn py-3 bg-[#E8FF00] hover:bg-[#F5F0E8] text-black font-extrabold tracking-widest text-sm shadow-[4px_4px_0px_rgba(255,255,255,1)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? 'ENTERING...' : (
                      <>ENTER THE STORE <ArrowRight size={16} /></>
                    )}
                  </button>

                  <OAuthDivider />

                  <button
                    type="button"
                    onClick={signInWithGoogle}
                    className="w-full flex items-center justify-center gap-2 p-2.5 bg-transparent border border-zinc-800 hover:border-[#E8FF00] hover:text-[#E8FF00] font-space text-[10px] text-zinc-400 uppercase tracking-wider transition-colors"
                  >
                    <Globe size={12} /> Continue with Google
                  </button>
                </motion.form>
              ) : (
                /* SIGNUP FORM */
                <motion.form
                  key="signup"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleSignup}
                  className="space-y-4"
                >
                  <InputField
                    label="FULL NAME"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your real name"
                    icon={<User size={14} />}
                    required
                    maxLength={80}
                  />

                  {/* Username with availability check */}
                  <div className="flex flex-col gap-1">
                    <label className="font-space text-[10px] tracking-wider text-zinc-500 uppercase">
                      USERNAME HANDLE
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-space text-xs">@</span>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''))}
                        className="w-full raw-input pl-7 pr-9 py-2 text-xs"
                        placeholder="deadstock.dev"
                        maxLength={30}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {usernameStatus === 'checking' && (
                          <div className="w-3 h-3 border border-zinc-500 border-t-transparent rounded-full animate-spin" />
                        )}
                        {usernameStatus === 'available' && <Check size={14} className="text-green-400" />}
                        {usernameStatus === 'taken' && <X size={14} className="text-red-400" />}
                        {usernameStatus === 'too_short' && <AlertCircle size={14} className="text-zinc-600" />}
                      </div>
                    </div>
                    {usernameStatus === 'available' && (
                      <span className="font-space text-[9px] text-green-400">@{username} is available!</span>
                    )}
                    {usernameStatus === 'taken' && (
                      <span className="font-space text-[9px] text-red-400">@{username} is already taken.</span>
                    )}
                    {usernameStatus === 'too_short' && (
                      <span className="font-space text-[9px] text-zinc-600">Minimum 3 characters</span>
                    )}
                  </div>

                  <InputField
                    label="EMAIL ADDRESS"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    icon={<Mail size={14} />}
                    required
                  />

                  {/* Password with strength */}
                  <div className="flex flex-col gap-1">
                    <PasswordField
                      label="PASSWORD"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      show={showPass}
                      onToggle={() => setShowPass(!showPass)}
                      required
                    />
                    {password && (
                      <div className="mt-1 space-y-1">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                i <= pwStrength.score ? pwStrength.color : 'bg-zinc-800'
                              }`}
                            />
                          ))}
                        </div>
                        <span className={`font-space text-[9px] ${
                          pwStrength.score <= 1 ? 'text-red-400' :
                          pwStrength.score === 2 ? 'text-yellow-400' :
                          pwStrength.score === 3 ? 'text-lime-400' : 'text-[#E8FF00]'
                        }`}>
                          {pwStrength.label}
                        </span>
                      </div>
                    )}
                  </div>

                  <PasswordField
                    label="CONFIRM PASSWORD"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    show={showConfirmPass}
                    onToggle={() => setShowConfirmPass(!showConfirmPass)}
                    required
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <p className="font-space text-[9px] text-red-400 -mt-2">Passwords don't match</p>
                  )}

                  {/* Terms checkbox */}
                  <label className="flex items-start gap-2.5 cursor-pointer group">
                    <div
                      onClick={() => setAgreedToTerms(!agreedToTerms)}
                      className={`mt-0.5 w-4 h-4 border flex-shrink-0 flex items-center justify-center transition-colors ${
                        agreedToTerms ? 'bg-[#E8FF00] border-[#E8FF00]' : 'border-zinc-600 group-hover:border-zinc-400'
                      }`}
                    >
                      {agreedToTerms && <Check size={10} className="text-black" />}
                    </div>
                    <span className="font-space text-[10px] text-zinc-500 leading-relaxed">
                      I agree to the vibe — I'll keep it real, no fakes, no cap.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={
                      loading ||
                      !fullName || !username || !email || !password || !confirmPassword ||
                      password !== confirmPassword ||
                      usernameStatus !== 'available' ||
                      !agreedToTerms ||
                      pwStrength.score < 2
                    }
                    className="w-full raw-btn py-3 bg-[#E8FF00] hover:bg-[#F5F0E8] text-black font-extrabold tracking-widest text-sm shadow-[4px_4px_0px_rgba(255,255,255,1)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? 'CREATING...' : (
                      <>REGISTER MEMBERSHIP <ArrowRight size={16} /></>
                    )}
                  </button>

                  <OAuthDivider />

                  <button
                    type="button"
                    onClick={signInWithGoogle}
                    className="w-full flex items-center justify-center gap-2 p-2.5 bg-transparent border border-zinc-800 hover:border-[#E8FF00] hover:text-[#E8FF00] font-space text-[10px] text-zinc-400 uppercase tracking-wider transition-colors"
                  >
                    <Globe size={12} /> Continue with Google
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom toggle */}
          {!resetMode && (
            <p className="text-center font-space text-[10px] text-zinc-600 mt-4">
              {mode === 'login' ? (
                <>Not in the club?{' '}
                  <button onClick={() => switchMode('signup')} className="text-[#E8FF00] hover:underline">
                    SIGN UP
                  </button>
                </>
              ) : (
                <>Already a member?{' '}
                  <button onClick={() => switchMode('login')} className="text-[#E8FF00] hover:underline">
                    LOGIN
                  </button>
                </>
              )}
            </p>
          )}
        </div>
      </div>

      <Footer />
    </motion.div>
  )
}

// ── Reusable field components ──────────────────────────────────
const InputField = ({ label, icon, ...props }) => (
  <div className="flex flex-col gap-1">
    <label className="font-space text-[10px] tracking-wider text-zinc-500 uppercase">{label}</label>
    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600">{icon}</span>
      )}
      <input
        {...props}
        className={`w-full raw-input ${icon ? 'pl-9' : 'pl-3'} pr-3 py-2 text-xs`}
      />
    </div>
  </div>
)

const PasswordField = ({ label, value, onChange, show, onToggle, required }) => (
  <div className="flex flex-col gap-1">
    <label className="font-space text-[10px] tracking-wider text-zinc-500 uppercase">{label}</label>
    <div className="relative">
      <KeyRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
      <input
        type={show ? 'text' : 'password'}
        required={required}
        value={value}
        onChange={onChange}
        className="w-full raw-input pl-9 pr-10 py-2 text-xs"
        placeholder="••••••••"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
      >
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  </div>
)

const OAuthDivider = () => (
  <div className="flex items-center justify-between gap-4 my-2">
    <div className="h-[1px] bg-zinc-800 flex-grow" />
    <span className="font-space text-[9px] text-zinc-600 uppercase tracking-widest shrink-0">OR RUN VIA KEYS</span>
    <div className="h-[1px] bg-zinc-800 flex-grow" />
  </div>
)

export default AuthPage
