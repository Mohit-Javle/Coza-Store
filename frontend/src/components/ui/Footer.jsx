import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#0A0A0A] border-t border-[#1F1F1F] text-[#F5F0E8] py-12 md:py-16 mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">

        {/* Brand Info */}
        <div className="md:col-span-2">
          <span className="font-bebas text-4xl tracking-tighter block mb-3 text-[#F5F0E8]">
            COZA<span className="text-[#E8FF00]">-STORE</span>
          </span>
          <p className="font-space text-zinc-400 text-sm max-w-sm mb-6 leading-relaxed">
            Raw, editorial, underground thrift e-commerce. Curating high-contrast streetwear drops, bidding battles, and pre-loved vintage fits directly from the community.
          </p>
          <div className="flex gap-4">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="font-bebas text-[#C8B8A2] hover:text-[#E8FF00] tracking-wider text-sm">INSTAGRAM</a>
            <span className="text-zinc-700">•</span>
            <a href="https://discord.gg" target="_blank" rel="noreferrer" className="font-bebas text-[#C8B8A2] hover:text-[#E8FF00] tracking-wider text-sm">DISCORD</a>
            <span className="text-zinc-700">•</span>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="font-bebas text-[#C8B8A2] hover:text-[#E8FF00] tracking-wider text-sm">TWITTER</a>
          </div>
        </div>

        {/* Navigation Links */}
        <div>
          <h4 className="font-bebas text-lg tracking-wider text-[#C8B8A2] mb-4 uppercase">NAVIGATE</h4>
          <ul className="space-y-2 font-space text-sm text-zinc-400">
            <li><Link to="/" className="hover:text-[#E8FF00] transition-colors">Home</Link></li>
            <li><Link to="/store" className="hover:text-[#E8FF00] transition-colors">Browse Drops</Link></li>
            <li><Link to="/sell" className="hover:text-[#E8FF00] transition-colors">Start Selling</Link></li>
            <li><Link to="/auth" className="hover:text-[#E8FF00] transition-colors">Join Club</Link></li>
          </ul>
        </div>

        {/* Extra info */}
        <div>
          <h4 className="font-bebas text-lg tracking-wider text-[#C8B8A2] mb-4 uppercase">LEGAL VIBES</h4>
          <ul className="space-y-2 font-space text-sm text-zinc-400">
            <li><a href="#" onClick={(e) => { e.preventDefault(); alert("Be chill. Bids are commitments. No low-balling."); }} className="hover:text-[#E8FF00] transition-colors">Terms of Bids</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); alert("We verify invoices and condition claims. Fraud results in instant bans."); }} className="hover:text-[#E8FF00] transition-colors">Verification Policy</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); alert("Supported by Supabase & peer-to-peer streetwear fans."); }} className="hover:text-[#E8FF00] transition-colors">Privacy Shield</a></li>
          </ul>
        </div>

      </div>

      {/* Underbar */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 pt-8 border-t border-[#1F1F1F] flex flex-col md:flex-row justify-between items-center gap-4 text-center">
        <span className="font-space text-xs text-zinc-600">
          © 2026 COZA-STORE. ALL FITS RESERVED.
        </span>
        <span className="font-bebas text-lg text-[#C8B8A2] tracking-widest flex items-center gap-2">
          <span className="text-red-500 animate-pulse">COZA-STORE</span>
        </span>
      </div>
    </footer>
  );
};

export default Footer;
