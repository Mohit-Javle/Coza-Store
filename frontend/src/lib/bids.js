import { supabase } from './supabase'
import toast from 'react-hot-toast'

// ── Place a Bid ──────────────────────────────────────────────
export const placeBid = async (productId, amount) => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    toast.error('You must be logged in to bid.')
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
    await supabase.auth.signOut()
    return { data: null, error: 'banned' }
  }

  // Fetch product to validate
  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('id, seller_id, current_bid, starting_bid, status')
    .eq('id', productId)
    .single()

  if (fetchError || !product) {
    toast.error('Something went wrong, try again')
    return { data: null, error: fetchError }
  }

  // Validations
  if (product.status !== 'active') {
    toast.error('This listing is no longer active.')
    return { data: null, error: 'not_active' }
  }

  if (product.seller_id === user.id) {
    toast.error("You can't bid on your own item")
    return { data: null, error: 'own_item' }
  }

  if (amount <= (product.current_bid || product.starting_bid)) {
    toast.error('Bid must be higher than current bid')
    return { data: null, error: 'bid_too_low' }
  }

  // Insert bid
  const { data: bid, error: bidError } = await supabase
    .from('bids')
    .insert({
      product_id: productId,
      bidder_id: user.id,
      amount,
    })
    .select()
    .single()

  if (bidError) {
    toast.error('Something went wrong, try again')
    return { data: null, error: bidError }
  }

  // Update product's current_bid
  await supabase
    .from('products')
    .update({ current_bid: amount })
    .eq('id', productId)

  // Notify seller
  await supabase.from('notifications').insert({
    user_id: product.seller_id,
    type: 'new_bid',
    message: `Someone placed a bid of ₹${amount.toLocaleString('en-IN')} on your listing!`,
    related_product_id: productId,
  })

  // Notify previously outbid users (get all unique bidders except current)
  const { data: prevBids } = await supabase
    .from('bids')
    .select('bidder_id')
    .eq('product_id', productId)
    .neq('bidder_id', user.id)
    .neq('bidder_id', product.seller_id)

  if (prevBids?.length) {
    const uniqueBidders = [...new Set(prevBids.map((b) => b.bidder_id))]
    const outbidNotifs = uniqueBidders.map((bidderId) => ({
      user_id: bidderId,
      type: 'outbid',
      message: `You've been outbid! Current bid is ₹${amount.toLocaleString('en-IN')}`,
      related_product_id: productId,
    }))
    await supabase.from('notifications').insert(outbidNotifs)
  }

  toast.success('Bid placed successfully 🔥')
  return { data: bid, error: null }
}

// ── Get Bid History (with bidder info) ───────────────────────
export const getBidHistory = async (productId) => {
  const { data, error } = await supabase
    .from('bids')
    .select(`
      *,
      bidder:profiles!bidder_id(id, username, avatar_url)
    `)
    .eq('product_id', productId)
    .order('amount', { ascending: false })

  if (error) {
    console.error('getBidHistory error:', error)
    return []
  }
  return data || []
}

// ── Get User's Bids ──────────────────────────────────────────
export const getUserBids = async (userId) => {
  const { data, error } = await supabase
    .from('bids')
    .select(`
      *,
      product:products(id, title, images, current_bid, bid_ends_at, status)
    `)
    .eq('bidder_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getUserBids error:', error)
    return []
  }
  return data || []
}

// ── Accept Bid (seller action → creates order) ───────────────
export const acceptBid = async (productId, bidderId, amount) => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    toast.error('Not authenticated.')
    return { data: null, error: 'not_authenticated' }
  }

  // Fetch product + seller profile (for UPI info)
  const { data: product } = await supabase
    .from('products')
    .select('id, seller_id, title')
    .eq('id', productId)
    .single()

  if (!product || product.seller_id !== user.id) {
    toast.error('Unauthorized action.')
    return { data: null, error: 'unauthorized' }
  }

  const { data: sellerProfile } = await supabase
    .from('profiles')
    .select('upi_id, upi_qr_url')
    .eq('id', user.id)
    .single()

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      product_id: productId,
      buyer_id: bidderId,
      seller_id: user.id,
      final_amount: amount,
      upi_id_shared: sellerProfile?.upi_id || null,
      upi_qr_shared: sellerProfile?.upi_qr_url || null,
      order_status: 'awaiting_payment',
      payment_status: 'pending',
    })
    .select()
    .single()

  if (orderError) {
    toast.error('Something went wrong, try again')
    return { data: null, error: orderError }
  }

  // Update product to sold
  await supabase
    .from('products')
    .update({ status: 'sold' })
    .eq('id', productId)

  // Notify buyer
  await supabase.from('notifications').insert({
    user_id: bidderId,
    type: 'bid_won',
    message: `Your bid of ₹${amount.toLocaleString('en-IN')} was accepted! Complete payment to proceed.`,
    related_product_id: productId,
    related_order_id: order.id,
  })

  toast.success('Bid accepted! Order created.')
  return { data: order, error: null }
}
