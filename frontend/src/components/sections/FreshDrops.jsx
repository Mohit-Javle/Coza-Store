import React from 'react';
import { products } from '../../data/products';
import { users } from '../../data/users';
import ProductCard from '../ui/ProductCard';
import { motion } from 'framer-motion';

const FreshDrops = () => {
  // Sort products by listed date (newest first)
  const freshDrops = [...products]
    .sort((a, b) => new Date(b.listedAt) - new Date(a.listedAt))
    .slice(0, 8); // Display 8 fresh drops

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
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
    <section className="py-20 bg-[#0D0D0D] border-b border-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Heading */}
        <div className="mb-12">
          <span className="font-space text-xs font-bold tracking-widest text-[#C8B8A2] uppercase block mb-1">
            LATEST ARRIVALS
          </span>
          <h2 className="font-bebas text-5xl md:text-6xl tracking-tight text-[#F5F0E8] uppercase">
            FRESH DROPS
          </h2>
        </div>

        {/* Masonry CSS Column Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6"
        >
          {freshDrops.map((product) => {
            const seller = users.find(u => u.id === product.sellerId) || users[0];
            return (
              <motion.div 
                key={product.id}
                variants={itemVariants}
                className="break-inside-avoid inline-block w-full"
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

export default FreshDrops;
