import { supabase } from './supabase'
import toast from 'react-hot-toast'

// ── Get Order By ID ──────────────────────────────────────────
export const getOrderById = async (id) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      product:products(id, title, images, brand),
      buyer:profiles!buyer_id(id, username, avatar_url),
      seller:profiles!seller_id(id, username, avatar_url, upi_id, upi_qr_url)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('getOrderById error:', error)
    return null
  }
  return data
}

// ── Get Order By Product ─────────────────────────────────────
export const getOrderByProduct = async (productId) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      product:products(id, title, images),
      buyer:profiles!buyer_id(id, username, avatar_url),
      seller:profiles!seller_id(id, username, avatar_url)
    `)
    .eq('product_id', productId)
    .maybeSingle()

  if (error) {
    console.error('getOrderByProduct error:', error)
    return null
  }
  return data
}

// ── Get User Orders (as buyer and seller) ─────────────────────
export const getUserOrders = async (userId) => {
  const { data: buyerOrders, error: buyerError } = await supabase
    .from('orders')
    .select(`
      *,
      product:products(id, title, images, brand),
      seller:profiles!seller_id(id, username, avatar_url)
    `)
    .eq('buyer_id', userId)
    .order('created_at', { ascending: false })

  const { data: sellerOrders, error: sellerError } = await supabase
    .from('orders')
    .select(`
      *,
      product:products(id, title, images, brand),
      buyer:profiles!buyer_id(id, username, avatar_url)
    `)
    .eq('seller_id', userId)
    .order('created_at', { ascending: false })

  return {
    asBuyer: buyerOrders || [],
    asSeller: sellerOrders || [],
    error: buyerError || sellerError || null,
  }
}

// ── Confirm Payment (buyer action) ───────────────────────────
export const confirmPayment = async (orderId) => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    toast.error('Not authenticated.')
    return { error: 'not_authenticated' }
  }

  const { data: order } = await supabase
    .from('orders')
    .select('seller_id, product_id, final_amount')
    .eq('id', orderId)
    .eq('buyer_id', user.id)
    .single()

  if (!order) {
    toast.error('Order not found or unauthorized.')
    return { error: 'not_found' }
  }

  const { error } = await supabase
    .from('orders')
    .update({
      buyer_confirmed_payment: true,
      payment_status: 'paid',
      order_status: 'payment_confirmed',
    })
    .eq('id', orderId)
    .eq('buyer_id', user.id)

  if (error) {
    toast.error('Something went wrong, try again')
    return { error }
  }

  // Notify seller
  await supabase.from('notifications').insert({
    user_id: order.seller_id,
    type: 'payment_confirmed',
    message: `Buyer confirmed payment of ₹${order.final_amount.toLocaleString('en-IN')}! Please ship the item.`,
    related_order_id: orderId,
    related_product_id: order.product_id,
  })

  toast.success('Payment confirmed ✅')
  return { error: null }
}

// ── Confirm Shipment (seller action) ─────────────────────────
export const confirmShipment = async (orderId, trackingInfo) => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    toast.error('Not authenticated.')
    return { error: 'not_authenticated' }
  }

  const { data: order } = await supabase
    .from('orders')
    .select('buyer_id, product_id')
    .eq('id', orderId)
    .eq('seller_id', user.id)
    .single()

  if (!order) {
    toast.error('Order not found or unauthorized.')
    return { error: 'not_found' }
  }

  const { error } = await supabase
    .from('orders')
    .update({
      seller_confirmed_shipment: true,
      order_status: 'shipped',
      tracking_info: trackingInfo || null,
    })
    .eq('id', orderId)
    .eq('seller_id', user.id)

  if (error) {
    toast.error('Something went wrong, try again')
    return { error }
  }

  // Notify buyer
  await supabase.from('notifications').insert({
    user_id: order.buyer_id,
    type: 'item_shipped',
    message: trackingInfo
      ? `Your item has been shipped! Tracking: ${trackingInfo}`
      : `Your item has been shipped! Check your order for updates.`,
    related_order_id: orderId,
    related_product_id: order.product_id,
  })

  toast.success('Shipment confirmed! Buyer notified.')
  return { error: null }
}

// ── Confirm Delivery (buyer action) ──────────────────────────
export const confirmDelivery = async (orderId) => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    toast.error('Not authenticated.')
    return { error: 'not_authenticated' }
  }

  const { error } = await supabase
    .from('orders')
    .update({ order_status: 'delivered' })
    .eq('id', orderId)
    .eq('buyer_id', user.id)

  if (error) {
    toast.error('Something went wrong, try again')
    return { error }
  }

  toast.success('Delivery confirmed! Enjoy your fit 🔥')
  return { error: null }
}

// ── Raise Dispute ─────────────────────────────────────────────
export const raiseDispute = async (orderId) => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    toast.error('Not authenticated.')
    return { error: 'not_authenticated' }
  }

  const { data: order } = await supabase
    .from('orders')
    .select('buyer_id, seller_id, product_id')
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .eq('id', orderId)
    .single()

  if (!order) {
    toast.error('Order not found or unauthorized.')
    return { error: 'not_found' }
  }

  const { error } = await supabase
    .from('orders')
    .update({ order_status: 'disputed' })
    .eq('id', orderId)

  if (error) {
    toast.error('Something went wrong, try again')
    return { error }
  }

  toast.success('Dispute raised. Admin has been notified.')
  return { error: null }
}
