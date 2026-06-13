import React, { useState, useEffect } from 'react'
import { getFreshDrops } from '../../lib/products'
import ProductCard from '../ui/ProductCard'
import { motion } from 'framer-motion'

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 15 } },
}

const FreshDrops = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getFreshDrops().then((data) => {
      setProducts(data)
      setLoading(false)
    })
  }, [])

  return (
    <section className="py-20 bg-[#0D0D0D] border-b border-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="mb-12">
          <span className="font-space text-xs font-bold tracking-widest text-[#C8B8A2] uppercase block mb-1">
            LATEST ARRIVALS
          </span>
          <h2 className="font-bebas text-5xl md:text-6xl tracking-tight text-[#F5F0E8] uppercase">
            FRESH DROPS
          </h2>
        </div>

        {loading ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="break-inside-avoid inline-block w-full h-80 bg-zinc-900 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="font-space text-sm text-zinc-600 uppercase text-center py-12">
            No drops yet — be the first to list something!
          </p>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            transition={{ staggerChildren: 0.08 }}
            className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6"
          >
            {products.map((product) => (
              <motion.div key={product.id} variants={itemVariants} className="break-inside-avoid inline-block w-full">
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

export default FreshDrops
