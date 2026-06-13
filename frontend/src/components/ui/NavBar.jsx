import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { Search, Menu, X, User, LogOut, ShieldAlert, Award, Bell, HelpCircle, Trophy, Plus, LayoutGrid, Users } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import HowItWorksModal from './HowItWorksModal'
import toast from 'react-hot-toast'

const NavBar = () => {
  const { profile, isLoggedIn, isAdmin, isSuperAdmin, signOut } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false)

  // Notifications
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const notifSubRef = useRef(null)

  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsProfileOpen(false)
    setIsNotifOpen(false)
    setIsSearchOpen(false)
  }, [location.pathname])

  // Load unread notification count + realtime subscription
  useEffect(() => {
    if (!isLoggedIn || !profile?.id) {
      setUnreadCount(0)
      return
    }

    const loadCount = async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .eq('is_read', false)
      setUnreadCount(count || 0)
    }

    loadCount()

    // Realtime subscription for new notifications
    notifSubRef.current = supabase
      .channel(`notifications:user:${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${profile.id}`,
        },
        (payload) => {
          setUnreadCount((prev) => prev + 1)
          const newNotif = payload.new
          toast((t) => (
            <div 
              onClick={() => {
                toast.dismiss(t.id)
                if (newNotif.related_order_id) {
                  navigate(`/order/${newNotif.related_order_id}`)
                } else if (newNotif.related_product_id) {
                  navigate(`/product/${newNotif.related_product_id}`)
                }
              }}
              className="cursor-pointer font-space text-[11px] hover:text-[#E8FF00] transition-colors"
            >
              {newNotif.message}
            </div>
          ), {
            icon: '🔔',
            duration: 5000,
          })
        }
      )
      .subscribe()

    return () => {
      if (notifSubRef.current) supabase.removeChannel(notifSubRef.current)
    }
  }, [isLoggedIn, profile?.id])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/store?search=${encodeURIComponent(searchQuery.trim())}`)
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  const handleLogout = async () => {
    setIsProfileOpen(false)
    await signOut()
    navigate('/')
  }

  const handleNotifClick = async () => {
    setIsProfileOpen(false)
    setIsNotifOpen(!isNotifOpen)
    if (!isNotifOpen && profile?.id) {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(5)
      setNotifications(data || [])

      if (unreadCount > 0) {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', profile.id)
          .eq('is_read', false)
        setUnreadCount(0)
      }
    }
  }

  const isHeroPage = location.pathname === '/'

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 border-b ${
          isScrolled || !isHeroPage
            ? 'bg-[#0D0D0D]/95 border-[#2A2A2A] py-3 backdrop-blur-md'
            : 'bg-transparent border-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="font-bebas text-3xl md:text-4xl tracking-tighter text-[#F5F0E8] group-hover:text-[#E8FF00] transition-colors duration-200">
              COZA<span className="text-[#E8FF00] group-hover:text-[#F5F0E8]">-STORE</span>
            </span>
          </Link>

          {/* Top header navigation links removed to bottom dock */}

          {/* Header Actions */}
          <div className="flex items-center gap-3 md:gap-5">

            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-[#F5F0E8] hover:text-[#E8FF00] transition-colors"
              aria-label="Toggle Search"
            >
              <Search size={20} />
            </button>

            {/* Auth section */}
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={handleNotifClick}
                    className="relative text-[#F5F0E8] hover:text-[#E8FF00] transition-colors focus:outline-none"
                    aria-label="Notifications"
                  >
                    <Bell size={20} />
                    <AnimatePresence>
                      {unreadCount > 0 && (
                        <motion.span
                          key={unreadCount}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center animate-pulse"
                        >
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>

                  <AnimatePresence>
                    {isNotifOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsNotifOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 mt-3 w-72 bg-[#1A1A1A] border border-[#333] shadow-xl z-20 py-2"
                        >
                          <div className="px-4 py-2 border-b border-[#333] mb-1 flex justify-between items-center">
                            <span className="font-space text-xs font-bold uppercase tracking-wider text-[#C8B8A2]">Notifications</span>
                          </div>

                          <div className="max-h-60 overflow-y-auto">
                            {notifications.length === 0 ? (
                              <div className="px-4 py-3 text-xs text-zinc-500 font-space uppercase italic">No notifications yet.</div>
                            ) : (
                              notifications.map((n) => (
                                <div
                                  key={n.id}
                                  onClick={() => {
                                    setIsNotifOpen(false)
                                    if (n.related_order_id) {
                                      navigate(`/order/${n.related_order_id}`)
                                    } else if (n.related_product_id) {
                                      navigate(`/product/${n.related_product_id}`)
                                    }
                                  }}
                                  className="px-4 py-2.5 border-b border-[#262626] last:border-b-0 hover:bg-[#E8FF00]/10 cursor-pointer transition-colors"
                                >
                                  <p className="font-space text-[11px] text-[#F5F0E8] leading-normal">{n.message}</p>
                                  <span className="font-space text-[8px] text-zinc-500 block mt-1 uppercase">
                                    {new Date(n.created_at).toLocaleDateString()} at {new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 pl-2 border-l border-zinc-700 focus:outline-none"
                  >
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.username}
                        className="w-8 h-8 border border-[#444444] object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-zinc-800 border border-[#444] flex items-center justify-center text-xs font-bold text-zinc-400">
                        {profile?.username?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <span className="font-space text-xs text-[#C8B8A2] hover:text-[#F5F0E8] transition-colors max-w-[100px] truncate">
                      @{profile?.username}
                    </span>
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 mt-3 w-56 bg-[#1A1A1A] border border-[#333] shadow-xl z-20 py-2"
                        >
                          <div className="px-4 py-2 border-b border-[#333] mb-1">
                            <p className="font-space text-xs text-zinc-500">Logged in as</p>
                            <p className="font-space text-sm font-semibold truncate text-[#F5F0E8]">
                              {profile?.full_name || profile?.username}
                            </p>
                            {profile?.role !== 'user' && (
                              <span className="font-space text-[9px] bg-[#E8FF00] text-black px-1.5 py-0.5 uppercase font-bold">
                                {profile?.role}
                              </span>
                            )}
                          </div>

                          <Link
                            to={`/profile/${profile?.username}`}
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-space text-[#F5F0E8] hover:bg-[#E8FF00] hover:text-black transition-colors"
                          >
                            <User size={16} /> My Profile
                          </Link>

                          {isAdmin && (
                            <Link
                              to="/admin"
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-sm font-space text-[#F5F0E8] hover:bg-[#E8FF00] hover:text-black transition-colors"
                            >
                              <ShieldAlert size={16} /> Admin Panel
                            </Link>
                          )}

                          {isSuperAdmin && (
                            <Link
                              to="/superadmin"
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-sm font-space text-[#F5F0E8] hover:bg-[#E8FF00] hover:text-black transition-colors"
                            >
                              <Award size={16} /> Super Admin
                            </Link>
                          )}

                          <button
                            onClick={handleLogout}
                            className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm font-space text-[#F5F0E8] hover:bg-red-600 hover:text-white transition-colors border-t border-[#333] mt-1"
                          >
                            <LogOut size={16} /> Log Out
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <Link
                to="/auth"
                className="raw-btn bg-[#E8FF00] hover:bg-[#F5F0E8] text-black px-3.5 py-1.5 md:px-5 md:py-2 text-[10px] md:text-sm font-bold tracking-wide shadow-[3px_3px_0px_0px_rgba(200,184,162,0.3)] hover:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]"
              >
                JOIN
              </Link>
            )}
          </div>

          {/* Mobile hamburger toggle removed */}
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="w-full bg-[#1A1A1A] border-t border-b border-[#2A2A2A] overflow-hidden"
            >
              <div className="max-w-3xl mx-auto px-4 py-4">
                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="SEARCH BRAND, FITS, SIZES..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-grow raw-input px-4 py-2 text-sm uppercase font-space bg-black border-[#444]"
                    autoFocus
                  />
                  <button type="submit" className="raw-btn bg-[#E8FF00] hover:bg-[#F5F0E8] text-black px-6 text-sm font-bold tracking-wider">
                    SEARCH
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile menu overlay removed */}

      {/* Floating Bottom Navigation Dock */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92vw] md:w-[520px]">
        <div className="w-full bg-[#151515]/90 backdrop-blur-xl border border-zinc-700 px-6 py-3 md:px-10 md:py-4 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.8)] flex items-center justify-around transition-all duration-300">
          
          {/* Browse Drops */}
          <Link
            to="/store"
            className={`flex flex-col items-center gap-1 font-space text-[9px] md:text-[10px] tracking-widest font-bold uppercase transition-all duration-200 ${
              location.pathname === '/store' && searchParams.get('type') !== 'collectors' ? 'text-[#E8FF00] scale-110' : 'text-zinc-400 hover:text-[#F5F0E8]'
            }`}
          >
            <LayoutGrid size={18} />
            <span>Browse</span>
          </Link>

          {/* Search Collectors */}
          <Link
            to="/store?type=collectors"
            className={`flex flex-col items-center gap-1 font-space text-[9px] md:text-[10px] tracking-widest font-bold uppercase transition-all duration-200 ${
              location.pathname === '/store' && searchParams.get('type') === 'collectors' ? 'text-[#E8FF00] scale-110' : 'text-zinc-400 hover:text-[#F5F0E8]'
            }`}
          >
            <Users size={18} />
            <span>Collectors</span>
          </Link>

          {/* Sell An Item */}
          <Link
            to="/sell"
            className={`flex flex-col items-center gap-1 font-space text-[9px] md:text-[10px] tracking-widest font-bold uppercase transition-all duration-200 ${
              location.pathname === '/sell' ? 'text-[#E8FF00] scale-110' : 'text-zinc-400 hover:text-[#F5F0E8]'
            }`}
          >
            <Plus size={18} />
            <span>Sell</span>
          </Link>

          {/* Leaderboard */}
          <Link
            to="/leaderboard"
            className={`flex flex-col items-center gap-1 font-space text-[9px] md:text-[10px] tracking-widest font-bold uppercase transition-all duration-200 ${
              location.pathname === '/leaderboard' ? 'text-[#E8FF00] scale-110' : 'text-zinc-405'
            }`}
          >
            <Trophy size={18} />
            <span>Ranks</span>
          </Link>

          {/* How It Works (Only if NOT logged in) */}
          {!isLoggedIn && (
            <button
              onClick={() => setIsHowItWorksOpen(true)}
              className="flex flex-col items-center gap-1 font-space text-[9px] md:text-[10px] tracking-widest font-bold uppercase transition-all duration-200 text-zinc-400 hover:text-[#F5F0E8]"
            >
              <HelpCircle size={18} />
              <span>Guide</span>
            </button>
          )}

        </div>
      </div>

      <HowItWorksModal isOpen={isHowItWorksOpen} onClose={() => setIsHowItWorksOpen(false)} />
    </>
  )
}

export default NavBar
