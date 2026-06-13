import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Footer from '../components/ui/Footer'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Crown, Sparkles, TrendingUp, ShoppingBag, Award } from 'lucide-react'

const LeaderboardPage = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('sellers') // 'sellers' | 'buyers' | 'bidders'
  const [loading, setLoading] = useState(true)

  const [topSellers, setTopSellers] = useState([])
  const [topBuyers, setTopBuyers] = useState([])
  const [topBidders, setTopBidders] = useState([])

  useEffect(() => {
    window.scrollTo(0, 0)

    const loadData = async () => {
      setLoading(true)
      try {
        // Fetch all orders with profiles
        const { data: orders } = await supabase
          .from('orders')
          .select(`
            id, final_amount,
            seller:profiles!seller_id(username, full_name, avatar_url),
            buyer:profiles!buyer_id(username, full_name, avatar_url)
          `)

        // Fetch all bids with profiles
        const { data: bids } = await supabase
          .from('bids')
          .select(`
            id, amount,
            bidder:profiles!bidder_id(username, full_name, avatar_url)
          `)

        const ordersList = orders || []
        const bidsList = bids || []

        // Process Sellers
        const sellersMap = {}
        ordersList.forEach(order => {
          const seller = order.seller
          if (!seller) return
          const sId = order.seller.username // Group by username to handle duplicates
          if (!sellersMap[sId]) {
            sellersMap[sId] = {
              profile: seller,
              totalAmount: 0,
              count: 0
            }
          }
          sellersMap[sId].totalAmount += parseFloat(order.final_amount)
          sellersMap[sId].count += 1
        })
        const sellersResult = Object.values(sellersMap).sort((a, b) => b.totalAmount - a.totalAmount)
        setTopSellers(sellersResult)

        // Process Buyers
        const buyersMap = {}
        ordersList.forEach(order => {
          const buyer = order.buyer
          if (!buyer) return
          const bId = order.buyer.username
          if (!buyersMap[bId]) {
            buyersMap[bId] = {
              profile: buyer,
              totalAmount: 0,
              count: 0
            }
          }
          buyersMap[bId].totalAmount += parseFloat(order.final_amount)
          buyersMap[bId].count += 1
        })
        const buyersResult = Object.values(buyersMap).sort((a, b) => b.totalAmount - a.totalAmount)
        setTopBuyers(buyersResult)

        // Process Bidders
        const biddersMap = {}
        bidsList.forEach(bid => {
          const bidder = bid.bidder
          if (!bidder) return
          const bidUsername = bid.bidder.username
          if (!biddersMap[bidUsername]) {
            biddersMap[bidUsername] = {
              profile: bidder,
              totalAmount: 0, // Will represent highest bid
              count: 0
            }
          }
          biddersMap[bidUsername].count += 1
          if (bid.amount > biddersMap[bidUsername].totalAmount) {
            biddersMap[bidUsername].totalAmount = parseFloat(bid.amount)
          }
        })
        const biddersResult = Object.values(biddersMap).sort((a, b) => b.count - a.count)
        setTopBidders(biddersResult)

      } catch (err) {
        console.error('Error loading leaderboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const getRankBadge = (index) => {
    if (index === 0) return <Crown className="text-[#E8FF00]" size={20} />
    if (index === 1) return <Trophy className="text-zinc-400" size={18} />
    if (index === 2) return <Trophy className="text-amber-600" size={16} />
    return <span className="font-mono text-zinc-500 text-xs">#{index + 1}</span>
  }

  const getRankBg = (index) => {
    if (index === 0) return 'border-[#E8FF00] bg-[#E8FF00]/5 shadow-[0px_0px_15px_rgba(232,255,0,0.05)]'
    if (index === 1) return 'border-zinc-700 bg-zinc-800/10'
    if (index === 2) return 'border-zinc-800 bg-zinc-900/10'
    return 'border-zinc-900 bg-black/20 hover:border-zinc-800'
  }

  const listToRender = activeTab === 'sellers' ? topSellers : activeTab === 'buyers' ? topBuyers : topBidders

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full min-h-screen bg-[#0D0D0D] flex flex-col pt-24"
    >
      <div className="max-w-4xl mx-auto px-4 md:px-8 flex-grow w-full py-8">

        {/* Title */}
        <div className="text-center mb-10">
          <div className="flex justify-center items-center gap-2 mb-2">

            <span className="font-space text-xs font-bold tracking-widest text-[#C8B8A2] uppercase">
              HALL OF FAME
            </span>
          </div>
          <h1 className="font-bebas text-5xl md:text-6xl tracking-tight text-[#F5F0E8] uppercase">
            ARCHIVE LEADERBOARD
          </h1>
          <p className="font-space text-zinc-500 text-[10px] uppercase tracking-widest mt-2">
            The top collectors, sellers, and active bidders in the community
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-zinc-800 mb-8 justify-center font-bebas text-lg tracking-wider">
          <button
            onClick={() => setActiveTab('sellers')}
            className={`flex items-center gap-2 px-6 py-3.5 border-b-2 uppercase transition-all ${activeTab === 'sellers' ? 'border-[#E8FF00] text-[#E8FF00]' : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
          >
            <TrendingUp size={16} /> Top Sellers
          </button>
          <button
            onClick={() => setActiveTab('buyers')}
            className={`flex items-center gap-2 px-6 py-3.5 border-b-2 uppercase transition-all ${activeTab === 'buyers' ? 'border-[#E8FF00] text-[#E8FF00]' : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
          >
            <ShoppingBag size={16} /> Top Buyers
          </button>
          <button
            onClick={() => setActiveTab('bidders')}
            className={`flex items-center gap-2 px-6 py-3.5 border-b-2 uppercase transition-all ${activeTab === 'bidders' ? 'border-[#E8FF00] text-[#E8FF00]' : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
          >
            <Award size={16} /> Top Bidders
          </button>
        </div>

        {/* Leaderboard Listing */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-[#1A1A1A] border border-zinc-900 animate-pulse" />
            ))}
          </div>
        ) : listToRender.length === 0 ? (
          <div className="text-center py-16 bg-[#1A1A1A] border border-zinc-800">
            <Trophy size={32} className="text-zinc-700 mx-auto mb-3" />
            <p className="font-space text-xs text-zinc-500 uppercase italic">No ranking data recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {listToRender.map((user, idx) => (
                <motion.div
                  key={user.profile.username}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onClick={() => navigate(`/profile/${user.profile.username}`)}
                  className={`flex items-center justify-between p-4 border transition-all duration-300 cursor-pointer ${getRankBg(idx)}`}
                >
                  {/* Left Section: Rank + Avatar + Name */}
                  <div className="flex items-center gap-4">
                    <div className="w-8 flex items-center justify-center shrink-0">
                      {getRankBadge(idx)}
                    </div>

                    {/* Avatar */}
                    <div className="w-10 h-10 border border-zinc-800 bg-zinc-950 shrink-0 overflow-hidden relative">
                      {user.profile.avatar_url ? (
                        <img src={user.profile.avatar_url} alt={user.profile.username} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bebas text-lg text-zinc-600">
                          {user.profile.username?.[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Name/Username */}
                    <div>
                      <p className="font-bebas text-lg leading-tight text-[#F5F0E8]">
                        {user.profile.full_name || user.profile.username}
                      </p>
                      <span className="font-space text-[9px] text-zinc-500 block uppercase">
                        @{user.profile.username}
                      </span>
                    </div>
                  </div>

                  {/* Right Section: Stats */}
                  <div className="text-right">
                    {activeTab === 'sellers' && (
                      <>
                        <span className="font-mono text-base font-black text-[#E8FF00]">
                          ₹{user.totalAmount.toLocaleString('en-IN')}
                        </span>
                        <span className="block font-space text-[8px] text-zinc-500 uppercase tracking-wide mt-0.5">
                          {user.count} {user.count === 1 ? 'Sale' : 'Sales'}
                        </span>
                      </>
                    )}
                    {activeTab === 'buyers' && (
                      <>
                        <span className="font-mono text-base font-black text-[#E8FF00]">
                          ₹{user.totalAmount.toLocaleString('en-IN')}
                        </span>
                        <span className="block font-space text-[8px] text-zinc-500 uppercase tracking-wide mt-0.5">
                          {user.count} {user.count === 1 ? 'Item' : 'Items'} Copped
                        </span>
                      </>
                    )}
                    {activeTab === 'bidders' && (
                      <>
                        <span className="font-mono text-base font-black text-[#E8FF00]">
                          {user.count} {user.count === 1 ? 'Bid' : 'Bids'}
                        </span>
                        <span className="block font-space text-[8px] text-zinc-500 uppercase tracking-wide mt-0.5">
                          Highest: ₹{user.totalAmount.toLocaleString('en-IN')}
                        </span>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
      <Footer />
    </motion.div>
  )
}

export default LeaderboardPage
