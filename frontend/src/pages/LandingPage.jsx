import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import HeroSection from '../components/sections/HeroSection';
import TopPickups from '../components/sections/TopPickups';
import LiveBids from '../components/sections/LiveBids';
import FreshDrops from '../components/sections/FreshDrops';
import Footer from '../components/ui/Footer';

const LandingPage = () => {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full min-h-screen bg-[#0D0D0D] flex flex-col"
    >
      {/* Hero Section with Parallax */}
      <HeroSection />

      {/* Top Pickups Horizontal Carousel */}
      <TopPickups />

      {/* Live Bids Pulse Grid */}
      <LiveBids />

      {/* Fresh Drops Masonry Grid */}
      <FreshDrops />

      {/* Footer */}
      <Footer />
    </motion.div>
  );
};

export default LandingPage;
