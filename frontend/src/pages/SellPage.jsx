import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import ConditionBadge from '../components/ui/ConditionBadge';
import Footer from '../components/ui/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, ArrowLeft, ArrowRight, Check, ShieldCheck, HelpCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

const SellPage = () => {
  const { profile, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  // Route protection
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/auth?redirect=sell');
    }
  }, [isLoggedIn, navigate]);

  // Wizard state
  const [step, setStep] = useState(() => Number(localStorage.getItem('sell_step')) || 1);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

  // Form inputs state
  const [title, setTitle] = useState(() => localStorage.getItem('sell_title') || '');
  const [brand, setBrand] = useState(() => localStorage.getItem('sell_brand') || '');
  const [category, setCategory] = useState(() => localStorage.getItem('sell_category') || 'Tops');
  const [size, setSize] = useState(() => localStorage.getItem('sell_size') || 'M');
  const [gender, setGender] = useState(() => localStorage.getItem('sell_gender') || 'Unisex');
  const [condition, setCondition] = useState(() => Number(localStorage.getItem('sell_condition')) || 4);
  const [description, setDescription] = useState(() => localStorage.getItem('sell_description') || '');
  const [hasTags, setHasTags] = useState(() => localStorage.getItem('sell_hasTags') === 'true');
  
  // UI states — real file objects for Supabase upload (files cannot be persisted in localStorage)
  const [photoFiles, setPhotoFiles] = useState([]);     // File objects
  const [photoPreview, setPhotoPreview] = useState([]); // Object URLs
  const [billFile, setBillFile] = useState(null);
  const [billName, setBillName] = useState('');
  
  const [startBid, setStartBid] = useState(() => localStorage.getItem('sell_startBid') || '');
  const [buyNowPrice, setBuyNowPrice] = useState(() => localStorage.getItem('sell_buyNowPrice') || '');
  const [duration, setDuration] = useState(() => localStorage.getItem('sell_duration') || '7');
  const [customHours, setCustomHours] = useState(() => localStorage.getItem('sell_customHours') || '');
  
  const [submitting, setSubmitting] = useState(false);

  // Persist form inputs to localStorage
  useEffect(() => {
    localStorage.setItem('sell_step', step.toString());
    localStorage.setItem('sell_title', title);
    localStorage.setItem('sell_brand', brand);
    localStorage.setItem('sell_category', category);
    localStorage.setItem('sell_size', size);
    localStorage.setItem('sell_gender', gender);
    localStorage.setItem('sell_condition', condition.toString());
    localStorage.setItem('sell_description', description);
    localStorage.setItem('sell_hasTags', hasTags.toString());
    localStorage.setItem('sell_startBid', startBid);
    localStorage.setItem('sell_buyNowPrice', buyNowPrice);
    localStorage.setItem('sell_duration', duration);
    localStorage.setItem('sell_customHours', customHours);
  }, [step, title, brand, category, size, gender, condition, description, hasTags, startBid, buyNowPrice, duration, customHours]);

  useEffect(() => () => {
    photoPreview.forEach(URL.revokeObjectURL);
  }, []);

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

  // Real photo file selection
  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const remaining = 4 - photoFiles.length;
    const toAdd = files.slice(0, remaining);
    setPhotoFiles((prev) => [...prev, ...toAdd]);
    setPhotoPreview((prev) => [...prev, ...toAdd.map((f) => URL.createObjectURL(f))]);
  };

  const removePhoto = (idx) => {
    URL.revokeObjectURL(photoPreview[idx]);
    setPhotoFiles((prev) => prev.filter((_, i) => i !== idx));
    setPhotoPreview((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleBillSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setBillFile(file);
      setBillName(file.name);
    }
  };

  // Upload photos to Supabase storage
  const uploadPhotos = async () => {
    const urls = [];
    for (const file of photoFiles) {
      const ext = file.name.split('.').pop();
      const path = `${profile.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('product-images').upload(path, file);
      if (!error) {
        const { data } = supabase.storage.from('product-images').getPublicUrl(path);
        urls.push(data.publicUrl);
      }
    }
    return urls;
  };

  const uploadBill = async () => {
    if (!billFile) return null;
    const ext = billFile.name.split('.').pop();
    const path = `${profile.id}/bills/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('product-images').upload(path, billFile);
    if (error) return null;
    const { data } = supabase.storage.from('product-images').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (step < 3) {
      nextStep();
      return;
    }
    if (!startBid || parseFloat(startBid) <= 0) {
      toast.error('Please enter a valid starting bid price.');
      return;
    }
    if (!profile) return;
    setSubmitting(true);

    const loadId = toast.loading('Uploading your listing...');

    // Upload images
    const imageUrls = photoFiles.length > 0 ? await uploadPhotos() : [];
    const billUrl = await uploadBill();

    const endsAt = customHours && parseInt(customHours) > 0
      ? new Date(Date.now() + parseInt(customHours) * 60 * 60 * 1000).toISOString()
      : new Date(Date.now() + parseInt(duration) * 24 * 60 * 60 * 1000).toISOString();

    const { data: newProduct, error } = await supabase
      .from('products')
      .insert({
        seller_id: profile.id,
        title: title || 'Stark Archival Fit',
        brand: brand || 'Street Label',
        category: category.toLowerCase(),
        size,
        gender: gender.toLowerCase(),
        condition,
        description: description || 'Pre-loved heavy street piece.',
        images: imageUrls.length > 0 ? imageUrls : ['https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=600&auto=format&fit=crop'],
        has_bill: !!billUrl,
        bill_image: billUrl,
        starting_bid: parseFloat(startBid) || 500,
        current_bid: parseFloat(startBid) || 500,
        buy_now_price: buyNowPrice ? parseFloat(buyNowPrice) : null,
        bid_ends_at: endsAt,
        status: 'pending',
      })
      .select()
      .single();

    toast.dismiss(loadId);
    setSubmitting(false);

    if (error) {
      toast.error('Failed to create listing. Try again.');
      return;
    }

    // Clear draft from localStorage on success
    const keysToRemove = [
      'sell_step', 'sell_title', 'sell_brand', 'sell_category', 'sell_size',
      'sell_gender', 'sell_condition', 'sell_description', 'sell_hasTags',
      'sell_startBid', 'sell_buyNowPrice', 'sell_duration', 'sell_customHours'
    ];
    keysToRemove.forEach(key => localStorage.removeItem(key));

    toast.success('Listing live! 🔥');
    navigate(`/profile/${profile.username}`);
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

          <form onSubmit={handleFormSubmit} onKeyDown={handleKeyDown} className="flex-grow flex flex-col justify-between">
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
                        Upload Fit Photos (Max 4)
                      </span>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {/* Real previews */}
                        {photoPreview.map((url, idx) => (
                          <div key={idx} className="relative aspect-[3/4] border-2 border-zinc-700 bg-black group">
                            <img src={url} alt="Upload preview" className="w-full h-full object-cover" />
                            <button 
                              type="button" 
                              onClick={() => removePhoto(idx)}
                              className="absolute top-1 right-1 bg-black text-[#F5F0E8] border border-zinc-700 w-5 h-5 flex items-center justify-center font-bold text-xs hover:bg-red-600 transition-colors"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}

                        {/* Upload Button Box */}
                        {photoPreview.length < 4 && (
                          <label className="aspect-[3/4] border-2 border-dashed border-zinc-800 bg-black hover:border-[#E8FF00] flex flex-col items-center justify-center text-center p-3 transition-colors cursor-pointer">
                            <Upload size={24} className="text-zinc-600 mb-2" />
                            <span className="font-space text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                              DRAG &amp; DROP
                            </span>
                            <span className="font-space text-[8px] text-zinc-700 uppercase">
                              JPG / PNG
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={handlePhotoSelect}
                            />
                          </label>
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
                          <label
                            className={`px-4 py-2 border border-dashed text-xs font-space uppercase transition-colors shrink-0 cursor-pointer ${
                              billName ? 'border-[#E8FF00] text-[#E8FF00]' : 'border-zinc-800 hover:border-zinc-600'
                            }`}
                          >
                            {billName ? 'BILL ATTACHED' : 'UPLOAD BILL'}
                            <input type="file" accept=".pdf,image/*" className="hidden" onChange={handleBillSelect} />
                          </label>
                          
                          {billName && (
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
                          <label className="font-space text-xs text-zinc-400 uppercase block mb-2">Campaign Lifespan</label>
                          <div className="grid grid-cols-4 gap-2">
                            {['3', '7', '14'].map((days) => (
                              <button
                                key={days}
                                type="button"
                                onClick={() => {
                                  setDuration(days);
                                  setCustomHours('');
                                }}
                                className={`py-2 text-center border font-space text-[10px] md:text-xs font-bold transition-all ${
                                  duration === days && !customHours
                                    ? 'bg-[#E8FF00] text-black border-transparent'
                                    : 'bg-black/30 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                                }`}
                              >
                                {days} DAYS
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                setDuration('');
                                setCustomHours('12');
                              }}
                              className={`py-2 text-center border font-space text-[10px] md:text-xs font-bold transition-all ${
                                customHours
                                  ? 'bg-[#E8FF00] text-black border-transparent'
                                  : 'bg-black/30 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                              }`}
                            >
                              CUSTOM
                            </button>
                          </div>

                          {customHours !== '' && (
                            <div className="mt-3 flex items-center gap-2">
                              <input
                                type="number"
                                min="1"
                                max="168"
                                value={customHours}
                                onChange={(e) => setCustomHours(e.target.value)}
                                className="raw-input px-3 py-1.5 text-xs font-mono w-24 bg-black border-zinc-800"
                                placeholder="Hours"
                              />
                              <span className="font-space text-[10px] text-zinc-500 uppercase">HOURS (e.g. 12 or 24)</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Item Preview Card */}
                      <div className="border border-zinc-800 bg-black/40 p-4">
                        <span className="font-space text-[10px] tracking-widest text-zinc-500 uppercase block mb-3">LIVE LISTING CARD PREVIEW</span>
                        <div className="max-w-[240px] mx-auto scale-95 border border-[#2a2a2a] bg-[#1a1a1a]">
                          {/* Image Box */}
                          <div className="relative aspect-[3/4] bg-zinc-950 flex items-center justify-center">
                            {photoPreview.length > 0 ? (
                              <img src={photoPreview[0]} alt="preview item" className="w-full h-full object-cover" />
                            ) : (
                              <span className="font-space text-[9px] text-zinc-700 uppercase font-bold tracking-widest">FIT PHOTO SLOT</span>
                            )}
                            <div className="absolute bottom-2 left-2 z-10">
                              <ConditionBadge rating={condition} />
                            </div>
                            
                            {/* Bill check Verified overlay preview */}
                            {billName && (
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
                  disabled={submitting}
                  className="raw-btn flex items-center gap-1.5 px-6 py-3 bg-[#E8FF00] hover:bg-[#F5F0E8] text-black font-extrabold text-xs tracking-wider shadow-[3px_3px_0px_rgba(255,255,255,1)] disabled:opacity-50"
                >
                  {submitting ? 'LAUNCHING...' : 'LAUNCH LISTING FIT'}
                  <Check size={14} />
                </button>
              )}
            </div>
          </form>

        </div>

      </div>

      {/* (toast handled by global Toaster in App.jsx) */}

      {/* Footer */}
      <Footer />
    </motion.div>
  );
};

export default SellPage;
