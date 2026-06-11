import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { users } from '../data/users';
import { products } from '../data/products';
import ProfileGrid from '../components/profile/ProfileGrid';
import Footer from '../components/ui/Footer';
import { motion } from 'framer-motion';
import { MapPin, Settings, Plus, LayoutGrid, CheckCircle2, ShoppingBag } from 'lucide-react';

const ProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { currentUser, isLoggedIn, changeCurrentUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('selling');
  const [isEditing, setIsEditing] = useState(false);

  // Editable bio/location state
  const [bioInput, setBioInput] = useState('');
  const [locationInput, setLocationInput] = useState('');

  // Scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [username]);

  // Find user by username
  const user = users.find(u => u.username === username);

  useEffect(() => {
    if (user) {
      setBioInput(user.bio || '');
      setLocationInput(user.location || '');
    }
  }, [user]);

  if (!user) {
    return (
      <div className="w-full min-h-screen bg-[#0D0D0D] flex flex-col justify-center items-center text-center p-6 pt-24">
        <h2 className="font-bebas text-5xl text-red-500 mb-4">PROFILE NOT FOUND</h2>
        <p className="font-space text-zinc-400 mb-8 max-w-sm uppercase">
          The collector you are looking for does not exist in our system.
        </p>
        <button
          onClick={() => navigate('/')}
          className="raw-btn bg-[#E8FF00] text-black px-6 py-3 text-xs font-bold tracking-widest uppercase"
        >
          BACK HOME
        </button>
      </div>
    );
  }

  const isOwnProfile = isLoggedIn && currentUser?.username === user.username;

  // Filter listings based on user's lists
  // Selling
  const sellingItems = products.filter(p => user.listedItems.includes(p.id) && p.isLive);
  
  // Sold (simulate items that are in sold list or not live listed items)
  // Let's create dummy mappings or filter
  const soldItems = products.filter(p => user.soldItems.includes(p.id) || (user.listedItems.includes(p.id) && !p.isLive));
  
  // Purchased
  const purchasedItems = products.filter(p => user.purchasedItems.includes(p.id));

  const handleSaveChanges = (e) => {
    e.preventDefault();
    if (isOwnProfile) {
      changeCurrentUserProfile({
        bio: bioInput,
        location: locationInput
      });
      // Also update current view user object properties locally
      user.bio = bioInput;
      user.location = locationInput;
      setIsEditing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full min-h-screen bg-[#0D0D0D] flex flex-col pt-20"
    >
      {/* Cover Image Banner */}
      <div className="w-full h-48 md:h-64 relative bg-zinc-900 overflow-hidden">
        <img
          src={user.coverImage}
          alt={`${user.username} cover`}
          className="w-full h-full object-cover filter brightness-[0.7] grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
      </div>

      {/* Profile Info Header */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 w-full -mt-16 md:-mt-20 relative z-10 mb-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          
          {/* Avatar and Info */}
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4 md:gap-6">
            {/* Avatar Circle */}
            <div className="w-28 h-28 md:w-36 md:h-36 bg-[#1A1A1A] border-4 border-[#0D0D0D] overflow-hidden shrink-0 shadow-[4px_4px_0px_rgba(232,255,0,0.15)]">
              <img
                src={user.avatar}
                alt={user.username}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0"
              />
            </div>
            
            {/* User Meta Details */}
            <div className="pb-2">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="font-bebas text-4xl md:text-5xl tracking-tight text-[#F5F0E8] uppercase leading-none">
                  {user.name}
                </h1>
                <span className="font-space text-xs text-zinc-500 font-bold bg-zinc-900 border border-zinc-800 px-2 py-0.5 mt-1">
                  @{user.username}
                </span>
              </div>
              
              {/* Bio & Edit toggles */}
              {isEditing ? (
                <form onSubmit={handleSaveChanges} className="space-y-2 mt-2 w-full max-w-md">
                  <textarea
                    value={bioInput}
                    onChange={(e) => setBioInput(e.target.value)}
                    className="w-full raw-input text-xs p-2 uppercase font-space h-16 bg-black"
                    placeholder="ENTER YOUR BIO..."
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                      className="raw-input text-xs p-2 uppercase font-space bg-black flex-grow"
                      placeholder="LOCATION (e.g. Mumbai)"
                    />
                    <button
                      type="submit"
                      className="raw-btn bg-[#E8FF00] text-black px-4 py-2 font-bold text-xs"
                    >
                      SAVE
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="raw-btn bg-zinc-800 text-zinc-400 hover:text-white px-4 py-2 text-xs"
                    >
                      CANCEL
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <p className="font-space text-xs md:text-sm text-zinc-300 max-w-lg mb-2">
                    {user.bio}
                  </p>
                  <div className="flex items-center gap-1 font-space text-xs text-[#C8B8A2] uppercase">
                    <MapPin size={12} />
                    <span>{user.location}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action buttons (Own profile only) */}
          {isOwnProfile && !isEditing && (
            <div className="flex gap-2 self-start md:self-end">
              <button
                onClick={() => setIsEditing(true)}
                className="raw-btn flex items-center gap-1.5 px-4 py-2.5 bg-transparent border border-zinc-700 hover:border-[#C8B8A2] text-xs font-bold text-[#F5F0E8]"
              >
                <Settings size={14} />
                EDIT PROFILE
              </button>
              <button
                onClick={() => navigate('/sell')}
                className="raw-btn flex items-center gap-1.5 px-4 py-2.5 bg-[#E8FF00] hover:bg-[#F5F0E8] text-black text-xs font-bold shadow-[2px_2px_0px_rgba(255,255,255,1)]"
              >
                <Plus size={14} />
                LIST AN ITEM
              </button>
            </div>
          )}
        </div>

        {/* Stats Row Panel */}
        <div className="grid grid-cols-3 gap-1 md:gap-4 max-w-xl border-t border-b border-zinc-800 py-4 mt-8 font-space text-center text-xs md:text-sm">
          <div className="border-r border-zinc-900">
            <span className="text-[10px] text-zinc-500 block uppercase">LISTED</span>
            <span className="font-mono font-bold text-[#F5F0E8]">{user.listedItems.length} ITEMS</span>
          </div>
          <div className="border-r border-zinc-900">
            <span className="text-[10px] text-zinc-500 block uppercase">SOLD</span>
            <span className="font-mono font-bold text-[#C8B8A2]">{user.soldItems.length} ITEMS</span>
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 block uppercase">BOUGHT</span>
            <span className="font-mono font-bold text-[#E8FF00]">{user.purchasedItems.length} ITEMS</span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher and Content Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 w-full pb-16 flex-grow">
        
        {/* Switch buttons */}
        <div className="flex border-b border-zinc-800 mb-6 font-bebas text-lg tracking-wider">
          <button
            onClick={() => setActiveTab('selling')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 uppercase transition-all ${
              activeTab === 'selling'
                ? 'border-[#E8FF00] text-[#E8FF00] font-bold bg-zinc-950/20'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <LayoutGrid size={16} />
            SELLING ({sellingItems.length})
          </button>
          <button
            onClick={() => setActiveTab('sold')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 uppercase transition-all ${
              activeTab === 'sold'
                ? 'border-[#E8FF00] text-[#E8FF00] font-bold bg-zinc-950/20'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <CheckCircle2 size={16} />
            SOLD ({soldItems.length})
          </button>
          <button
            onClick={() => setActiveTab('purchased')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 uppercase transition-all ${
              activeTab === 'purchased'
                ? 'border-[#E8FF00] text-[#E8FF00] font-bold bg-zinc-950/20'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <ShoppingBag size={16} />
            PURCHASED ({purchasedItems.length})
          </button>
        </div>

        {/* Dynamic Profile Grid rendering based on activeTab */}
        <div className="mt-4">
          {activeTab === 'selling' && <ProfileGrid items={sellingItems} />}
          {activeTab === 'sold' && <ProfileGrid items={soldItems} />}
          {activeTab === 'purchased' && <ProfileGrid items={purchasedItems} />}
        </div>

      </div>

      {/* Footer */}
      <Footer />
    </motion.div>
  );
};

export default ProfilePage;
