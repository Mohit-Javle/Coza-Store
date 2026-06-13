import { supabase } from './supabase'
import toast from 'react-hot-toast'

// ── Helper: log admin action ─────────────────────────────────
const logAdminAction = async (adminId, action, targetType, targetId, notes) => {
  await supabase.from('admin_logs').insert({
    admin_id: adminId,
    action,
    target_type: targetType,
    target_id: targetId,
    notes,
  })
}

// ── Get Pending Products ─────────────────────────────────────
export const getPendingProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      seller:profiles!seller_id(id, username, avatar_url, full_name)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('getPendingProducts error:', error)
    return []
  }
  return data || []
}

// ── Get All Products (admin) ─────────────────────────────────
export const getAllProducts = async (statusFilter = null) => {
  let query = supabase
    .from('products')
    .select(`
      *,
      seller:profiles!seller_id(id, username, avatar_url, full_name)
    `)
    .order('created_at', { ascending: false })

  if (statusFilter) query = query.eq('status', statusFilter)

  const { data, error } = await query

  if (error) {
    console.error('getAllProducts error:', error)
    return []
  }
  return data || []
}

// ── Approve Product ──────────────────────────────────────────
export const approveProduct = async (productId) => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'not_authenticated' }

  const { data, error } = await supabase
    .from('products')
    .update({ status: 'active' })
    .eq('id', productId)
    .select('seller_id, title')
    .single()

  if (error) {
    toast.error('Something went wrong, try again')
    return { error }
  }

  // Notify seller
  await supabase.from('notifications').insert({
    user_id: data.seller_id,
    type: 'listing_approved',
    message: `Your listing "${data.title}" has been approved and is now live! 🔥`,
    related_product_id: productId,
  })

  await logAdminAction(user.id, 'approve_product', 'product', productId, `Approved listing: ${data.title}`)

  toast.success('Product approved!')
  return { data, error: null }
}

// ── Reject Product ───────────────────────────────────────────
export const rejectProduct = async (productId, reason) => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'not_authenticated' }

  const { data, error } = await supabase
    .from('products')
    .update({ status: 'rejected' })
    .eq('id', productId)
    .select('seller_id, title')
    .single()

  if (error) {
    toast.error('Something went wrong, try again')
    return { error }
  }

  await supabase.from('notifications').insert({
    user_id: data.seller_id,
    type: 'listing_rejected',
    message: `Your listing "${data.title}" was not approved. Reason: ${reason || 'Does not meet guidelines'}`,
    related_product_id: productId,
  })

  await logAdminAction(user.id, 'reject_product', 'product', productId, reason || 'Policy violation')

  toast.success('Product rejected.')
  return { data, error: null }
}

// ── Toggle Staff Pick ────────────────────────────────────────
export const toggleStaffPick = async (productId, currentValue) => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('products')
    .update({ is_staff_pick: !currentValue })
    .eq('id', productId)
    .select()
    .single()

  if (error) {
    toast.error('Something went wrong, try again')
    return { data: null, error }
  }

  if (user) {
    await logAdminAction(user.id, 'toggle_staff_pick', 'product', productId, `Staff pick: ${!currentValue}`)
  }

  toast.success(`Staff pick ${!currentValue ? 'enabled' : 'removed'}!`)
  return { data, error: null }
}

// ── Set Discount ─────────────────────────────────────────────
export const setDiscount = async (productId, percent, tag) => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('products')
    .update({ discount_percent: percent, discount_tag: tag || null })
    .eq('id', productId)
    .select()
    .single()

  if (error) {
    toast.error('Something went wrong, try again')
    return { data: null, error }
  }

  if (user) {
    await logAdminAction(user.id, 'set_discount', 'product', productId, `${percent}% - ${tag}`)
  }

  toast.success('Discount applied!')
  return { data, error: null }
}

// ── Get All Users (superadmin) ───────────────────────────────
export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getAllUsers error:', error)
    return []
  }
  return data || []
}

