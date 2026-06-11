import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { products } from '../data/products';
import { users } from '../data/users';
import ConditionBadge from '../components/ui/ConditionBadge';
import Footer from '../components/ui/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, ArrowLeft, ArrowRight, Check, ShieldCheck, HelpCircle } from 'lucide-react';

const SellPage = () => {
  const { currentUser, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  // Route protection
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/auth?redirect=sell');
    }
  }, [isLoggedIn, navigate]);

  // Wizard state
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

  // Form inputs state
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Tops');
  const [size, setSize] = useState('M');
  const [gender, setGender] = useState('Unisex');
  const [condition, setCondition] = useState(4);
  const [description, setDescription] = useState('');
  const [hasTags, setHasTags] = useState(false);
  
  // UI states (simulated uploads)
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [uploadedBill, setUploadedBill] = useState(null);
  
  const [startBid, setStartBid] = useState('');
  const [buyNowPrice, setBuyNowPrice] = useState('');
  const [duration, setDuration] = useState('7'); // '3' | '7' | '14'
  
  const [showToast, setShowToast] = useState(false);

  // Form navigation helpers
  const nextStep = () => {
    if (step < 3) {
      setDirection(1);
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setDirection(-1);
      setStep(prev => prev - 1);
    }
  };

  // Simulating image upload selection
  const handlePhotoSelect = (e) => {
    const defaultStreetwearImgs = [
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517423568366-8b83523034fd?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=600&auto=format&fit=crop"
    ];
    // Push one of the high quality mockup images
    const nextImgIdx = uploadedPhotos.length % defaultStreetwearImgs.length;
    setUploadedPhotos(prev => [...prev, defaultStreetwearImgs[nextImgIdx]]);
  };

  const handleBillSelect = () => {
    setUploadedBill("receipt_verified_id_440.pdf");
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    // Simulate listing creation in local database
    // TODO: API call to create product in Supabase
    const newProduct = {
      id: `p${products.length + 1}`,
      title: title || "Stark Archival Fit",
      brand: brand || "Street Label",
      category,
      size,
      gender,
      condition,
      description: description || "Pre-loved heavy street piece.",
      images: uploadedPhotos.length > 0 ? uploadedPhotos : ["https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=600&auto=format&fit=crop"],
      hasBill: !!uploadedBill,
      startingBid: parseFloat(startBid) || 500,
      currentBid: parseFloat(startBid) || 500,
      buyNowPrice: buyNowPrice ? parseFloat(buyNowPrice) : null,
      bidsCount: 0,
      sellerId: currentUser?.id || "u1",
      listedAt: new Date().toISOString().split('T')[0],
      endsAt: new Date(Date.now() + parseInt(duration) * 24 * 60 * 60 * 1000).toISOString(),
      isLive: true,
      tags: []
    };

    products.push(newProduct);
    
    // Append to currentUser's listedItems
    if (currentUser) {
      currentUser.listedItems.push(newProduct.id);
      const userIdx = users.findIndex(u => u.id === currentUser.id);
      if (userIdx !== -1) {
        users[userIdx].listedItems.push(newProduct.id);
      }
    }

    setShowToast(true);
    
    setTimeout(() => {
      setShowToast(false);
      navigate(`/profile/${currentUser?.username}`);
    }, 2000);
  };

  // Condition labels
  const conditionLabels = {
    1: "BEAT (HEAVILY WORN / DISTRESSED)",
    2: "WORN (SOME FAINT MARKS / SCUFFS)",
    3: "GOOD (USED BUT WELL CARED FOR)",
    4: "GREAT (MINIMAL SIGNS OF WEAR)",
    5: "MINT (LIKE NEW / DEADSTOCK)"
  };

  // Framer Motion slide variants
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeInOut' }
    },
    exit: (direction) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      transition: { duration: 0.3, ease: 'easeInOut' }
    })
  };

  if (!isLoggedIn) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full min-h-screen bg-[#0D0D0D] flex flex-col pt-24"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex-grow w-full py-8 max-w-4xl">
        
        {/* Title */}
        <div className="text-center mb-8">
          <span className="font-space text-xs font-bold tracking-widest text-[#C8B8A2] uppercase block mb-1">
            FIT LAUNCHER
          </span>
          <h1 className="font-bebas text-5xl md:text-6xl tracking-tight text-[#F5F0E8] uppercase">
            LIST YOUR GARMENTS
          </h1>
          
          {/* Progress Indicators */}
          <div className="mt-8 max-w-md mx-auto">
            <div className="flex justify-between font-bebas text-sm tracking-wider text-zinc-500 mb-2">
              <span className={step >= 1 ? 'text-[#E8FF00]' : ''}>1. BASICS</span>
              <span className={step >= 2 ? 'text-[#E8FF00]' : ''}>2. CONDITION</span>
              <span className={step >= 3 ? 'text-[#E8FF00]' : ''}>3. AUCTION DETAILS</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-1 bg-[#1A1A1A] border border-zinc-800">
              <div 
                className="h-full bg-[#E8FF00] transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Wizard Form */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-6 md:p-8 min-h-[400px] flex flex-col justify-between shadow-xl relative overflow-hidden">
          
          {/* Subtle noise grain background layout details */}
          <div className="absolute top-0 left-0 w-full h-1 bg-[#E8FF00]" />

          <form onSubmit={handleFormSubmit} className="flex-grow flex flex-col justify-between">
            <div className="relative overflow-hidden">
              <AnimatePresence initial={false} mode="wait" custom={direction}>
                {step === 1 && (
                  <motion.div
                    key="step1"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="space-y-6"
                  >
                    <h3 className="font-bebas text-2xl tracking-wider text-[#C8B8A2] uppercase border-b border-zinc-800 pb-2">
                      STEP 1 — GARMENT PHOTOS & BASICS
                    </h3>

                    {/* Photos Upload Slots */}
                    <div>
                      <span className="block font-space text-xs text-zinc-400 uppercase tracking-wider mb-2">
                        Upload Fit Photos (Max 4, mock selection)
                      </span>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {/* Selected Previews */}
                        {uploadedPhotos.map((photo, idx) => (
                          <div key={idx} className="relative aspect-[3/4] border-2 border-zinc-700 bg-black group">
                            <img src={photo} alt="Upload preview" className="w-full h-full object-cover" />
                            <button 
                              type="button" 
                              onClick={() => setUploadedPhotos(prev => prev.filter((_, i) => i !== idx))}
                              className="absolute top-1 right-1 bg-black text-[#F5F0E8] border border-zinc-700 w-5 h-5 flex items-center justify-center font-bold text-xs hover:bg-red-600 transition-colors"
                            >
                              X
                            </button>
                          </div>
                        ))}

                        {/* Upload Button Box */}
                        {uploadedPhotos.length < 4 && (
                          <button
                            type="button"
                            onClick={handlePhotoSelect}
                            className="aspect-[3/4] border-2 border-dashed border-zinc-800 bg-black hover:border-[#E8FF00] flex flex-col items-center justify-center text-center p-3 transition-colors"
                          >
                            <Upload size={24} className="text-zinc-600 mb-2 group-hover:text-[#E8FF00]" />
                            <span className="font-space text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                              DRAG & DROP
                            </span>
                            <span className="font-space text-[8px] text-zinc-700 uppercase">
                              (CLICK MOCK)
                            </span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Title & Brand inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-space text-xs text-zinc-400 uppercase">ITEM NAME / TITLE</label>
                        <input
                          type="text"
                          required
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="raw-input px-3 py-2 text-xs uppercase"
                          placeholder="e.g. vintage oversized plaid shirt"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-space text-xs text-zinc-400 uppercase">BRAND / LABEL</label>
                        <input
                          type="text"
                          required
                          value={brand}
                          onChange={(e) => setBrand(e.target.value)}
                          className="raw-input px-3 py-2 text-xs uppercase"
                          placeholder="e.g. Ralph Lauren"
                        />
                      </div>
                    </div>

                    {/* Category, Size & Gender */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-space text-xs text-zinc-400 uppercase">CATEGORY</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="raw-input px-3 py-2 text-xs uppercase appearance-none"
                        >
                          <option>Tops</option>
                          <option>Bottoms</option>
                          <option>Shoes</option>
                          <option>Accessories</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-space text-xs text-zinc-400 uppercase">SIZE (TAGGED)</label>
                        <input
                          type="text"
                          required
                          value={size}
                          onChange={(e) => setSize(e.target.value)}
                          className="raw-input px-3 py-2 text-xs uppercase"
                          placeholder="e.g. L, 32, US 10"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-space text-xs text-zinc-400 uppercase">GENDER / CUT</label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="raw-input px-3 py-2 text-xs uppercase appearance-none"
                        >
                          <option>Unisex</option>
                          <option>Men</option>
                          <option>Women</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="space-y-6"
                  >
                    <h3 className="font-bebas text-2xl tracking-wider text-[#C8B8A2] uppercase border-b border-zinc-800 pb-2">
                      STEP 2 — CONDITION & ARCHIVE DETAILS
                    </h3>

                    {/* Condition Visual Selector */}
                    <div>
                      <label className="font-space text-xs text-zinc-400 uppercase block mb-3">
                        Condition Rating (Streetwear Index)
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => setCondition(rating)}
                            className={`p-3 border font-bebas text-center transition-all ${
                              condition === rating
                                ? 'bg-[#E8FF00] text-black border-transparent font-bold scale-95 shadow-[2px_2px_0px_rgba(255,255,255,1)]'
                                : 'bg-black/30 text-zinc-500 border-zinc-850 hover:border-[#C8B8A2]'
                            }`}
                          >
                            <span className="block text-lg font-bold leading-none mb-1">{rating}</span>
                            <span className="block text-[9px] tracking-wide font-normal">
                              {rating === 1 ? 'BEAT' : rating === 2 ? 'WORN' : rating === 3 ? 'GOOD' : rating === 4 ? 'GREAT' : 'MINT'}
                            </span>
                          </button>
                        ))}
                      </div>
                      <span className="block font-space text-[10px] text-[#C8B8A2] uppercase mt-2">
                        SELECTED INDEX: {conditionLabels[condition]}
                      </span>
                    </div>

                    {/* Description Text */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-space text-xs text-zinc-400 uppercase">DESCRIPTION / STORY</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="raw-input px-3 py-2 text-xs h-28"
                        placeholder="Tell the community about history, scuffs, color fades, fit details, where it was thrifted..."
                      />
                    </div>

                    {/* Bill verification slots & toggles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-zinc-800">
                      
                      {/* Bill slot */}
                      <div>
                        <span className="block font-space text-xs text-zinc-400 uppercase mb-2">Original Purchase Invoice (Optional)</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleBillSelect}
                            className={`px-4 py-2 border border-dashed text-xs font-space uppercase transition-colors shrink-0 ${
                              uploadedBill ? 'border-[#E8FF00] text-[#E8FF00]' : 'border-zinc-800 hover:border-zinc-600'
                            }`}
                          >
                            {uploadedBill ? "BILL ATTACHED" : "UPLOAD BILL (MOCK)"}
                          </button>
                          
                          {uploadedBill && (
                            <div className="flex items-center gap-1 text-[10px] font-space text-[#E8FF00] bg-[#E8FF00]/5 border border-[#E8FF00]/20 px-2 py-1 uppercase">
                              <ShieldCheck size={12} />
                              Verified Badge Unlocked
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Tag Switch Toggle */}
                      <div className="flex items-center justify-between sm:justify-start sm:gap-4 pt-4 sm:pt-0">
                        <span className="font-space text-xs text-zinc-400 uppercase">HAS ORIGINAL STORE TAGS?</span>
                        <button
                          type="button"
                          onClick={() => setHasTags(!hasTags)}
                          className={`w-12 h-6 flex items-center p-1 rounded-none border transition-colors ${
                            hasTags ? 'bg-[#E8FF00] border-transparent' : 'bg-black border-zinc-800'
                          }`}
                        >
                          <div 
                            className={`w-4 h-4 rounded-none transition-transform ${
                              hasTags ? 'translate-x-6 bg-black' : 'bg-zinc-600'
                            }`}
                          />
                        </button>
                      </div>

                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="space-y-6"
                  >
                    <h3 className="font-bebas text-2xl tracking-wider text-[#C8B8A2] uppercase border-b border-zinc-800 pb-2">
                      STEP 3 — PRICING & BID LIFECYCLE
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Price input settings */}
                      <div className="space-y-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-space text-xs text-zinc-400 uppercase">STARTING BID PRICE (INR)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 font-mono text-xs">₹</span>
                            <input
                              type="number"
                              required
                              value={startBid}
                              onChange={(e) => setStartBid(e.target.value)}
                              className="w-full raw-input pl-8 pr-3 py-2 text-xs font-mono"
                              placeholder="450"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-space text-xs text-zinc-400 uppercase">BUY NOW PRICE (OPTIONAL, INR)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 font-mono text-xs">₹</span>
                            <input
                              type="number"
                              value={buyNowPrice}
                              onChange={(e) => setBuyNowPrice(e.target.value)}
                              className="w-full raw-input pl-8 pr-3 py-2 text-xs font-mono"
                              placeholder="1200"
                            />
                          </div>
                        </div>

                        {/* Duration Buttons Selector */}
                        <div>
                          <label className="font-space text-xs text-zinc-400 uppercase block mb-2">Campaign Lifespan (Days)</label>
                          <div className="grid grid-cols-3 gap-2">
                            {['3', '7', '14'].map((days) => (
                              <button
                                key={days}
                                type="button"
                                onClick={() => setDuration(days)}
                                className={`py-2 text-center border font-space text-xs font-bold transition-all ${
                                  duration === days
                                    ? 'bg-[#E8FF00] text-black border-transparent'
                                    : 'bg-black/30 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                                }`}
                              >
                                {days} DAYS
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Item Preview Card */}
                      <div className="border border-zinc-800 bg-black/40 p-4">
                        <span className="font-space text-[10px] tracking-widest text-zinc-500 uppercase block mb-3">LIVE LISTING CARD PREVIEW</span>
                        <div className="max-w-[240px] mx-auto scale-95 border border-[#2a2a2a] bg-[#1a1a1a]">
                          {/* Image Box */}
                          <div className="relative aspect-[3/4] bg-zinc-950 flex items-center justify-center">
                            {uploadedPhotos.length > 0 ? (
                              <img src={uploadedPhotos[0]} alt="preview item" className="w-full h-full object-cover" />
                            ) : (
                              <span className="font-space text-[9px] text-zinc-700 uppercase font-bold tracking-widest">FIT PHOTO SLOT</span>
                            )}
                            <div className="absolute bottom-2 left-2 z-10">
                              <ConditionBadge rating={condition} />
                            </div>
                            
                            {/* Bill check Verified overlay preview */}
                            {uploadedBill && (
                              <div className="absolute top-2 left-2 z-10 bg-[#E8FF00] text-black font-bebas text-[9px] px-1 font-semibold uppercase">
                                VERIFIED
                              </div>
                            )}
                          </div>
                          
                          <div className="p-3">
                            <span className="font-bebas text-[10px] tracking-widest text-[#C8B8A2] uppercase block leading-none">
                              {brand || "BRAND LABEL"}
                            </span>
                            <h4 className="font-space font-semibold text-xs leading-tight text-white mt-1 truncate">
                              {title || "FIT TITLE"}
                            </h4>
                            
                            <div className="mt-3 pt-2 border-t border-zinc-850 flex items-center justify-between">
                              <div className="flex flex-col">
                                <span className="text-[8px] uppercase tracking-wider text-zinc-600 leading-none">BID PRICE</span>
                                <span className="font-mono text-xs font-bold text-[#E8FF00] mt-0.5">₹{startBid || "0"}</span>
                              </div>
                              <span className="font-bebas text-[9px] text-black bg-zinc-400 px-2 py-0.5">PREVIEW</span>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Navigators inside Form Footer */}
            <div className="flex justify-between items-center pt-6 mt-8 border-t border-zinc-800">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="raw-btn flex items-center gap-1.5 px-4 py-2 border border-zinc-700 text-zinc-400 hover:text-white text-xs uppercase font-bold"
                >
                  <ArrowLeft size={14} />
                  PREVIOUS
                </button>
              ) : (
                <div /> // placeholder for alignment
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="raw-btn flex items-center gap-1.5 px-5 py-2.5 bg-[#F5F0E8] text-black hover:bg-[#E8FF00] hover:text-black text-xs font-bold shadow-[2px_2px_0px_rgba(255,255,255,1)]"
                >
                  CONTINUE
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="submit"
                  className="raw-btn flex items-center gap-1.5 px-6 py-3 bg-[#E8FF00] hover:bg-[#F5F0E8] text-black font-extrabold text-xs tracking-wider shadow-[3px_3px_0px_rgba(255,255,255,1)]"
                >
                  LAUNCH LISTING FIT
                  <Check size={14} />
                </button>
              )}
            </div>
          </form>

        </div>

      </div>

      {/* Success Notification Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-50 bg-[#E8FF00] text-black border-2 border-black p-4 font-space text-xs font-bold tracking-wider uppercase shadow-[4px_4px_0px_rgba(255,255,255,1)] flex items-center gap-2"
          >
            <Check size={16} />
            Listing Created Successfully! Redirecting...
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <Footer />
    </motion.div>
  );
};

export default SellPage;
