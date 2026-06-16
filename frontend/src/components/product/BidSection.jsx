import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { placeBid, getBidHistory, acceptBid } from '../../lib/bids'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, Landmark, Flame, TrendingUp } from 'lucide-react'
import BidTimer from '../ui/BidTimer'
import toast from 'react-hot-toast'

const BidSection = ({ productId, startingBid, currentBid: initCurrentBid, buyNowPrice, endsAt, status, sellerId }) => {
  const { isLoggedIn, profile } = useAuth()
  const navigate = useNavigate()
  const [bidsList, setBidsList] = useState([])
  const [currentBid, setCurrentBid] = useState(initCurrentBid || startingBid)
  const [bidAmount, setBidAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingBids, setLoadingBids] = useState(true)
  const [confirmBid, setConfirmBid] = useState(null)
  const subRef = useRef(null)

  const isLive = status === 'active' && new Date(endsAt) > new Date()
  const minBid = (currentBid || startingBid) + 50
  const isOwnListing = isLoggedIn && profile?.id === sellerId

  // Load bid history
  useEffect(() => {
    const load = async () => {
      setLoadingBids(true)
      const data = await getBidHistory(productId)
      setBidsList(data)
      if (data.length > 0) setCurrentBid(data[0].amount)
      setLoadingBids(false)
    }
    load()
  }, [productId])

  // Realtime bid subscription
  useEffect(() => {
    subRef.current = supabase
      .channel(`bids:product:${productId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bids', filter: `product_id=eq.${productId}` },
        async (payload) => {
          // Fetch the full bid with bidder info
          const { data } = await supabase
            .from('bids')
            .select('*, bidder:profiles!bidder_id(id, username, avatar_url)')
            .eq('id', payload.new.id)
            .single()

          if (data) {
            setBidsList((prev) => [data, ...prev])
            setCurrentBid(data.amount)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subRef.current)
    }
  }, [productId])

  const handlePlaceBid = async (e) => {
    e.preventDefault()
    if (!isLoggedIn) {
      navigate('/auth')
      return
    }
    const numericAmount = parseFloat(bidAmount)
    if (isNaN(numericAmount)) {
      toast.error('Please enter a valid bid amount')
      return
    }
    if (numericAmount < minBid) {
      toast.error(`Your bid must be at least ₹${minBid.toLocaleString('en-IN')}`)
      return
    }

    setLoading(true)
    const { error } = await placeBid(productId, numericAmount)
    setLoading(false)
    if (!error) setBidAmount('')
  }

  const handleBuyNow = async () => {
    if (!isLoggedIn) {
      navigate('/auth')
      return
    }
    if (!profile?.id) return

    if (!window.confirm(`Are you sure you want to buy this item instantly for ₹${buyNowPrice.toLocaleString('en-IN')}?`)) {
      return
    }

    setLoading(true)
    try {
      const { data: orderId, error } = await supabase.rpc('buy_product_now', {
        p_id: productId,
        b_id: profile.id,
        amount: buyNowPrice
      })

      if (error) {
        toast.error(error.message || 'Purchase failed. Try again.')
      } else if (orderId) {
        toast.success('Instant purchase successful! 🔥')
        navigate(`/order/${orderId}`)
      }
    } catch (err) {
      console.error('Buy Now error:', err)
      toast.error('Purchase failed.')
    } finally {
      setLoading(false)
    }
  }


  const handleAcceptBid = async (bidderId, amount) => {
    setLoading(true)
    const { data: order, error } = await acceptBid(productId, bidderId, amount)
    setLoading(false)
    if (!error && order) {
      navigate(`/order/${order.id}`)
    }
  }

  return (
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#E8FF00]/5 rounded-bl-full pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-800">
        <div>
          <span className="font-space text-xs text-zinc-500 uppercase tracking-wider block">AUCTION STATUS</span>
          <span className="font-bebas text-2xl tracking-wide text-[#F5F0E8]">
            {isLive ? 'BIDDING CAMPAIGN LIVE' : 'CAMPAIGN CLOSED'}
          </span>
        </div>
        {isLive && endsAt && <BidTimer endTime={endsAt} />}
      </div>

      {/* Bid Figures */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-black/40 p-4 border border-zinc-800">
          <span className="font-space text-xs text-zinc-500 uppercase">CURRENT HIGH BID</span>
          <motion.div
            key={currentBid}
            initial={{ scale: 1.1, color: '#FFFFFF' }}
            animate={{ scale: 1, color: '#E8FF00' }}
            transition={{ duration: 0.3 }}
            className="font-mono text-2xl font-black mt-1"
          >
            ₹{(currentBid || startingBid).toLocaleString('en-IN')}
          </motion.div>
        </div>
        <div className="bg-black/40 p-4 border border-zinc-800">
          <span className="font-space text-xs text-zinc-500 uppercase">TOTAL BIDS</span>
          <motion.div
            key={bidsList.length}
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
            className="font-mono text-2xl font-black text-[#F5F0E8] mt-1"
          >
            {bidsList.length}
          </motion.div>
        </div>
      </div>

      {/* Bid Form */}
      {isLive && !isOwnListing && (
        <form onSubmit={handlePlaceBid} className="mb-6">
          <div className="flex flex-col gap-2">
            <label className="font-space text-xs text-zinc-400 uppercase tracking-wider">
              Bid must be ₹{minBid.toLocaleString('en-IN')} or more
            </label>
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-sm">₹</span>
                <input
                  type="number"
                  placeholder={minBid}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  min={minBid}
                  className="w-full raw-input pl-8 pr-4 py-2.5 text-base font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !bidAmount}
                className="raw-btn px-6 py-2.5 bg-[#E8FF00] hover:bg-[#F5F0E8] text-black font-bold tracking-widest text-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><TrendingUp size={14} /> BID</>
                )}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {!isLoggedIn && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3 text-xs font-space text-zinc-500 flex items-center gap-1.5"
              >
                <AlertCircle size={14} className="text-zinc-500" />
                <button type="button" onClick={() => navigate('/auth')} className="text-[#E8FF00] hover:underline">
                  Log in
                </button>
                &nbsp;to bid on this garment.
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      )}

      {isOwnListing && isLive && (
        <div className="mb-6 p-3 bg-zinc-900 border border-zinc-800 font-space text-xs text-zinc-500 uppercase tracking-wider">
          This is your listing — you cannot bid on your own item.
        </div>
      )}

      {/* Buy Now */}
      {buyNowPrice && isLive && !isOwnListing && (
        <button
          onClick={handleBuyNow}
          disabled={loading}
          className="w-full raw-btn mb-6 py-3 border border-transparent bg-[#F5F0E8] text-black font-extrabold tracking-widest hover:bg-[#E8FF00] flex items-center justify-center gap-2 text-sm shadow-[4px_4px_0px_0px_rgba(200,184,162,0.3)] hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
        >
          <Landmark size={16} />
          INSTANT COPP FOR ₹{buyNowPrice.toLocaleString('en-IN')}
        </button>
      )}

      {/* Bid History */}
      <div>
        <h4 className="font-bebas text-lg tracking-wider text-[#C8B8A2] mb-3 uppercase flex items-center gap-2">
          <Flame size={16} className="text-[#E8FF00]" /> BID HISTORY LOG
        </h4>

        {loadingBids ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-zinc-900 animate-pulse" />
            ))}
          </div>
        ) : bidsList.length === 0 ? (
          <p className="font-space text-xs text-zinc-600 italic uppercase">No bids yet. Be the first.</p>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {bidsList.slice(0, 8).map((bid, index) => (
                <motion.div
                  key={bid.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center justify-between p-2.5 border ${
                    index === 0 ? 'bg-black/50 border-[#E8FF00]/40' : 'bg-black/20 border-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {bid.bidder?.avatar_url ? (
                      <img
                        src={bid.bidder.avatar_url}
                        alt={bid.bidder.username}
                        className="w-6 h-6 object-cover border border-zinc-700"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[9px] font-bold text-zinc-500">
                        {bid.bidder?.username?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <span className="font-space text-xs text-[#F5F0E8]">
                      @{bid.bidder?.username || 'anonymous'}
                      {index === 0 && <span className="ml-1.5 text-[9px] bg-[#E8FF00] text-black px-1 font-bold">TOP</span>}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="font-mono text-sm font-bold text-[#F5F0E8]">₹{bid.amount.toLocaleString('en-IN')}</span>
                      <span className="block text-[8px] text-zinc-500 font-mono">
                        {new Date(bid.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {isOwnListing && isLive && (
                      <button
                        onClick={() => setConfirmBid({
                          bidderId: bid.bidder_id,
                          amount: bid.amount,
                          bidderName: bid.bidder?.username || 'anonymous'
                        })}
                        disabled={loading}
                        className="px-2.5 py-1 bg-[#E8FF00] hover:bg-[#F5F0E8] text-black text-[10px] font-extrabold tracking-wider uppercase transition-colors disabled:opacity-50"
                      >
                        Accept
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {confirmBid && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmBid(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            
            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-[#1A1A1A] border-2 border-[#E8FF00] p-6 shadow-[8px_8px_0px_rgba(232,255,0,0.1)] z-10 text-center"
            >
              {/* Yellow accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#E8FF00]" />
              
              <h3 className="font-bebas text-3xl tracking-wide text-[#F5F0E8] mb-3 uppercase">
                CLOSE AUCTION?
              </h3>
              
              <p className="font-space text-xs text-zinc-400 uppercase tracking-wider mb-6 leading-relaxed">
                Are you sure you want to accept the bid of <span className="text-[#E8FF00] font-mono font-bold">₹{confirmBid.amount.toLocaleString('en-IN')}</span> from <span className="text-white">@{confirmBid.bidderName}</span>? This will close the auction and generate the order.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmBid(null)}
                  className="flex-grow raw-btn py-2.5 bg-zinc-800 text-zinc-400 hover:text-white font-space text-xs uppercase tracking-widest transition-colors"
                >
                  CANCEL
                </button>
                <button
                  onClick={async () => {
                    const { bidderId, amount } = confirmBid
                    setConfirmBid(null)
                    await handleAcceptBid(bidderId, amount)
                  }}
                  className="flex-grow raw-btn py-2.5 bg-[#E8FF00] hover:bg-[#F5F0E8] text-black font-extrabold font-space text-xs uppercase tracking-widest transition-colors shadow-[2px_2px_0px_rgba(255,255,255,1)]"
                >
                  ACCEPT
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default BidSection