// ── Ban User ─────────────────────────────────────────────────
export const banUser = async (userId) => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'not_authenticated' }

  const { data, error } = await supabase
    .from('profiles')
    .update({ is_banned: true })
    .eq('id', userId)
    .select('username')
    .single()

  if (error) {
    toast.error('Something went wrong, try again')
    return { error }
  }

  await logAdminAction(user.id, 'ban_user', 'user', userId, `Banned user: ${data.username}`)

  toast.success(`User @${data.username} banned.`)
  return { data, error: null }
}

// ── Unban User ───────────────────────────────────────────────
export const unbanUser = async (userId) => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'not_authenticated' }

  const { data, error } = await supabase
    .from('profiles')
    .update({ is_banned: false })
    .eq('id', userId)
    .select('username')
    .single()

  if (error) {
    toast.error('Something went wrong, try again')
    return { error }
  }

  await logAdminAction(user.id, 'unban_user', 'user', userId, `Unbanned user: ${data.username}`)

  toast.success(`User @${data.username} unbanned.`)
  return { data, error: null }
}

// ── Promote to Admin (superadmin) ───────────────────────────
export const promoteToAdmin = async (userId) => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'not_authenticated' }

  const { data, error } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', userId)
    .select('username')
    .single()

  if (error) {
    toast.error('Something went wrong, try again')
    return { error }
  }

  await logAdminAction(user.id, 'promote_to_admin', 'user', userId, `Promoted: ${data.username}`)

  toast.success(`@${data.username} promoted to admin!`)
  return { data, error: null }
}

// ── Demote Admin ─────────────────────────────────────────────
export const demoteAdmin = async (userId) => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'not_authenticated' }

  const { data, error } = await supabase
    .from('profiles')
    .update({ role: 'user' })
    .eq('id', userId)
    .select('username')
    .single()

  if (error) {
    toast.error('Something went wrong, try again')
    return { error }
  }

  await logAdminAction(user.id, 'demote_admin', 'user', userId, `Demoted: ${data.username}`)

  toast.success(`@${data.username} demoted to user.`)
  return { data, error: null }
}

// ── Get All Orders (admin) ───────────────────────────────────
export const getAllOrders = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      product:products(id, title, images),
      buyer:profiles!buyer_id(id, username),
      seller:profiles!seller_id(id, username)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getAllOrders error:', error)
    return []
  }
  return data || []
}

// ── Get Admin Logs ───────────────────────────────────────────
export const getAdminLogs = async () => {
  const { data, error } = await supabase
    .from('admin_logs')
    .select(`
      *,
      admin:profiles!admin_id(id, username, avatar_url)
    `)
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) {
    console.error('getAdminLogs error:', error)
    return []
  }
  return data || []
}

// ── Dashboard Stats ──────────────────────────────────────────
export const getDashboardStats = async () => {
  const [
    { count: totalUsers },
    { count: activeListings },
    { count: pendingApprovals },
    { count: totalOrders },
    { count: liveBids },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('bids').select('*', { count: 'exact', head: true }),
  ])

  // Total bid volume
  const { data: bidsData } = await supabase.from('bids').select('amount')
  const totalBidVolume = bidsData?.reduce((sum, b) => sum + (b.amount || 0), 0) || 0

  return {
    totalUsers: totalUsers || 0,
    activeListings: activeListings || 0,
    pendingApprovals: pendingApprovals || 0,
    totalOrders: totalOrders || 0,
    liveBids: liveBids || 0,
    totalBidVolume,
  }
}

// ── Analytics: Users per day (30 days) ──────────────────────
export const getUsersPerDay = async () => {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data } = await supabase
    .from('profiles')
    .select('created_at')
    .gte('created_at', since)
    .order('created_at', { ascending: true })

  return groupByDay(data || [], 'created_at', 'users')
}

// ── Analytics: Listings per day (30 days) ───────────────────
export const getListingsPerDay = async () => {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data } = await supabase
    .from('products')
    .select('created_at')
    .gte('created_at', since)
    .order('created_at', { ascending: true })

  return groupByDay(data || [], 'created_at', 'listings')
}

