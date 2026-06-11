import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ConditionBadge from './ConditionBadge';
import BidTimer from './BidTimer';

const ProductCard = ({ 
  id,
  image, 
  brand, 
  title, 
  currentBid, 
  conditionRating, 
  sellerUsername, 
  isLiveBid, 
  isBuyNow,
  endTime 
}) => {
  return (
    <motion.div
      whileHover={{ 
        scale: 1.015,
        rotateX: 3, 
        rotateY: -3,
        z: 10
      }}
      style={{ transformStyle: "preserve-3d" }}
      className="group relative bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F0E8] overflow-hidden flex flex-col h-full"
    >
      <Link to={`/product/${id}`} className="block relative w-full aspect-[3/4] overflow-hidden bg-black">
        {/* Grayscale to Color hover image */}
        <img 
          src={image} 
          alt={`${brand} ${title}`}
          className="w-full h-full object-cover image-grayscale-to-color"
        />

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none" />

        {/* Top-Right Badge: Live Bid status or Timer */}
        {isLiveBid && endTime && (
          <div className="absolute top-3 right-3 z-10">
            <BidTimer endTime={endTime} />
          </div>
        )}

        {/* Top-Left Badge: Staff Pick or Hot */}
        {!isLiveBid && isBuyNow && (
          <div className="absolute top-3 left-3 z-10 font-bebas text-xs tracking-wider bg-[#E8FF00] text-black px-2 py-0.5">
            BUY NOW
          </div>
        )}

        {/* Condition Badge Bottom-Left */}
        <div className="absolute bottom-3 left-3 z-10">
          <ConditionBadge rating={conditionRating} />
        </div>
      </Link>

      {/* Card Details */}
      <div className="p-4 flex flex-col flex-grow justify-between border-t border-[#2A2A2A]">
        <div>
          {/* Brand */}
          <span className="font-bebas text-sm tracking-widest text-[#C8B8A2] uppercase block mb-0.5">
            {brand}
          </span>
          
          {/* Title */}
          <Link to={`/product/${id}`}>
            <h3 className="font-space font-semibold text-base leading-tight group-hover:text-[#E8FF00] transition-colors duration-200 line-clamp-1">
              {title}
            </h3>
          </Link>
          
          {/* Seller Handle */}
          <Link to={`/profile/${sellerUsername}`} className="inline-block mt-1 font-space text-xs text-zinc-500 hover:text-[#C8B8A2] transition-colors">
            @{sellerUsername}
          </Link>
        </div>

        {/* Bid section */}
        <div className="mt-4 pt-3 border-t border-[#262626] flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] tracking-wider text-zinc-500 uppercase font-space">
              {isLiveBid ? "Current Bid" : "Starting Bid"}
            </span>
            <span className="font-mono text-lg font-bold text-[#E8FF00]">
              ₹{currentBid?.toLocaleString('en-IN') || '0'}
            </span>
          </div>

          <Link 
            to={`/product/${id}`} 
            className="raw-btn px-4 py-1.5 bg-[#F5F0E8] text-black text-sm font-bold tracking-wider hover:bg-[#E8FF00] hover:text-black border border-transparent shadow-[3px_3px_0px_0px_rgba(200,184,162,0.3)] hover:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]"
          >
            {isLiveBid ? "PLACE BID" : "VIEW FIT"}
          </Link>
        </div>
      </div>
      
      {/* Bottom accent border indicator */}
      <div className="h-1 w-full bg-transparent group-hover:bg-[#E8FF00] transition-colors duration-300" />
    </motion.div>
  );
};

export default ProductCard;
