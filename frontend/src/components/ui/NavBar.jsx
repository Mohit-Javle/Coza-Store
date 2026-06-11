import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Search, Menu, X, User, LogOut, ShieldAlert, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import HowItWorksModal from './HowItWorksModal';

const NavBar = () => {
  const { currentUser, isLoggedIn, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Scroll listener to toggle navbar solid background
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu and profile dropdown on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/store?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const isHeroPage = location.pathname === '/';

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 border-b ${
          isScrolled || !isHeroPage
            ? 'bg-[#0D0D0D]/95 border-[#2A2A2A] py-3 backdrop-blur-md'
            : 'bg-transparent border-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="font-bebas text-3xl md:text-4xl tracking-tighter text-[#F5F0E8] group-hover:text-[#E8FF00] transition-colors duration-200">
              COZA<span className="text-[#E8FF00] group-hover:text-[#F5F0E8]">-STORE</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              to="/store" 
              className={`font-space font-medium text-sm tracking-wider uppercase hover:text-[#E8FF00] transition-colors duration-200 ${
                location.pathname === '/store' ? 'text-[#E8FF00] underline underline-offset-4 decoration-2' : 'text-[#F5F0E8]'
              }`}
            >
              Browse Drops
            </Link>
            <Link 
              to="/sell" 
              className={`font-space font-medium text-sm tracking-wider uppercase hover:text-[#E8FF00] transition-colors duration-200 ${
                location.pathname === '/sell' ? 'text-[#E8FF00] underline underline-offset-4 decoration-2' : 'text-[#F5F0E8]'
              }`}
            >
              Sell An Item
            </Link>
            <button 
              onClick={() => setIsHowItWorksOpen(true)}
              className="font-space font-medium text-sm tracking-wider uppercase hover:text-[#E8FF00] text-[#F5F0E8] transition-colors duration-200"
            >
              How It Works
            </button>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-6">
            
            {/* Search Toggle */}
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-[#F5F0E8] hover:text-[#E8FF00] transition-colors duration-200"
              aria-label="Toggle Search"
            >
              <Search size={20} />
            </button>

            {/* Auth section */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 pl-2 border-l border-zinc-700 focus:outline-none"
                >
                  <img
                    src={currentUser?.avatar}
                    alt={currentUser?.username}
                    className="w-8 h-8 rounded-none border border-[#444444] object-cover"
                  />
                  <span className="font-space text-xs text-[#C8B8A2] hover:text-[#F5F0E8] transition-colors duration-200 max-w-[100px] truncate">
                    @{currentUser?.username}
                  </span>
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isProfileOpen && (
                    <>
                      {/* Invisible backdrop to close dropdown */}
                      <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                      
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-3 w-56 bg-[#1A1A1A] border border-[#333] shadow-xl z-20 py-2 rounded-none"
                      >
                        <div className="px-4 py-2 border-b border-[#333] mb-1">
                          <p className="font-space text-xs text-zinc-500">Logged in as</p>
                          <p className="font-space text-sm font-semibold truncate text-[#F5F0E8]">{currentUser?.name}</p>
                        </div>
                        
                        <Link
                          to={`/profile/${currentUser?.username}`}
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-space text-[#F5F0E8] hover:bg-[#E8FF00] hover:text-black transition-colors"
                        >
                          <User size={16} />
                          My Profile
                        </Link>

                        <Link
                          to="/admin"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-space text-[#F5F0E8] hover:bg-[#E8FF00] hover:text-black transition-colors"
                        >
                          <ShieldAlert size={16} />
                          Admin Panel
                        </Link>

                        <Link
                          to="/superadmin"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-space text-[#F5F0E8] hover:bg-[#E8FF00] hover:text-black transition-colors"
                        >
                          <Award size={16} />
                          Super Admin
                        </Link>

                        <button
                          onClick={() => {
                            logout();
                            setIsProfileOpen(false);
                            navigate('/');
                          }}
                          className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm font-space text-[#F5F0E8] hover:bg-red-600 hover:text-[#F5F0E8] transition-colors border-t border-[#333] mt-1"
                        >
                          <LogOut size={16} />
                          Log Out
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link 
                to="/auth" 
                className="raw-btn bg-[#E8FF00] hover:bg-[#F5F0E8] text-black px-5 py-2 text-sm font-bold tracking-wide shadow-[3px_3px_0px_0px_rgba(200,184,162,0.3)] hover:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]"
              >
                JOIN THE CLUB
              </Link>
            )}

          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-4 md:hidden">
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-[#F5F0E8] hover:text-[#E8FF00]"
            >
              <Search size={20} />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-[#F5F0E8] hover:text-[#E8FF00]"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>

        {/* Floating Search Bar */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="w-full bg-[#1A1A1A] border-t border-b border-[#2A2A2A] overflow-hidden"
            >
              <div className="max-w-3xl mx-auto px-4 py-4">
                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="SEARCH BRAND, FITS, SIZES (e.g. Nike, XL)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-grow raw-input px-4 py-2 text-sm uppercase font-space bg-black border-[#444]"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="raw-btn bg-[#E8FF00] hover:bg-[#F5F0E8] text-black px-6 text-sm font-bold tracking-wider"
                  >
                    SEARCH
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Slide-down Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-30 bg-[#0D0D0D] pt-24 px-6 flex flex-col justify-between pb-8 md:hidden"
          >
            <div className="flex flex-col gap-6 mt-8">
              <Link 
                to="/store"
                className="font-bebas text-5xl tracking-wide hover:text-[#E8FF00]"
              >
                BROWSE DROPS
              </Link>
              <Link 
                to="/sell"
                className="font-bebas text-5xl tracking-wide hover:text-[#E8FF00]"
              >
                SELL AN ITEM
              </Link>
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsHowItWorksOpen(true);
                }}
                className="text-left font-bebas text-5xl tracking-wide hover:text-[#E8FF00]"
              >
                HOW IT WORKS
              </button>
              
              {isLoggedIn ? (
                <>
                  <Link 
                    to={`/profile/${currentUser?.username}`}
                    className="font-bebas text-4xl tracking-wide text-[#C8B8A2] hover:text-[#E8FF00] mt-4"
                  >
                    MY PROFILE (@{currentUser?.username})
                  </Link>
                  <Link 
                    to="/admin"
                    className="font-bebas text-3xl tracking-wide text-zinc-500 hover:text-[#E8FF00]"
                  >
                    ADMIN PANEL
                  </Link>
                  <Link 
                    to="/superadmin"
                    className="font-bebas text-3xl tracking-wide text-zinc-500 hover:text-[#E8FF00]"
                  >
                    SUPER ADMIN
                  </Link>
                </>
              ) : (
                <Link 
                  to="/auth"
                  className="font-bebas text-4xl tracking-wide text-[#E8FF00] hover:text-[#F5F0E8] mt-4"
                >
                  JOIN THE CLUB
                </Link>
              )}
            </div>

            <div className="border-t border-[#2A2A2A] pt-6 flex justify-between items-center">
              {isLoggedIn ? (
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="flex items-center gap-2 font-space text-[#F5F0E8] hover:text-[#E8FF00]"
                >
                  <LogOut size={18} />
                  LOG OUT
                </button>
              ) : (
                <span className="font-space text-xs text-zinc-500">© 2026 COZA-STORE</span>
              )}

              <span className="font-bebas text-[#C8B8A2] text-xl">MADE WITH ❤️ COZA</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* How It Works Fullscreen Scroll Modal */}
      <HowItWorksModal isOpen={isHowItWorksOpen} onClose={() => setIsHowItWorksOpen(false)} />
    </>
  );
};

export default NavBar;
