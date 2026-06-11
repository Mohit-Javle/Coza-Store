import React, { useRef } from 'react';
import { products } from '../../data/products';
import { users } from '../../data/users';
import ProductCard from '../ui/ProductCard';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const TopPickups = () => {
  const scrollRef = useRef(null);
  
  // Filter staffpick products
  const topPickups = products.filter(p => p.tags.includes('staffpick'));

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  // Stagger configurations for entering cards
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring",
        stiffness: 70,
        damping: 15
      }
    }
  };

  return (
    <section className="py-20 bg-[#0D0D0D] border-b border-[#1A1A1A] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Header with scroll controls */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <span className="font-space text-xs font-bold tracking-widest text-[#C8B8A2] uppercase block mb-1">
              CURATED HITS
            </span>
            <h2 className="font-bebas text-5xl md:text-6xl tracking-tight text-[#F5F0E8] uppercase">
              TODAY'S TOP PICKUPS
            </h2>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={scrollLeft}
              className="p-3 bg-[#1A1A1A] border border-[#2A2A2A] hover:bg-[#E8FF00] hover:text-black hover:border-transparent transition-all duration-200"
              aria-label="Scroll Left"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={scrollRight}
              className="p-3 bg-[#1A1A1A] border border-[#2A2A2A] hover:bg-[#E8FF00] hover:text-black hover:border-transparent transition-all duration-200"
              aria-label="Scroll Right"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Horizontal Scroll Area */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto no-scrollbar pb-6 snap-x snap-mandatory cursor-grab active:cursor-grabbing"
        >
          {topPickups.map((product) => {
            const seller = users.find(u => u.id === product.sellerId) || users[0];
            return (
              <motion.div 
                key={product.id}
                variants={cardVariants}
                className="w-[280px] sm:w-[320px] shrink-0 snap-start"
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

export default TopPickups;
