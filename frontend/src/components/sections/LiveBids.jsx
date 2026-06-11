import React from 'react';
import { products } from '../../data/products';
import { users } from '../../data/users';
import ProductCard from '../ui/ProductCard';
import { motion } from 'framer-motion';

const LiveBids = () => {
  // Filter live products (limit to first 4 for display layout clean-ness, or show more)
  const liveProducts = products.filter(p => p.isLive).slice(0, 4);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 15
      }
    }
  };

  return (
    <section className="py-20 bg-black border-b border-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Heading */}
        <div className="flex items-center gap-3 mb-12">
          <h2 className="font-bebas text-5xl md:text-6xl tracking-tight text-[#F5F0E8] uppercase flex items-center gap-4">
            LIVE BIDS
          </h2>
          <span className="relative flex h-5 w-5 mt-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-red-600"></span>
          </span>
        </div>

        {/* Product Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {liveProducts.map((product) => {
            const seller = users.find(u => u.id === product.sellerId) || users[0];
            return (
              <motion.div 
                key={product.id}
                variants={itemVariants}
              >
                <ProductCard 
                  id={product.id}
                  image={product.images[0]}
                  brand={product.brand}
                  title={product.title}
                  currentBid={product.currentBid}
                  conditionRating={product.condition}
                  sellerUsername={seller.username}
                  isLiveBid={product.isLive}
                  isBuyNow={!!product.buyNowPrice}
                  endTime={product.endsAt}
                />
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
};

export default LiveBids;
