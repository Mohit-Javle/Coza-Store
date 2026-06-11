import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { products } from '../data/products';
import { users } from '../data/users';
import ProductCard from '../components/ui/ProductCard';
import Footer from '../components/ui/Footer';
import { motion } from 'framer-motion';
import { SlidersHorizontal, ArrowUpDown, RefreshCw, X } from 'lucide-react';

const StorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchWord = searchParams.get('search') || '';

  // Local state for filters
  const [searchQuery, setSearchQuery] = useState(searchWord);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [minCondition, setMinCondition] = useState(0);
  const [maxPrice, setMaxPrice] = useState(15000);
  const [sortBy, setSortBy] = useState('newest');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Sync searchQuery state with URL search param
  useEffect(() => {
    setSearchQuery(searchWord);
  }, [searchWord]);

  // Extract unique brands for filtering list
  const allBrands = [...new Set(products.map(p => p.brand))];
  const categories = ['All', 'Tops', 'Bottoms', 'Shoes', 'Accessories'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'US 9', 'UK 7', 'US 10', '32', '34'];

  // Handle multi-select filters
  const toggleSize = (size) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const toggleBrand = (brand) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedSizes([]);
    setSelectedBrands([]);
    setMinCondition(0);
    setMaxPrice(15000);
    setSortBy('newest');
    setSearchQuery('');
    setSearchParams({});
  };

  // Filter products logic
  const filteredProducts = products.filter((product) => {
    // Search filter
    const matchesSearch = searchQuery.trim() === '' || 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;

    // Size filter
    const matchesSize = selectedSizes.length === 0 || selectedSizes.includes(product.size);

    // Brand filter
    const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand);

    // Condition filter
    const matchesCondition = product.condition >= minCondition;

    // Price filter
    const currentPrice = product.currentBid || product.startingBid;
    const matchesPrice = currentPrice <= maxPrice;

    return matchesSearch && matchesCategory && matchesSize && matchesBrand && matchesCondition && matchesPrice;
  });

  // Sorting logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.listedAt) - new Date(a.listedAt);
    }
    if (sortBy === 'price-low-high') {
      const priceA = a.currentBid || a.startingBid;
      const priceB = b.currentBid || b.startingBid;
      return priceA - priceB;
    }
    if (sortBy === 'price-high-low') {
      const priceA = a.currentBid || a.startingBid;
      const priceB = b.currentBid || b.startingBid;
      return priceB - priceA;
    }
    if (sortBy === 'most-bids') {
      return b.bidsCount - a.bidsCount;
    }
    return 0;
  });

  // Stagger entry configurations
  const gridVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 85, damping: 14 }
    }
  };

  // Helper to determine asymmetric grid spans
  const getGridSpan = (index) => {
    // Design a few double wide slots for asymmetric editorial grids
    // Cards at index 0 and 5 will span 2 columns on desktop
    if (index === 0 || index === 5) {
      return "col-span-1 md:col-span-2 row-span-1 aspect-[16/10] sm:aspect-square md:aspect-[1.5/1]";
    }
    return "col-span-1 aspect-[3/4]";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full min-h-screen bg-[#0D0D0D] flex flex-col pt-24"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex-grow w-full py-8">
        
        {/* Page Title & Search Bar */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-[#222] pb-8 mb-10">
          <div>
            <span className="font-space text-xs font-bold tracking-widest text-[#C8B8A2] uppercase block mb-1">
              ARCHIVE STOCK
            </span>
            <h1 className="font-bebas text-5xl md:text-7xl tracking-tighter text-[#F5F0E8] uppercase">
              BROWSE DECK ({sortedProducts.length})
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:max-w-xl">
            {/* Search */}
            <input
              type="text"
              placeholder="SEARCH BRAND, GARMENT..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchParams(e.target.value ? { search: e.target.value } : {});
              }}
              className="raw-input px-4 py-2.5 text-xs font-space uppercase bg-black border-[#333] flex-grow"
            />
            {/* Sorting */}
            <div className="relative shrink-0">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                <ArrowUpDown size={14} />
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="raw-input pl-9 pr-6 py-2.5 text-xs font-space uppercase bg-black border-[#333] appearance-none"
              >
                <option value="newest">NEWEST ARRIVALS</option>
                <option value="price-low-high">PRICE: LOW TO HIGH</option>
                <option value="price-high-low">PRICE: HIGH TO LOW</option>
                <option value="most-bids">MOST ACTIVE BIDS</option>
              </select>
            </div>
          </div>
        </div>

        {/* Layout: Sidebar + Grid */}
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Filters Column: Desktop Sidebar */}
          <aside className="hidden md:block w-64 shrink-0 space-y-8">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
              <span className="font-bebas text-xl tracking-wider text-[#F5F0E8] flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-[#E8FF00]" />
                FILTER SUITE
              </span>
              <button 
                onClick={resetFilters} 
                className="text-zinc-500 hover:text-[#E8FF00] font-space text-[10px] uppercase tracking-wider flex items-center gap-1"
              >
                <RefreshCw size={10} />
                RESET
              </button>
            </div>

            {/* Categories */}
            <div>
              <h4 className="font-bebas text-sm tracking-widest text-[#C8B8A2] uppercase mb-3">CATEGORY</h4>
              <div className="flex flex-col gap-1.5 font-space text-xs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-left py-1 px-2 border transition-all ${
                      selectedCategory === cat
                        ? 'bg-[#E8FF00] text-black border-transparent font-bold'
                        : 'text-zinc-400 border-transparent hover:text-[#F5F0E8] hover:bg-zinc-900/40'
                    }`}
                  >
                    {cat.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Slider */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bebas text-sm tracking-widest text-[#C8B8A2] uppercase">BUDGET CAPS</h4>
                <span className="font-mono text-xs text-[#E8FF00]">₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min="400"
                max="15000"
                step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                className="w-full accent-[#E8FF00] bg-zinc-800 h-1 outline-none"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-1">
                <span>₹400</span>
                <span>₹15,000+</span>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h4 className="font-bebas text-sm tracking-widest text-[#C8B8A2] uppercase mb-3">SIZE TAG</h4>
              <div className="flex flex-wrap gap-1.5">
                {sizes.map((size) => {
                  const isSelected = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`px-3 py-1 font-mono text-[10px] border transition-all ${
                        isSelected
                          ? 'bg-[#E8FF00] text-black border-[#E8FF00] font-bold'
                          : 'border-zinc-800 text-zinc-400 hover:border-[#C8B8A2] hover:text-[#F5F0E8]'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Brands */}
            <div>
              <h4 className="font-bebas text-sm tracking-widest text-[#C8B8A2] uppercase mb-3">LABELS</h4>
              <div className="flex flex-wrap gap-1.5">
                {allBrands.map((brand) => {
                  const isSelected = selectedBrands.includes(brand);
                  return (
                    <button
                      key={brand}
                      onClick={() => toggleBrand(brand)}
                      className={`px-2.5 py-1 font-space text-[10px] border tracking-wider transition-all uppercase ${
                        isSelected
                          ? 'bg-[#E8FF00] text-black border-[#E8FF00] font-bold'
                          : 'border-zinc-800 text-zinc-400 hover:border-[#C8B8A2] hover:text-[#F5F0E8]'
                      }`}
                    >
                      {brand}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Condition Rating Slider */}
            <div>
              <h4 className="font-bebas text-sm tracking-widest text-[#C8B8A2] uppercase mb-3">MIN CONDITION</h4>
              <div className="grid grid-cols-5 border border-zinc-800">
                {[1, 2, 3, 4, 5].map((rating) => {
                  const isActive = minCondition === rating;
                  return (
                    <button
                      key={rating}
                      onClick={() => setMinCondition(minCondition === rating ? 0 : rating)}
                      className={`py-2 font-bebas text-center text-xs border-r border-zinc-800 last:border-r-0 transition-colors ${
                        isActive || (minCondition > 0 && rating <= minCondition)
                          ? 'bg-[#E8FF00] text-black font-bold'
                          : 'text-zinc-500 hover:bg-zinc-900/30'
                      }`}
                    >
                      {rating}
                    </button>
                  );
                })}
              </div>
              <span className="block text-[10px] text-zinc-500 font-space mt-1.5 uppercase text-right">
                {minCondition === 0 ? "Any condition" : minCondition === 1 ? "Beat & up" : minCondition === 2 ? "Worn & up" : minCondition === 3 ? "Good & up" : minCondition === 4 ? "Great & up" : "Mint only"}
              </span>
            </div>
          </aside>

          {/* Mobile Filters Toggle Button */}
          <div className="md:hidden flex justify-between items-center mb-4">
            <button
              onClick={() => setShowFiltersMobile(true)}
              className="flex items-center gap-2 px-4 py-2 border border-zinc-800 font-space text-xs uppercase"
            >
              <SlidersHorizontal size={14} />
              Open Filter Suite
            </button>
            <button 
              onClick={resetFilters}
              className="text-zinc-500 hover:text-[#E8FF00] font-space text-[10px] uppercase"
            >
              Reset Filters
            </button>
          </div>

          {/* Product Grid Area */}
          <div className="flex-grow">
            {sortedProducts.length === 0 ? (
              <div className="text-center py-24 border border-dashed border-zinc-800 bg-zinc-950/20">
                <span className="font-bebas text-4xl block text-[#C8B8A2] tracking-wider mb-2">ARCHIVE DRY</span>
                <p className="font-space text-zinc-500 text-sm max-w-sm mx-auto uppercase">
                  No streetwear components matched your filter layout. Try resetting fields or lowering condition.
                </p>
                <button
                  onClick={resetFilters}
                  className="raw-btn bg-[#F5F0E8] text-black px-6 py-2 mt-6 font-bold tracking-widest text-xs"
                >
                  RESET FILTERS
                </button>
              </div>
            ) : (
              <motion.div
                variants={gridVariants}
                initial="hidden"
                animate="visible"
                key={sortedProducts.length + sortBy + selectedCategory}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {sortedProducts.map((product, idx) => {
                  const seller = users.find(u => u.id === product.sellerId) || users[0];
                  return (
                    <motion.div
                      key={product.id}
                      variants={cardVariants}
                      className={getGridSpan(idx)}
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
            )}
          </div>

        </div>

      </div>

      {/* Mobile Filters Drawer Overlay */}
      {showFiltersMobile && (
        <div className="fixed inset-0 z-50 flex justify-end md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowFiltersMobile(false)}
          />
          {/* Drawer content */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="relative w-80 max-w-full bg-[#1A1A1A] h-full overflow-y-auto p-6 z-10 border-l border-zinc-800 flex flex-col gap-6"
          >
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
              <span className="font-bebas text-2xl tracking-wider text-[#F5F0E8]">FILTERS</span>
              <button 
                onClick={() => setShowFiltersMobile(false)}
                className="p-1 hover:text-[#E8FF00]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Category */}
            <div>
              <h4 className="font-bebas text-sm tracking-widest text-[#C8B8A2] uppercase mb-2">CATEGORY</h4>
              <div className="grid grid-cols-3 gap-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`py-1.5 text-center text-[10px] font-space uppercase border transition-all ${
                      selectedCategory === cat
                        ? 'bg-[#E8FF00] text-black border-transparent font-bold'
                        : 'text-zinc-400 border-zinc-800 hover:text-[#F5F0E8] bg-black/30'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bebas text-sm tracking-widest text-[#C8B8A2] uppercase">BUDGET CAPS</h4>
                <span className="font-mono text-xs text-[#E8FF00]">₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min="400"
                max="15000"
                step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                className="w-full accent-[#E8FF00] bg-zinc-800 h-1"
              />
            </div>

            {/* Sizes */}
            <div>
              <h4 className="font-bebas text-sm tracking-widest text-[#C8B8A2] uppercase mb-2">SIZING</h4>
              <div className="flex flex-wrap gap-1">
                {sizes.map((size) => {
                  const isSelected = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`px-2.5 py-1 font-mono text-[9px] border transition-all ${
                        isSelected
                          ? 'bg-[#E8FF00] text-black border-[#E8FF00] font-bold'
                          : 'border-zinc-800 text-zinc-400 hover:border-[#C8B8A2] bg-black/30'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Condition */}
            <div>
              <h4 className="font-bebas text-sm tracking-widest text-[#C8B8A2] uppercase mb-2">CONDITION</h4>
              <div className="grid grid-cols-5 border border-zinc-800">
                {[1, 2, 3, 4, 5].map((rating) => {
                  const isActive = minCondition === rating;
                  return (
                    <button
                      key={rating}
                      onClick={() => setMinCondition(minCondition === rating ? 0 : rating)}
                      className={`py-2 font-bebas text-center text-xs border-r border-zinc-800 last:border-r-0 ${
                        isActive || (minCondition > 0 && rating <= minCondition)
                          ? 'bg-[#E8FF00] text-black font-bold'
                          : 'text-zinc-500 bg-black/30'
                      }`}
                    >
                      {rating}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setShowFiltersMobile(false)}
              className="w-full raw-btn py-3 bg-[#E8FF00] text-black font-bold tracking-widest text-xs uppercase mt-auto"
            >
              APPLY FILTERS
            </button>
          </motion.div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </motion.div>
  );
};

export default StorePage;
