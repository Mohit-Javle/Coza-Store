import React, { useState, useEffect } from 'react'
import {
  getAdminOverview, getAdminProducts, getAdminUsers,
  moderateProduct, toggleStaffPick, banUser, unbanUser, changeUserRole,
} from '../lib/admin'
import AdminSidebar from '../components/admin/AdminSidebar'
import StatsCard from '../components/admin/StatsCard'
import AdminTable from '../components/admin/AdminTable'
import ConditionBadge from '../components/ui/ConditionBadge'
import Footer from '../components/ui/Footer'
import { motion } from 'framer-motion'
import { Users, Tag, Hammer, CreditCard, ShieldAlert, Award, Ban, CheckCircle, XCircle, Star } from 'lucide-react'
import toast from 'react-hot-toast'

const AdminDashboard = ({ isSuperAdmin = false }) => {
  const [activeTab, setActiveTab] = useState('overview')

  // Real data state
  const [overview, setOverview] = useState(null)
  const [products, setProducts] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  // Load data on tab change
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      if (activeTab === 'overview') {
        const data = await getAdminOverview()
        setOverview(data)
      } else if (activeTab === 'listings' || activeTab === 'rewards') {
        const data = await getAdminProducts()
        setProducts(data)
      } else if (activeTab === 'users') {
        const data = await getAdminUsers()
        setUsers(data)
      }
      setLoading(false)
    }
    load()
  }, [activeTab])

  // ── Product Actions ────────────────────────────────────────
  const handleModerate = async (productId, status) => {
    const { error } = await moderateProduct(productId, status)
    if (!error) {
      setProducts((prev) => prev.map((p) => p.id === productId ? { ...p, status } : p))
      toast.success(`Listing ${status}`)
    }
  }

  const handleToggleStaffPick = async (productId, current) => {
    const { error } = await toggleStaffPick(productId, !current)
    if (!error) {
      setProducts((prev) => prev.map((p) => p.id === productId ? { ...p, is_staff_pick: !current } : p))
      toast.success(current ? 'Staff pick removed' : 'Staff pick applied ⭐')
    }
  }

  // ── User Actions ───────────────────────────────────────────
  const handleToggleBan = async (userId, isBanned) => {
    const fn = isBanned ? unbanUser : banUser
    const { error } = await fn(userId)
    if (!error) {
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, is_banned: !isBanned } : u))
      toast.success(isBanned ? 'User unbanned' : 'User banned')
    }
  }

  const handleChangeRole = async (userId, newRole) => {
    const { error } = await changeUserRole(userId, newRole)
    if (!error) {
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u))
      toast.success(`Role set to ${newRole}`)
    }
  }

  // Chart data (weekly activity)
  const chartData = overview?.weekly_listings || [
    { day: 'Mon', count: 0 },
    { day: 'Tue', count: 0 },
    { day: 'Wed', count: 0 },
    { day: 'Thu', count: 0 },
    { day: 'Fri', count: 0 },
    { day: 'Sat', count: 0 },
    { day: 'Sun', count: 0 },
  ]
  const maxCount = Math.max(...chartData.map((d) => d.count), 1)

  const stats = overview
    ? [
        { title: 'TOTAL USERS', value: overview.users, icon: Users, change: '' },
        { title: 'ACTIVE LISTINGS', value: overview.active_products, icon: Tag, change: '' },
        { title: 'LIVE BIDS', value: overview.live_bids, icon: Hammer, change: '' },
        { title: 'PENDING ORDERS', value: overview.pending_orders, icon: CreditCard, change: '' },
      ]
    : []

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full min-h-screen bg-[#0D0D0D] flex flex-col pt-20"
    >
      <div className="flex-grow flex flex-col md:flex-row max-w-7xl mx-auto w-full px-4 md:px-8 py-8 gap-6">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} isSuperAdmin={isSuperAdmin} />

        <main className="flex-grow bg-[#111] border border-[#222] p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#E8FF00]/5 rounded-bl-full pointer-events-none" />

          {/* Heading */}
          <div className="mb-8 border-b border-zinc-800 pb-4">
            <span className="font-space text-xs text-[#E8FF00] uppercase tracking-widest block mb-0.5">STAFF CONTROL BOARD</span>
            <h1 className="font-bebas text-4xl md:text-5xl tracking-wide text-[#F5F0E8] uppercase">
              {activeTab === 'overview' && 'OVERVIEW DESK'}
              {activeTab === 'listings' && 'LISTINGS MODERATION DECK'}
              {activeTab === 'users' && 'USER REGISTRY MANAGEMENT'}
              {activeTab === 'rewards' && 'REWARDS & BADGING PORTAL'}
            </h1>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-zinc-900 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, idx) => (
                      <StatsCard key={idx} title={stat.title} value={stat.value} icon={stat.icon} change={stat.change} />
                    ))}
                  </div>

                  <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-6">
                    <div className="mb-6">
                      <span className="font-space text-xs text-zinc-500 block uppercase">ANALYTICAL ACTIVITY</span>
                      <h3 className="font-bebas text-xl text-[#F5F0E8] tracking-wider uppercase">NEW LISTINGS / DAY (THIS WEEK)</h3>
                    </div>
                    <div className="flex items-end justify-between h-56 border-b border-l border-zinc-800 px-4 pt-6 relative">
                      <div className="absolute top-1/4 left-0 right-0 h-[1px] bg-zinc-900 pointer-events-none" />
                      <div className="absolute top-2/4 left-0 right-0 h-[1px] bg-zinc-900 pointer-events-none" />
                      <div className="absolute top-3/4 left-0 right-0 h-[1px] bg-zinc-900 pointer-events-none" />
                      {chartData.map((data, idx) => {
                        const heightPct = Math.max(5, (data.count / maxCount) * 100)
                        return (
                          <div key={idx} className="flex flex-col items-center gap-2 group w-full">
                            <span className="font-mono text-xs text-[#E8FF00] opacity-0 group-hover:opacity-100 transition-opacity">
                              {data.count}
                            </span>
                            <div
                              className="w-8 bg-[#C8B8A2] group-hover:bg-[#E8FF00] transition-colors shadow-[3px_3px_0px_rgba(0,0,0,1)]"
                              style={{ height: `${heightPct}%` }}
                            />
                            <span className="font-space text-xs text-zinc-500 uppercase">{data.day}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* LISTINGS */}
              {activeTab === 'listings' && (
                <div className="space-y-6">
                  <AdminTable headers={['Image', 'Title', 'Seller', 'High Bid', 'Condition', 'Status', 'Actions', 'Staff Pick']}>
                    {products.map((product) => {
                      const currentPrice = product.current_bid || product.starting_bid
                      return (
                        <tr key={product.id} className="hover:bg-zinc-900/30 transition-colors">
                          <td className="px-4 py-3">
                            {product.images?.[0] && (
                              <img src={product.images[0]} alt={product.title} className="w-12 aspect-[3/4] object-cover border border-[#333]" />
                            )}
                          </td>
                          <td className="px-4 py-3 font-semibold text-[#F5F0E8] max-w-[120px] truncate">{product.title}</td>
                          <td className="px-4 py-3 text-zinc-400">@{product.seller?.username || '—'}</td>
                          <td className="px-4 py-3 font-mono font-bold text-[#E8FF00]">₹{currentPrice?.toLocaleString('en-IN')}</td>
                          <td className="px-4 py-3"><ConditionBadge rating={product.condition} /></td>
                          <td className="px-4 py-3 font-space text-xs">
                            <span className={`px-2 py-0.5 font-bold uppercase ${
                              product.status === 'active' ? 'bg-green-950/50 text-green-400 border border-green-900/30' :
                              product.status === 'rejected' ? 'bg-red-950/50 text-red-400 border border-red-900/30' :
                              product.status === 'flagged' ? 'bg-orange-950/50 text-orange-400 border border-orange-900/30' :
                              'bg-zinc-900 text-zinc-500 border border-zinc-800'
                            }`}>
                              {product.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button onClick={() => handleModerate(product.id, 'active')} className="p-1 bg-green-950/20 hover:bg-green-950 text-green-400 border border-zinc-800" title="Approve">
                                <CheckCircle size={14} />
                              </button>
                              <button onClick={() => handleModerate(product.id, 'rejected')} className="p-1 bg-red-950/20 hover:bg-red-950 text-red-400 border border-zinc-800" title="Reject">
                                <XCircle size={14} />
                              </button>
                              <button onClick={() => handleModerate(product.id, 'flagged')} className="p-1 bg-orange-950/20 hover:bg-orange-950 text-orange-400 border border-zinc-800" title="Flag">
                                <ShieldAlert size={14} />
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleToggleStaffPick(product.id, product.is_staff_pick)}
                              className={`px-3 py-1 font-bebas text-xs tracking-wider transition-colors flex items-center gap-1 ${
                                product.is_staff_pick ? 'bg-[#E8FF00] text-black font-bold' : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-white'
                              }`}
                            >
                              <Star size={10} />
                              {product.is_staff_pick ? 'FEATURED!' : 'FEATURE'}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </AdminTable>
                </div>
              )}

              {/* USERS */}
              {activeTab === 'users' && (
                <div className="space-y-6">
                  <AdminTable headers={['Avatar', 'Username', 'Name', 'Role', 'Status', 'Actions']}>
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-zinc-900/30 transition-colors">
                        <td className="px-4 py-3">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.username} className="w-8 h-8 object-cover border border-[#333]" />
                          ) : (
                            <div className="w-8 h-8 bg-zinc-800 border border-[#333] flex items-center justify-center text-xs font-bold text-zinc-500">
                              {user.username?.[0]?.toUpperCase()}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 font-semibold text-[#F5F0E8]">@{user.username}</td>
                        <td className="px-4 py-3 text-zinc-400">{user.full_name}</td>
                        <td className="px-4 py-3">
                          {isSuperAdmin ? (
                            <select
                              value={user.role}
                              onChange={(e) => handleChangeRole(user.id, e.target.value)}
                              className="raw-input text-xs px-2 py-1 bg-black border-zinc-800"
                            >
                              <option value="user">USER</option>
                              <option value="admin">ADMIN</option>
                              <option value="superadmin">SUPERADMIN</option>
                            </select>
                          ) : (
                            <span className="font-space text-xs uppercase text-zinc-400">{user.role}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-space text-xs">
                          <span className={`px-2 py-0.5 font-bold uppercase ${
                            user.is_banned ? 'bg-red-950/50 text-red-500 border border-red-900/30' : 'bg-green-950/50 text-green-400 border border-green-900/30'
                          }`}>
                            {user.is_banned ? 'Banned' : 'Active'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggleBan(user.id, user.is_banned)}
                            className={`flex items-center gap-1.5 px-3 py-1 font-bebas text-xs tracking-wider border transition-colors ${
                              user.is_banned
                                ? 'bg-green-900/20 text-green-400 border-green-900 hover:bg-green-900/50'
                                : 'bg-red-900/20 text-red-400 border-red-900 hover:bg-red-900/50'
                            }`}
                          >
                            <Ban size={12} />
                            {user.is_banned ? 'UNBAN' : 'BAN'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </AdminTable>
                </div>
              )}

              {/* REWARDS */}
              {activeTab === 'rewards' && (
                <div className="space-y-6">
                  <div className="bg-[#1A1A1A] p-4 border border-[#2A2A2A] mb-6">
                    <span className="font-space text-xs text-[#E8FF00] uppercase font-bold block mb-1">REWARDS BADGING MATRIX</span>
                    <p className="font-space text-zinc-400 text-xs">
                      Apply promotion stamps to listings. Staff picks get featured on the homepage.
                    </p>
                  </div>

                  <AdminTable headers={['Image', 'Title', 'Starting Bid', 'High Bid', 'Staff Pick', 'Toggle']}>
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-zinc-900/30 transition-colors">
                        <td className="px-4 py-3">
                          {product.images?.[0] && (
                            <img src={product.images[0]} alt={product.title} className="w-12 aspect-[3/4] object-cover border border-[#333]" />
                          )}
                        </td>
                        <td className="px-4 py-3 font-semibold text-[#F5F0E8] max-w-[120px] truncate">{product.title}</td>
                        <td className="px-4 py-3 font-mono text-xs text-zinc-500">₹{product.starting_bid?.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 font-mono font-bold text-[#E8FF00]">
                          ₹{(product.current_bid || product.starting_bid)?.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 font-space text-[9px] uppercase font-bold ${
                            product.is_staff_pick ? 'bg-[#E8FF00] text-black' : 'text-zinc-600'
                          }`}>
                            {product.is_staff_pick ? '★ FEATURED' : '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggleStaffPick(product.id, product.is_staff_pick)}
                            className={`px-3 py-1 font-bebas text-xs tracking-wider transition-colors ${
                              product.is_staff_pick ? 'bg-[#E8FF00] text-black' : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-white'
                            }`}
                          >
                            {product.is_staff_pick ? 'UNFEATURE' : 'STAFF PICK'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </AdminTable>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <Footer />
    </motion.div>
  )
}

export default AdminDashboard
