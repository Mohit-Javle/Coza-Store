import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getBidsForProduct, placeBid } from '../../data/bids';
import { users } from '../../data/users';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Landmark, Check } from 'lucide-react';
import BidTimer from '../ui/BidTimer';

const BidSection = ({ productId, startingBid, currentBid, buyNowPrice, endsAt, isLive }) => {
  const { currentUser, isLoggedIn } = useAuth();
  const [bidsList, setBidsList] = useState([]);
  const [bidAmount, setBidAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Load bid history
  useEffect(() => {
    setBidsList(getBidsForProduct(productId));
  }, [productId]);

  const activeHighestBid = bidsList.length > 0 ? bidsList[0].amount : currentBid || startingBid;
  const minBidAllowed = activeHighestBid + 50; // bid increment of ₹50

  const handlePlaceBid = (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!isLoggedIn) {
      setError("You must be logged in to bid.");
      return;
    }

    const numericAmount = parseFloat(bidAmount);
    if (isNaN(numericAmount)) {
      setError("Please enter a valid amount.");
      return;
    }

    if (numericAmount < minBidAllowed) {
      setError(`Minimum bid must be ₹${minBidAllowed.toLocaleString('en-IN')}`);
      return;
    }

    // Place bid in mock db
    // TODO: API call to register bid in database (Supabase)
    const updatedBids = placeBid(productId, currentUser.id, numericAmount);
    setBidsList(updatedBids);
    setBidAmount('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleBuyNow = () => {
    if (!isLoggedIn) {
      alert("Please log in to purchase.");
      return;
    }
    // Simulate buy now
    alert(`⚡ INSTANT CHECKOUT DETECTED!\nItem purchased for ₹${buyNowPrice.toLocaleString('en-IN')}. Redirecting to invoice...`);
  };

  // Helper to find bidder usernames/avatars
  const getBidderInfo = (bidderId) => {
    return users.find(u => u.id === bidderId) || { username: 'anonymous', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop' };
  };

  return (
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-6 relative overflow-hidden">
      {/* Editorial layout element */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#E8FF00]/5 rounded-bl-full pointer-events-none" />

      {/* Title */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-800">
        <div>
          <span className="font-space text-xs text-zinc-500 uppercase tracking-wider block">AUCTION STATUS</span>
          <span className="font-bebas text-2xl tracking-wide text-[#F5F0E8]">
            {isLive ? "BIDDING CAMPAIGN LIVE" : "CAMPAIGN CLOSED"}
          </span>
        </div>
        {isLive && endsAt && (
          <BidTimer endTime={endsAt} />
        )}
      </div>

      {/* Bid Figures */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-black/40 p-4 border border-zinc-800">
          <span className="font-space text-xs text-zinc-500 uppercase">CURRENT HIGH BID</span>
          <motion.div 
            key={activeHighestBid}
            initial={{ scale: 0.9, color: "#FFFFFF" }}
            animate={{ scale: 1, color: "#E8FF00" }}
            transition={{ duration: 0.2 }}
            className="font-mono text-2xl font-black mt-1"
          >
            ₹{activeHighestBid.toLocaleString('en-IN')}
          </motion.div>
        </div>
        <div className="bg-black/40 p-4 border border-zinc-800">
          <span className="font-space text-xs text-zinc-500 uppercase">TOTAL BIDS</span>
          <div className="font-mono text-2xl font-black text-[#F5F0E8] mt-1">
            {bidsList.length}
          </div>
        </div>
      </div>

      {/* Bid Placement Form */}
      {isLive && (
        <form onSubmit={handlePlaceBid} className="mb-6">
          <div className="flex flex-col gap-2">
            <label className="font-space text-xs text-zinc-400 uppercase tracking-wider">
              Bid must be ₹{minBidAllowed.toLocaleString('en-IN')} or more
            </label>
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-sm">₹</span>
                <input
                  type="number"
                  placeholder={minBidAllowed}
                  value={bidAmount}
                  disabled={!isLoggedIn}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="w-full raw-input pl-8 pr-4 py-2.5 text-base font-mono disabled:opacity-50"
                />
              </div>
              <button
                type="submit"
                disabled={!isLoggedIn}
                className="raw-btn px-6 py-2.5 bg-[#E8FF00] hover:bg-[#F5F0E8] text-black font-bold tracking-widest text-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                PLACE BID
              </button>
            </div>
          </div>

          <AnimatePresence>
            {!isLoggedIn && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }} 
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-xs font-space text-zinc-500 flex items-center gap-1.5"
              >
                <AlertCircle size={14} className="text-zinc-500" />
                You must be logged in to bid on garments.
              </motion.div>
            )}

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }} 
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-xs font-space text-red-500 flex items-center gap-1.5 bg-red-950/20 border border-red-900/30 p-2"
              >
                <AlertCircle size={14} />
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }} 
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-xs font-space text-black bg-[#E8FF00] flex items-center gap-1.5 p-2 font-semibold"
              >
                <Check size={14} />
                Bid placed successfully! You are the highest bidder.
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      )}

      {/* Buy Now Button */}
      {buyNowPrice && (
        <button
          onClick={handleBuyNow}
          className="w-full raw-btn mb-6 py-3 border border-transparent bg-[#F5F0E8] text-black font-extrabold tracking-widest hover:bg-[#E8FF00] flex items-center justify-center gap-2 text-sm shadow-[4px_4px_0px_0px_rgba(200,184,162,0.3)] hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
        >
          <Landmark size={16} />
          INSTANT COPP NOW FOR ₹{buyNowPrice.toLocaleString('en-IN')}
        </button>
      )}

      {/* Bid History Log */}
      <div>
        <h4 className="font-bebas text-lg tracking-wider text-[#C8B8A2] mb-3 uppercase">
          BID HISTORY LOG
        </h4>
        
        {bidsList.length === 0 ? (
          <p className="font-space text-xs text-zinc-600 italic uppercase">No bids submitted yet. Be the first.</p>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {bidsList.slice(0, 5).map((bid, index) => {
              const bidder = getBidderInfo(bid.bidderId);
              return (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-2.5 border ${
                    index === 0 ? 'bg-black/50 border-[#E8FF00]/40' : 'bg-black/20 border-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <img 
                      src={bidder.avatar} 
                      alt={bidder.username}
                      className="w-6 h-6 rounded-none object-cover border border-zinc-700"
                    />
                    <span className="font-space text-xs text-[#F5F0E8]">
                      @{bidder.username}
                      {index === 0 && <span className="ml-1.5 text-[9px] bg-[#E8FF00] text-black px-1 font-bold">TOP</span>}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-sm font-bold text-[#F5F0E8]">₹{bid.amount.toLocaleString('en-IN')}</span>
                    <span className="block text-[8px] text-zinc-500 font-mono">
                      {new Date(bid.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default BidSection;
