import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ProfileGrid = ({ items = [] }) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 border border-[#222] bg-[#111]">
        <p className="font-space text-zinc-500 uppercase tracking-widest text-sm">No items found in this section</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1 md:gap-3">
      {items.map((item) => (
        <motion.div
          key={item.id}
          whileHover={{ scale: 0.99 }}
          className="relative aspect-square w-full bg-zinc-950 border border-zinc-900 overflow-hidden group"
        >
          <Link to={`/product/${item.id}`} className="block w-full h-full">
            {/* Product Image */}
            <img
              src={item.images[0]}
              alt={item.title}
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
            />

            {/* Dark Overlay (hidden by default, reveals on hover) */}
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <span className="font-bebas text-xs tracking-widest text-[#C8B8A2] uppercase block mb-1">
                {item.brand}
              </span>
              <h4 className="font-space font-bold text-[#F5F0E8] text-xs md:text-sm max-w-[90%] truncate">
                {item.title}
              </h4>
              
              <div className="mt-2 flex flex-col items-center">
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-space">
                  {item.isLive ? "Highest Bid" : "Listed Price"}
                </span>
                <span className="font-mono text-sm md:text-base font-bold text-[#E8FF00]">
                  ₹{item.currentBid?.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Status Indicator */}
              {item.isLive && (
                <span className="absolute top-2 right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                </span>
              )}
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
};

export default ProfileGrid;
