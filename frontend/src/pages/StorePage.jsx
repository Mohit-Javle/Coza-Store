import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getActiveProducts } from '../lib/products';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ui/ProductCard';
import Footer from '../components/ui/Footer';
import { motion } from 'framer-motion';
import { SlidersHorizontal, ArrowUpDown, RefreshCw, X, Users, MapPin } from 'lucide-react';

const StorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchWord = searchParams.get('search') || '';
  const typeParam = searchParams.get('type') || 'fits';

  // Local state for filters
  const [searchQuery, setSearchQuery] = useState(searchWord);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [minCondition, setMinCondition] = useState(0);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [sortBy, setSortBy] = useState('newest');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Real data state
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef(null);

  // Search Type: 'fits' | 'collectors'
  const [searchType, setSearchType] = useState(typeParam === 'collectors' ? 'collectors' : 'fits');
  const [profiles, setProfiles] = useState([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const navigate = useNavigate();

  const fetchProfiles = useCallback(async () => {
    setLoadingProfiles(true);
    const q = searchQuery.trim().toLowerCase();
    let query = supabase.from('profiles').select('*');
    if (q) {
      query = query.or(`username.ilike.%${q}%,full_name.ilike.%${q}%,location.ilike.%${q}%,bio.ilike.%${q}%`);
    }
    const { data, error } = await query.order('created_at', { ascending: false }).limit(24);
    if (!error) {
      setProfiles(data || []);
    } else {
      setProfiles([]);
    }
    setLoadingProfiles(false);
  }, [searchQuery]);

  const categories = ['All', 'Tops', 'Bottoms', 'Shoes', 'Accessories'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'US 9', 'UK 7', 'US 10', '32', '34'];

  // Sync searchQuery state with URL search param
  useEffect(() => {
    setSearchQuery(searchWord);
  }, [searchWord]);

  // Sync searchType state with URL type param
  useEffect(() => {
    setSearchType(typeParam === 'collectors' ? 'collectors' : 'fits');
  }, [typeParam]);

  // Fetch products from Supabase with filters (debounced)
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const filters = {
      sortBy: sortBy === 'newest' ? 'newest' : sortBy === 'price-low-high' ? 'price_low' : sortBy === 'price-high-low' ? 'price_high' : 'most_bids',
      maxPrice: maxPrice < 50000 ? maxPrice : undefined,
      condition: minCondition > 0 ? minCondition : undefined,
    };
    if (selectedCategory !== 'All') filters.category = selectedCategory.toLowerCase();
    const data = await getActiveProducts(filters);
    // Client-side search filter (brand/title/desc)
    const q = searchQuery.trim().toLowerCase();
    const filtered = q
      ? data.filter(
          (p) =>
            p.title?.toLowerCase().includes(q) ||
            p.brand?.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q)
        )
      : data;
    // Client-side size filter
    const sizeFiltered = selectedSizes.length > 0
      ? filtered.filter((p) => selectedSizes.includes(p.size))
      : filtered;
    setProducts(sizeFiltered);
    setLoading(false);
  }, [selectedCategory, selectedSizes, minCondition, maxPrice, sortBy, searchQuery]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (searchType === 'fits') {
      debounceRef.current = setTimeout(fetchProducts, 300);
    } else {
      debounceRef.current = setTimeout(fetchProfiles, 300);
    }
    return () => clearTimeout(debounceRef.current);
  }, [searchType, fetchProducts, fetchProfiles]);

  const toggleSize = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedSizes([]);
    setMinCondition(0);
    setMaxPrice(50000);
    setSortBy('newest');
    setSearchQuery('');
    setSearchParams({});
  };

  // Stagger entry configurations
  const gridVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.05 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 85, damping: 14 } },
  };

  const getGridSpan = (index) => {
    if (index === 0 || index === 5) {
      return 'col-span-1 md:col-span-2 row-span-1 aspect-[16/10] sm:aspect-square md:aspect-[1.5/1]';
    }
    return 'col-span-1 aspect-[3/4]';
  };

  const sortedProducts = products; // Already sorted by Supabase

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
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-[#222] pb-8 mb-6">
          <div>
            <span className="font-space text-xs font-bold tracking-widest text-[#C8B8A2] uppercase block mb-1">
              ARCHIVE STOCK
            </span>
            <h1 className="font-bebas text-5xl md:text-7xl tracking-tighter text-[#F5F0E8] uppercase">
              {searchType === 'fits' ? `BROWSE DECK (${loading ? '...' : sortedProducts.length})` : `COLLECTORS (${loadingProfiles ? '...' : profiles.length})`}
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:max-w-xl">
            {/* Search */}
            <input
              type="text"
              placeholder={searchType === 'fits' ? "SEARCH BRAND, GARMENT..." : "SEARCH USERNAME, BIO, LOCATION..."}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                const params = {};
                if (e.target.value) params.search = e.target.value;
                if (searchType === 'collectors') params.type = 'collectors';
                setSearchParams(params);
              }}
              className="raw-input px-4 py-2.5 text-xs font-space uppercase bg-black border-[#333] flex-grow"
            />
            {/* Sorting (only visible for fits) */}
            {searchType === 'fits' && (
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
            )}
          </div>
        </div>

        {/* Toggle between Fits and Collectors */}
        <div className="flex gap-4 border-b border-zinc-800 pb-4 mb-8">
          <button
            onClick={() => {
              setSearchType('fits');
              const params = {};
              if (searchQuery) params.search = searchQuery;
              setSearchParams(params);
            }}
            className={`font-bebas text-xl tracking-wider px-6 py-2 border transition-all ${
              searchType === 'fits'
                ? 'bg-[#E8FF00] text-black border-transparent font-bold'
                : 'text-zinc-500 hover:text-zinc-300 border-transparent'
            }`}
          >
            FITS / PRODUCTS
          </button>
          <button
            onClick={() => {
              setSearchType('collectors');
              const params = { type: 'collectors' };
              if (searchQuery) params.search = searchQuery;
              setSearchParams(params);
            }}
            className={`font-bebas text-xl tracking-wider px-6 py-2 border transition-all ${
              searchType === 'collectors'
                ? 'bg-[#E8FF00] text-black border-transparent font-bold'
                : 'text-zinc-500 hover:text-zinc-300 border-transparent'
            }`}
          >
            COLLECTORS / PROFILES
          </button>
        </div>

        {/* Layout: Sidebar + Grid */}
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Filters Column: Desktop Sidebar */}
          {searchType === 'fits' && (
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
                <span className="font-mono text-xs text-[#E8FF00]">₹{maxPrice >= 50000 ? 'Any' : maxPrice.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="500"
                max="50000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                className="w-full accent-[#E8FF00] bg-zinc-800 h-1 outline-none"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-1">
                <span>₹500</span>
                <span>₹50,000+</span>
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
          )}

          {/* Mobile Filters Toggle Button */}
          {searchType === 'fits' && (
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
          )}

          {/* Product Grid Area */}
          <div className="flex-grow">
            {searchType === 'fits' ? (
              loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="aspect-[3/4] bg-zinc-900 animate-pulse" />
                  ))}
                </div>
              ) : sortedProducts.length === 0 ? (
                <div className="text-center py-24 border border-dashed border-zinc-800 bg-zinc-950/20">
                  <span className="font-bebas text-4xl block text-[#C8B8A2] tracking-wider mb-2">ARCHIVE DRY</span>
                  <p className="font-space text-zinc-500 text-sm max-w-sm mx-auto uppercase">
                    No streetwear components matched your filters. Try resetting.
                  </p>
                  <button onClick={resetFilters} className="raw-btn bg-[#F5F0E8] text-black px-6 py-2 mt-6 font-bold tracking-widest text-xs">
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
                  {sortedProducts.map((product, idx) => (
                    <motion.div key={product.id} variants={cardVariants} className={getGridSpan(idx)}>
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
              )
            ) : (
              loadingProfiles ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="aspect-[1.2/1] bg-zinc-900 animate-pulse" />
                  ))}
                </div>
              ) : profiles.length === 0 ? (
                <div className="text-center py-24 border border-dashed border-zinc-800 bg-zinc-950/20">
                  <span className="font-bebas text-4xl block text-[#C8B8A2] tracking-wider mb-2">NO COLLECTORS FOUND</span>
                  <p className="font-space text-zinc-500 text-sm max-w-sm mx-auto uppercase">
                    We couldn't find any user profiles matching "{searchQuery}".
                  </p>
                </div>
              ) : (
                <motion.div
                  variants={gridVariants}
                  initial="hidden"
                  animate="visible"
                  key={profiles.length}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {profiles.map((p) => (
                    <motion.div
                      key={p.id}
                      variants={cardVariants}
                      className="border border-[#2a2a2a] bg-[#1a1a1a] p-5 flex flex-col justify-between hover:border-[#E8FF00] transition-colors relative"
                    >
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="w-16 h-16 bg-zinc-800 border border-[#333] shrink-0 overflow-hidden flex items-center justify-center font-bebas text-3xl text-zinc-400">
                          {p.avatar_url ? (
                            <img src={p.avatar_url} alt={p.username} className="w-full h-full object-cover" />
                          ) : (
                            p.username?.[0]?.toUpperCase()
                          )}
                        </div>
                        
                        {/* User details */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-bebas text-lg tracking-wide text-white uppercase truncate">
                              {p.full_name || p.username}
                            </h4>
                            {p.role !== 'user' && (
                              <span className="font-space text-[8px] bg-[#E8FF00] text-black px-1.5 py-0.2 uppercase font-bold">
                                {p.role}
                              </span>
                            )}
                          </div>
                          <p className="font-space text-zinc-500 text-[10px] uppercase truncate">@{p.username}</p>
                          
                          {p.location && (
                            <div className="flex items-center gap-1 font-space text-[9px] text-zinc-400 uppercase mt-1">
                              <MapPin size={10} className="text-[#E8FF00]" />
                              <span>{p.location}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {p.bio && (
                        <p className="font-space text-zinc-400 text-xs mt-4 line-clamp-2 uppercase">
                          {p.bio}
                        </p>
                      )}

                      <button
                        onClick={() => navigate(`/profile/${p.username}`)}
                        className="raw-btn bg-transparent border border-zinc-700 hover:border-[#E8FF00] hover:text-black hover:bg-[#E8FF00] text-white py-2 w-full text-center font-space text-[10px] font-bold tracking-widest uppercase mt-6 transition-all"
                      >
                        VIEW COLLECTOR
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              ))}
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
                <span className="font-mono text-xs text-[#E8FF00]">₹{maxPrice >= 50000 ? 'Any' : maxPrice.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="500"
                max="50000"
                step="500"
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
