import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

const ImageGallery = ({ images = [], hasBill = false }) => {
  const [activeIdx, setActiveIdx] = useState(0);

  if (images.length === 0) {
    return (
      <div className="w-full aspect-[3/4] bg-zinc-900 flex items-center justify-center border border-[#2A2A2A]">
        <span className="font-space text-zinc-500">NO IMAGES AVAILABLE</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image View */}
      <div className="relative w-full aspect-[3/4] border-2 border-[#2A2A2A] bg-black overflow-hidden group">
        <img
          src={images[activeIdx]}
          alt={`Product main view ${activeIdx + 1}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Verified Invoice Badge overlay */}
        {hasBill && (
          <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-[#E8FF00] text-black font-bebas tracking-wider text-xs md:text-sm px-3 py-1 shadow-[3px_3px_0px_rgba(0,0,0,1)] font-bold border border-black">
            <ShieldCheck size={16} />
            VERIFIED INVOICE
          </div>
        )}

        {/* Slide Counter Overlay */}
        <div className="absolute bottom-4 right-4 bg-black/85 text-[#F5F0E8] font-mono text-xs px-2.5 py-1 border border-zinc-700">
          {activeIdx + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={`w-20 aspect-square border-2 shrink-0 bg-[#1A1A1A] transition-all duration-150 ${
                activeIdx === idx 
                  ? 'border-[#E8FF00] p-0.5 scale-95' 
                  : 'border-[#2A2A2A] hover:border-[#C8B8A2]'
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
