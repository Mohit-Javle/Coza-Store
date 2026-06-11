import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { products } from '../data/products';
import { users } from '../data/users';
import ImageGallery from '../components/product/ImageGallery';
import BidSection from '../components/product/BidSection';
import QnAThread from '../components/product/QnAThread';
import Footer from '../components/ui/Footer';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Tag, Box, Scale } from 'lucide-react';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Find product by id
  const product = products.find(p => p.id === id);

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
    );
  }

  // Find seller info
  const seller = users.find(u => u.id === product.sellerId) || users[0];

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

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Side: Images */}
          <div className="lg:col-span-5">
            <ImageGallery images={product.images} hasBill={product.hasBill} />
          </div>

          {/* Right Side: Details & Bidding */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Header: Brand & Title */}
            <div>
              <span className="font-bebas text-lg md:text-xl tracking-widest text-[#C8B8A2] uppercase block mb-1">
                {product.brand}
              </span>
              <h1 className="font-bebas text-4xl sm:text-5xl md:text-6xl tracking-tight leading-none text-[#F5F0E8] uppercase">
                {product.title}
              </h1>
            </div>

            {/* Seller profile chip */}
            <div className="flex items-center gap-3 p-3 bg-[#1A1A1A] border border-[#2A2A2A] w-fit">
              <img
                src={seller.avatar}
                alt={seller.username}
                className="w-10 h-10 object-cover border border-zinc-700"
              />
              <div>
                <span className="font-space text-[10px] text-zinc-500 uppercase block leading-none mb-1">
                  SELLER ARCHIVE
                </span>
                <Link
                  to={`/profile/${seller.username}`}
                  className="font-space text-sm font-bold text-[#F5F0E8] hover:text-[#E8FF00] transition-colors leading-none"
                >
                  @{seller.username}
                </Link>
              </div>
            </div>

            {/* Product Specifications */}
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
                  <span className="font-bold uppercase">{product.hasBill ? "AVAILABLE" : "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Item Description */}
            <div>
              <h4 className="font-bebas text-lg tracking-wider text-[#C8B8A2] mb-2 uppercase">
                ITEM ARCHIVE DIALOGUE
              </h4>
              <p className="font-space text-zinc-400 text-sm leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Bidding Core Component */}
            <BidSection
              productId={product.id}
              startingBid={product.startingBid}
              currentBid={product.currentBid}
              buyNowPrice={product.buyNowPrice}
              endsAt={product.endsAt}
              isLive={product.isLive}
            />

            {/* Q&A Thread component */}
            <QnAThread productId={product.id} />

          </div>

        </div>

      </div>

      {/* Footer */}
      <Footer />
    </motion.div>
  );
};

export default ProductDetailPage;
