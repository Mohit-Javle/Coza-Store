import React, { useRef, useState, useEffect } from 'react'
import { getTopPickups } from '../../lib/products'
import ProductCard from '../ui/ProductCard'
import { motion } from 'framer-motion'
import { ChevronRight, ChevronLeft, Star } from 'lucide-react'

const cardVariants = {
  hidden: { opacity: 0, x: 100 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 70, damping: 15 } },
}

const TopPickups = () => {
  const scrollRef = useRef(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTopPickups().then((data) => {
      setProducts(data)
      setLoading(false)
    })
  }, [])

  const scrollLeft = () => scrollRef.current?.scrollBy({ left: -320, behavior: 'smooth' })
  const scrollRight = () => scrollRef.current?.scrollBy({ left: 320, behavior: 'smooth' })

  return (
    <section className="py-20 bg-[#0D0D0D] border-b border-[#1A1A1A] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
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
            <button onClick={scrollLeft} className="p-3 bg-[#1A1A1A] border border-[#2A2A2A] hover:bg-[#E8FF00] hover:text-black hover:border-transparent transition-all duration-200" aria-label="Scroll Left">
              <ChevronLeft size={20} />
            </button>
            <button onClick={scrollRight} className="p-3 bg-[#1A1A1A] border border-[#2A2A2A] hover:bg-[#E8FF00] hover:text-black hover:border-transparent transition-all duration-200" aria-label="Scroll Right">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-[280px] sm:w-[320px] shrink-0 h-96 bg-zinc-900 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <Star size={32} className="text-zinc-700 mx-auto mb-3" />
            <p className="font-space text-sm text-zinc-600 uppercase">No staff picks yet. Check back soon!</p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            transition={{ staggerChildren: 0.15 }}
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto no-scrollbar pb-6 snap-x snap-mandatory cursor-grab active:cursor-grabbing"
          >
            {products.map((product) => (
              <motion.div key={product.id} variants={cardVariants} className="w-[280px] sm:w-[320px] shrink-0 snap-start">
                <ProductCard
                  id={product.id}
                  image={product.images?.[0]}
                  brand={product.brand}
                  title={product.title}
                  currentBid={product.current_bid || product.starting_bid}
                  conditionRating={product.condition}
                  sellerUsername={product.seller?.username}
                  isLiveBid={product.status === 'active'}
                  isBuyNow={!!product.buy_now_price}
                  endTime={product.bid_ends_at}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}

export default TopPickups
