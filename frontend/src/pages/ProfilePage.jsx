import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { getUserListings } from '../lib/products'
import ProfileGrid from '../components/profile/ProfileGrid'
import Footer from '../components/ui/Footer'
import { motion } from 'framer-motion'
import { MapPin, Settings, Plus, LayoutGrid, CheckCircle2, ShoppingBag } from 'lucide-react'
import toast from 'react-hot-toast'

const ProfilePage = () => {
  const { username } = useParams()
  const navigate = useNavigate()
  const { profile: currentProfile, isLoggedIn, refreshProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('selling')
  const [isEditing, setIsEditing] = useState(false)

  const [viewProfile, setViewProfile] = useState(null)
  const [allListings, setAllListings] = useState([])
  const [loadingProfile, setLoadingProfile] = useState(true)

  // Edit fields
  const [bioInput, setBioInput] = useState('')
  const [locationInput, setLocationInput] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [username])

  // Revoke preview object URL when it changes or component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleCancel = () => {
    setIsEditing(false)
    setAvatarFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    setBioInput(viewProfile.bio || '')
    setLocationInput(viewProfile.location || '')
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null
    setAvatarFile(file)
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }

  // Fetch profile by username
  useEffect(() => {
    const load = async () => {
      setLoadingProfile(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (error || !data) {
        setViewProfile(null)
        setLoadingProfile(false)
        return
      }

      setViewProfile(data)
      setBioInput(data.bio || '')
      setLocationInput(data.location || '')

      // Load listings
      const listings = await getUserListings(data.id)
      setAllListings(listings)
      setLoadingProfile(false)
    }
    load()
  }, [username])

  if (loadingProfile) {
    return (
      <div className="w-full min-h-screen bg-[#0D0D0D] flex items-center justify-center pt-24">
        <div className="w-8 h-8 border-2 border-[#E8FF00] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!viewProfile) {
    return (
      <div className="w-full min-h-screen bg-[#0D0D0D] flex flex-col justify-center items-center text-center p-6 pt-24">
        <h2 className="font-bebas text-5xl text-red-500 mb-4">PROFILE NOT FOUND</h2>
        <p className="font-space text-zinc-400 mb-8 max-w-sm uppercase">
          The collector you are looking for doesn't exist in our system.
        </p>
        <button
          onClick={() => navigate('/')}
          className="raw-btn bg-[#E8FF00] text-black px-6 py-3 text-xs font-bold tracking-widest uppercase"
        >
          BACK HOME
        </button>
      </div>
    )
  }

  const isOwnProfile = isLoggedIn && currentProfile?.username === viewProfile.username

  // Group listings by status
  const sellingItems = allListings.filter((p) => p.status === 'active' || p.status === 'pending')
  const soldItems = allListings.filter((p) => p.status === 'sold')
  const pendingItems = allListings.filter((p) => p.status === 'pending')

  const handleSaveChanges = async (e) => {
    e.preventDefault()
    setSaving(true)

    let avatarUrl = viewProfile.avatar_url

    // Upload avatar if changed
    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop()
      const path = `${currentProfile.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true })
      
      if (uploadError) {
        toast.error(`Failed to upload avatar: ${uploadError.message}`)
        setSaving(false)
        return
      }

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
      avatarUrl = urlData.publicUrl
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        bio: bioInput,
        location: locationInput,
        avatar_url: avatarUrl,
      })
      .eq('id', currentProfile.id)

    setSaving(false)
    if (error) {
      toast.error('Something went wrong, try again')
    } else {
      toast.success('Profile updated')
      await refreshProfile()
      setViewProfile((prev) => ({ ...prev, bio: bioInput, location: locationInput, avatar_url: avatarUrl }))
      setIsEditing(false)
      setAvatarFile(null)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full min-h-screen bg-[#0D0D0D] flex flex-col pt-20"
    >
      {/* Cover Image */}
      <div className="w-full h-48 md:h-64 relative bg-zinc-900 overflow-hidden">
        {viewProfile.cover_url ? (
          <img
            src={viewProfile.cover_url}
            alt={`${viewProfile.username} cover`}
            className="w-full h-full object-cover filter brightness-[0.7] grayscale"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-zinc-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
      </div>

      {/* Profile Header */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 w-full -mt-16 md:-mt-20 relative z-10 mb-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">

          {/* Avatar + Info */}
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4 md:gap-6">
            <div className="w-28 h-28 md:w-36 md:h-36 bg-[#1A1A1A] border-4 border-[#0D0D0D] overflow-hidden shrink-0 shadow-[4px_4px_0px_rgba(232,255,0,0.15)] relative">
              {previewUrl || viewProfile.avatar_url ? (
                <img src={previewUrl || viewProfile.avatar_url} alt={viewProfile.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bebas text-5xl text-zinc-600">
                  {viewProfile.username?.[0]?.toUpperCase()}
                </div>
              )}
              {isEditing && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/60 cursor-pointer text-[10px] font-space text-white uppercase tracking-wider text-center p-2">
                  Click to change
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>

            <div className="pb-2">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h1 className="font-bebas text-4xl md:text-5xl tracking-tight text-[#F5F0E8] uppercase leading-none">
                  {viewProfile.full_name || viewProfile.username}
                </h1>
                <span className="font-space text-xs text-zinc-500 font-bold bg-zinc-900 border border-zinc-800 px-2 py-0.5 mt-1">
                  @{viewProfile.username}
                </span>
                {viewProfile.role !== 'user' && (
                  <span className="font-space text-[9px] bg-[#E8FF00] text-black px-2 py-0.5 uppercase font-bold mt-1">
                    {viewProfile.role}
                  </span>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSaveChanges} className="space-y-2 mt-2 w-full max-w-md">
                  <textarea
                    value={bioInput}
                    onChange={(e) => setBioInput(e.target.value)}
                    className="w-full raw-input text-xs p-2 uppercase font-space h-16 bg-black"
                    placeholder="ENTER YOUR BIO..."
                    maxLength={200}
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                      className="raw-input text-xs p-2 uppercase font-space bg-black flex-grow"
                      placeholder="LOCATION (e.g. Mumbai)"
                      maxLength={50}
                    />
                    <button
                      type="submit"
                      disabled={saving}
                      className="raw-btn bg-[#E8FF00] text-black px-4 py-2 font-bold text-xs disabled:opacity-50"
                    >
                      {saving ? '...' : 'SAVE'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="raw-btn bg-zinc-800 text-zinc-400 hover:text-white px-4 py-2 text-xs"
                    >
                      CANCEL
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  {viewProfile.bio && (
                    <p className="font-space text-xs md:text-sm text-zinc-300 max-w-lg mb-2">{viewProfile.bio}</p>
                  )}
                  {viewProfile.location && (
                    <div className="flex items-center gap-1 font-space text-xs text-[#C8B8A2] uppercase">
                      <MapPin size={12} />
                      <span>{viewProfile.location}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Action buttons (own profile) */}
          {isOwnProfile && !isEditing && (
            <div className="flex gap-2 self-start md:self-end">
              <button
                onClick={() => setIsEditing(true)}
                className="raw-btn flex items-center gap-1.5 px-4 py-2.5 bg-transparent border border-zinc-700 hover:border-[#C8B8A2] text-xs font-bold text-[#F5F0E8]"
              >
                <Settings size={14} /> EDIT PROFILE
              </button>
              <button
                onClick={() => navigate('/sell')}
                className="raw-btn flex items-center gap-1.5 px-4 py-2.5 bg-[#E8FF00] hover:bg-[#F5F0E8] text-black text-xs font-bold shadow-[2px_2px_0px_rgba(255,255,255,1)]"
              >
                <Plus size={14} /> LIST AN ITEM
              </button>
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-1 md:gap-4 max-w-xl border-t border-b border-zinc-800 py-4 mt-8 font-space text-center text-xs md:text-sm">
          <div className="border-r border-zinc-900">
            <span className="text-[10px] text-zinc-500 block uppercase">LISTED</span>
            <span className="font-mono font-bold text-[#F5F0E8]">{sellingItems.length} ITEMS</span>
          </div>
          <div className="border-r border-zinc-900">
            <span className="text-[10px] text-zinc-500 block uppercase">SOLD</span>
            <span className="font-mono font-bold text-[#C8B8A2]">{soldItems.length} ITEMS</span>
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 block uppercase">PENDING</span>
            <span className="font-mono font-bold text-[#E8FF00]">{pendingItems.length} ITEMS</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 w-full pb-16 flex-grow">
        <div className="flex border-b border-zinc-800 mb-6 font-bebas text-lg tracking-wider">
          <button
            onClick={() => setActiveTab('selling')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 uppercase transition-all ${
              activeTab === 'selling' ? 'border-[#E8FF00] text-[#E8FF00]' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <LayoutGrid size={16} /> SELLING ({sellingItems.length})
          </button>
          <button
            onClick={() => setActiveTab('sold')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 uppercase transition-all ${
              activeTab === 'sold' ? 'border-[#E8FF00] text-[#E8FF00]' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <CheckCircle2 size={16} /> SOLD ({soldItems.length})
          </button>
          {isOwnProfile && (
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 uppercase transition-all ${
                activeTab === 'pending' ? 'border-[#E8FF00] text-[#E8FF00]' : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <ShoppingBag size={16} /> PENDING ({pendingItems.length})
            </button>
          )}
        </div>

        <div className="mt-4">
          {activeTab === 'selling' && <ProfileGrid items={sellingItems} />}
          {activeTab === 'sold' && <ProfileGrid items={soldItems} />}
          {activeTab === 'pending' && <ProfileGrid items={pendingItems} />}
        </div>
      </div>

      <Footer />
    </motion.div>
  )
}

export default ProfilePage
