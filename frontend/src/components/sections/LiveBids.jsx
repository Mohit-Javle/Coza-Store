import React, { useState, useEffect } from 'react'
import { getLiveBids } from '../../lib/products'
import ProductCard from '../ui/ProductCard'
import { motion } from 'framer-motion'

const LiveBids = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLiveBids().then((data) => {
      setProducts(data.slice(0, 4))
      setLoading(false)
    })
  }, [])

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 15 } },
  }

  return (
    <section className="py-20 bg-black border-b border-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center gap-3 mb-12">
          <h2 className="font-bebas text-5xl md:text-6xl tracking-tight text-[#F5F0E8] uppercase flex items-center gap-4">
            LIVE BIDS
          </h2>
          <span className="relative flex h-5 w-5 mt-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75" />
            <span className="relative inline-flex rounded-full h-5 w-5 bg-red-600" />
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-96 bg-zinc-900 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="font-space text-sm text-zinc-600 uppercase text-center py-12">
            No live bids right now. Check back soon!
          </p>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {products.map((product) => (
              <motion.div key={product.id} variants={itemVariants}>
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

export default LiveBids