// ── Analytics: Bid volume per day (30 days) ──────────────────
export const getBidVolumePerDay = async () => {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data } = await supabase
    .from('bids')
    .select('created_at, amount')
    .gte('created_at', since)
    .order('created_at', { ascending: true })

  const grouped = {}
  ;(data || []).forEach((b) => {
    const day = b.created_at.slice(0, 10)
    grouped[day] = (grouped[day] || 0) + (b.amount || 0)
  })

  return Object.entries(grouped).map(([date, volume]) => ({ date, volume }))
}

// ── Analytics: Products by category ──────────────────────────
export const getProductsByCategory = async () => {
  const { data } = await supabase
    .from('products')
    .select('category')
    .eq('status', 'active')

  const counts = { tops: 0, bottoms: 0, shoes: 0, accessories: 0 }
  ;(data || []).forEach((p) => {
    if (p.category && counts[p.category] !== undefined) {
      counts[p.category]++
    }
  })

  return Object.entries(counts).map(([name, value]) => ({ name, value }))
}

// ── Helper: Group by day ─────────────────────────────────────
const groupByDay = (rows, dateField, countKey) => {
  const grouped = {}
  rows.forEach((row) => {
    const day = row[dateField].slice(0, 10)
    grouped[day] = (grouped[day] || 0) + 1
  })
  return Object.entries(grouped).map(([date, count]) => ({ date, [countKey]: count }))
}

// ── Top Sellers ───────────────────────────────────────────────
export const getTopSellers = async () => {
  const { data } = await supabase
    .from('products')
    .select('seller_id, seller:profiles!seller_id(username, avatar_url)')
    .eq('status', 'sold')

  const counts = {}
  const profiles = {}
  ;(data || []).forEach((p) => {
    counts[p.seller_id] = (counts[p.seller_id] || 0) + 1
    profiles[p.seller_id] = p.seller
  })

  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([id, sold]) => ({ id, sold, ...profiles[id] }))
}

// ── Recent Signups ────────────────────────────────────────────
export const getRecentSignups = async () => {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  return data || []
}

// ── Alias exports used by Dashboard pages ────────────────────
// These match the import names used in AdminDashboard.jsx and SuperAdminDashboard.jsx

export const getAdminProducts = getAllProducts
export const getAdminUsers = getAllUsers
export const getAuditLogs = getAdminLogs

// Admin overview stats (used by AdminDashboard overview tab)
export const getAdminOverview = async () => {
  const stats = await getDashboardStats()
  return {
    users: stats.totalUsers,
    active_products: stats.activeListings,
    live_bids: stats.liveBids,
    pending_orders: stats.totalOrders,
    weekly_listings: [], // Optionally populate from getListingsPerDay()
  }
}

// Moderate product — set status to any value (active/rejected/flagged)
export const moderateProduct = async (productId, newStatus) => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('products')
    .update({ status: newStatus })
    .eq('id', productId)
    .select('seller_id, title')
    .single()

  if (error) {
    console.error('moderateProduct error:', error)
    return { error }
  }

  if (user) {
    await logAdminAction(user.id, `moderate_product:${newStatus}`, 'product', productId, data?.title)
  }

  // Notify seller on approve/reject
  if (data && (newStatus === 'active' || newStatus === 'rejected')) {
    const msg =
      newStatus === 'active'
        ? `Your listing "${data.title}" is now live! 🔥`
        : `Your listing "${data.title}" was not approved.`
    await supabase.from('notifications').insert({
      user_id: data.seller_id,
      type: newStatus === 'active' ? 'listing_approved' : 'listing_rejected',
      message: msg,
      related_product_id: productId,
    })
  }

  return { data, error: null }
}

// Change user role
export const changeUserRole = async (userId, newRole) => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'not_authenticated' }

  const { data, error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId)
    .select('username')
    .single()

  if (error) {
    console.error('changeUserRole error:', error)
    return { error }
  }

  await logAdminAction(user.id, 'change_role', 'user', userId, `Role set to ${newRole} for ${data?.username}`)
  return { data, error: null }
}

