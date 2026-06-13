import { supabase } from './supabase'
import toast from 'react-hot-toast'

// ── Get Active Products (with filters) ───────────────────────
export const getActiveProducts = async (filters = {}) => {
  let query = supabase
    .from('products')
    .select(`
      *,
      seller:profiles!seller_id(id, username, avatar_url),
      bids(count)
    `)
    .eq('status', 'active')

  if (filters.category) query = query.eq('category', filters.category)
  if (filters.size) query = query.eq('size', filters.size)
  if (filters.brand) query = query.ilike('brand', `%${filters.brand}%`)
  if (filters.condition) query = query.eq('condition', filters.condition)
  if (filters.gender) query = query.eq('gender', filters.gender)
  if (filters.minPrice !== undefined) query = query.gte('current_bid', filters.minPrice)
  if (filters.maxPrice !== undefined) query = query.lte('current_bid', filters.maxPrice)

  // Sorting
  switch (filters.sortBy) {
    case 'ending_soon':
      query = query.order('bid_ends_at', { ascending: true })
      break
    case 'most_bids':
      query = query.order('created_at', { ascending: false })
      break
    case 'price_low':
      query = query.order('current_bid', { ascending: true })
      break
    case 'price_high':
      query = query.order('current_bid', { ascending: false })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query

  if (error) {
    console.error('getActiveProducts error:', error)
    return []
  }
  return data || []
}

// ── Get Product By ID (with seller profile) ──────────────────
export const getProductById = async (id) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      seller:profiles!seller_id(
        id, username, full_name, avatar_url, location, bio
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('getProductById error:', error)
    return null
  }
  return data
}

// ── Create Product (with image upload) ───────────────────────
export const createProduct = async (productData, imageFiles, billFile) => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    toast.error('You must be logged in to list an item.')
    return { data: null, error: 'not_authenticated' }
  }

  // Check if banned
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_banned')
    .eq('id', user.id)
    .single()

  if (profile?.is_banned) {
    toast.error('Account suspended. Contact support.')
    return { data: null, error: 'banned' }
  }

  // Generate a temp product ID for storage paths
  const tempProductId = crypto.randomUUID()

  // Upload product images
  const imageUrls = []
  for (const file of imageFiles) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Upload failed — check file type/size')
      return { data: null, error: 'invalid_file_type' }
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB')
      return { data: null, error: 'file_too_large' }
    }

    const ext = file.name.split('.').pop()
    const path = `${user.id}/${tempProductId}/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(path, file)

    if (uploadError) {
      toast.error('Upload failed — check file type/size')
      return { data: null, error: uploadError }
    }

    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(path)

    imageUrls.push(urlData.publicUrl)
  }

  // Upload bill image (optional)
  let billImageUrl = null
  if (billFile) {
    const path = `${user.id}/${tempProductId}/bill`
    const { error: billError } = await supabase.storage
      .from('bill-images')
      .upload(path, billFile)

    if (!billError) {
      const { data: signed } = await supabase.storage
        .from('bill-images')
        .createSignedUrl(path, 60 * 60 * 24 * 365)
      billImageUrl = signed?.signedUrl || null
    }
  }

  // Insert product
  const { data, error } = await supabase
    .from('products')
    .insert({
      id: tempProductId,
      seller_id: user.id,
      title: productData.title,
      brand: productData.brand,
      category: productData.category?.toLowerCase(),
      size: productData.size,
      gender: productData.gender?.toLowerCase(),
      description: productData.description,
      condition: productData.condition,
      images: imageUrls,
      bill_image: billImageUrl,
      has_bill: !!billFile,
      starting_bid: productData.startingBid,
      current_bid: productData.startingBid,
      buy_now_price: productData.buyNowPrice || null,
      bid_ends_at: productData.bidEndsAt,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    toast.error('Something went wrong, try again')
    return { data: null, error }
  }

  toast.success('Listed! Pending admin approval 👌')
  return { data, error: null }
}

// ── Top Pickups (most bids in last 24h) ──────────────────────
export const getTopPickups = async () => {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      seller:profiles!seller_id(id, username, avatar_url),
      bids!inner(id, created_at)
    `)
    .eq('status', 'active')
    .gte('bids.created_at', since)
    .order('created_at', { ascending: false })
    .limit(8)

  if (error) {
    // Fallback: just get staff picks
    const { data: fallback } = await supabase
      .from('products')
      .select(`*, seller:profiles!seller_id(id, username, avatar_url)`)
      .eq('status', 'active')
      .eq('is_staff_pick', true)
      .order('created_at', { ascending: false })
      .limit(8)
    return fallback || []
  }
  return data || []
}

// ── Live Bids (ending soonest) ───────────────────────────────
export const getLiveBids = async () => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      seller:profiles!seller_id(id, username, avatar_url)
    `)
    .eq('status', 'active')
    .gt('bid_ends_at', new Date().toISOString())
    .order('bid_ends_at', { ascending: true })
    .limit(8)

  if (error) {
    console.error('getLiveBids error:', error)
    return []
  }
  return data || []
}

// ── Fresh Drops (newest) ─────────────────────────────────────
export const getFreshDrops = async () => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      seller:profiles!seller_id(id, username, avatar_url)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(12)

  if (error) {
    console.error('getFreshDrops error:', error)
    return []
  }
  return data || []
}

// ── Get User Listings ────────────────────────────────────────
export const getUserListings = async (userId) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('seller_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getUserListings error:', error)
    return []
  }
  return data || []
}

// ── Update Product Status (admin) ────────────────────────────
export const updateProductStatus = async (productId, status) => {
  const { data, error } = await supabase
    .from('products')
    .update({ status })
    .eq('id', productId)
    .select()
    .single()

  if (error) {
    toast.error('Something went wrong, try again')
    return { data: null, error }
  }
  return { data, error: null }
}

