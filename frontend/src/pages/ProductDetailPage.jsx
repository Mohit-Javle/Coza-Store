import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getProductById } from '../lib/products'
import ImageGallery from '../components/product/ImageGallery'
import BidSection from '../components/product/BidSection'
import QnAThread from '../components/product/QnAThread'
import Footer from '../components/ui/Footer'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Tag, Box, Scale, Star, Percent } from 'lucide-react'

const conditionMap = { 1: 'Thrashed', 2: 'Heavy Wear', 3: 'Good', 4: 'Excellent', 5: 'Deadstock' }

const ProductDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    const load = async () => {
      setLoading(true)
      const data = await getProductById(id)
      setProduct(data)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#0D0D0D] flex items-center justify-center pt-24">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#E8FF00] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <span className="font-bebas text-xl text-zinc-600 tracking-widest">LOADING ARCHIVE...</span>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="w-full min-h-screen bg-[#0D0D0D] flex flex-col justify-center items-center text-center p-6 pt-24">
        <h2 className="font-bebas text-5xl text-red-500 mb-4">GARMENT ARCHIVE DRIED</h2>
        <p className="font-space text-zinc-400 mb-8 max-w-sm uppercase">
          The fit ID you requested does not exist in our vaults.
        </p>
        <button
          onClick={() => navigate('/store')}
          className="raw-btn bg-[#E8FF00] text-black px-6 py-3 text-xs font-bold tracking-widest uppercase"
        >
          BACK TO STORE
        </button>
      </div>
    )
  }

  const seller = product.seller

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full min-h-screen bg-[#0D0D0D] flex flex-col pt-24"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex-grow w-full py-8">

        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 font-space text-xs text-zinc-400 hover:text-[#E8FF00] transition-colors mb-8 uppercase tracking-wider"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to list
        </button>

        {/* Badges */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {product.is_staff_pick && (
            <span className="flex items-center gap-1 px-2 py-1 bg-[#E8FF00] text-black text-[10px] font-bold uppercase tracking-wider font-space">
              <Star size={10} /> STAFF PICK
            </span>
          )}
          {product.discount_percent > 0 && (
            <span className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider font-space">
              <Percent size={10} /> {product.discount_tag || `${product.discount_percent}% OFF`}
            </span>
          )}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* Images */}
          <div className="lg:col-span-5">
            <ImageGallery images={product.images || []} hasBill={product.has_bill} />
          </div>

          {/* Details */}
          <div className="lg:col-span-7 flex flex-col gap-6">

            {/* Brand & Title */}
            <div>
              <span className="font-bebas text-lg md:text-xl tracking-widest text-[#C8B8A2] uppercase block mb-1">
                {product.brand}
              </span>
              <h1 className="font-bebas text-4xl sm:text-5xl md:text-6xl tracking-tight leading-none text-[#F5F0E8] uppercase">
                {product.title}
              </h1>
            </div>

            {/* Seller chip */}
            {seller && (
              <div className="flex items-center gap-3 p-3 bg-[#1A1A1A] border border-[#2A2A2A] w-fit">
                {seller.avatar_url ? (
                  <img src={seller.avatar_url} alt={seller.username} className="w-10 h-10 object-cover border border-zinc-700" />
                ) : (
                  <div className="w-10 h-10 bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bebas text-lg text-zinc-400">
                    {seller.username?.[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <span className="font-space text-[10px] text-zinc-500 uppercase block leading-none mb-1">SELLER ARCHIVE</span>
                  <Link
                    to={`/profile/${seller.username}`}
                    className="font-space text-sm font-bold text-[#F5F0E8] hover:text-[#E8FF00] transition-colors leading-none"
                  >
                    @{seller.username}
                  </Link>
                  {seller.location && (
                    <span className="flex items-center gap-1 font-space text-[9px] text-zinc-600 mt-0.5">
                      <MapPin size={9} /> {seller.location}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Specs */}
            <div className="grid grid-cols-3 gap-2 border-t border-b border-zinc-800 py-4 font-space text-xs">
              <div className="flex items-center gap-2">
                <Box size={16} className="text-[#C8B8A2]" />
                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase">SIZE</span>
                  <span className="font-mono font-bold uppercase">{product.size}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Scale size={16} className="text-[#C8B8A2]" />
                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase">GENDER</span>
                  <span className="font-bold uppercase">{product.gender}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-[#C8B8A2]" />
                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase">ORIGINAL BILL</span>
                  <span className="font-bold uppercase">{product.has_bill ? 'AVAILABLE' : 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Condition */}
            {product.condition && (
              <div className="flex items-center gap-3">
                <span className="font-space text-xs text-zinc-500 uppercase">CONDITION:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`w-6 h-2 ${i <= product.condition ? 'bg-[#E8FF00]' : 'bg-zinc-800'}`}
                    />
                  ))}
                </div>
                <span className="font-space text-xs text-zinc-400">{conditionMap[product.condition]}</span>
              </div>
            )}

            {/* Description */}
            <div>
              <h4 className="font-bebas text-lg tracking-wider text-[#C8B8A2] mb-2 uppercase">
                ITEM ARCHIVE DIALOGUE
              </h4>
              <p className="font-space text-zinc-400 text-sm leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Bid Section */}
            <BidSection
              productId={product.id}
              startingBid={product.starting_bid}
              currentBid={product.current_bid}
              buyNowPrice={product.buy_now_price}
              endsAt={product.bid_ends_at}
              status={product.status}
              sellerId={product.seller_id}
            />

            {/* Q&A Thread */}
            <QnAThread productId={product.id} sellerId={product.seller_id} />
          </div>
        </div>
      </div>

      <Footer />
    </motion.div>
  )
}

export default ProductDetailPage
