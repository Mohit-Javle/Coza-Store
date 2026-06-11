import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';

const HeroSection = () => {
  const containerRef = useRef(null);

  // Parallax Scroll Config using Framer Motion
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const yLeftImg = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const yRightImg = useTransform(scrollYProgress, [0, 1], [0, -250]);
  const opacityText = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scaleTitle = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  // Word-by-word stagger reveal animation configuration
  const headline = "SECONDHAND HITS DIFFERENT";
  const words = headline.split(" ");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const wordVariants = {
    hidden: {
      opacity: 0,
      y: 80,
      rotate: 4
    },
    visible: {
      opacity: 1,
      y: 0,
      rotate: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 80
      }
    }
  };

  return (
    <section
      ref={containerRef}
      className="grain-overlay relative w-full min-h-screen bg-black flex flex-col justify-center items-center overflow-hidden pt-20"
    >
      {/* Background grain element (handled by .grain-overlay in index.css, but we can make it darker here) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0D0D0D] via-black to-[#0D0D0D] opacity-90 z-0" />

      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 z-0" />

      {/* Floating Left Product Image (Parallax) */}
      <motion.div
        style={{ y: yLeftImg }}
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
        className="hidden lg:block absolute left-10 xl:left-20 top-1/4 w-64 aspect-[3/4] border border-[#333] bg-[#1A1A1A] p-2 shadow-[8px_8px_0px_0px_rgba(200,184,162,0.15)] z-10"
      >
        <div className="w-full h-full overflow-hidden bg-zinc-900 relative group">
          <img
            src="https://images.unsplash.com/photo-1517423568366-8b83523034fd?q=80&w=400&auto=format&fit=crop"
            alt="Archival Cargo"
            className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500"
          />
          <div className="absolute bottom-2 left-2 bg-[#E8FF00] text-black font-bebas text-xs tracking-wider px-2 py-0.5 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
            RARE CARGO
          </div>
        </div>
      </motion.div>

      {/* Floating Right Product Image (Parallax) */}
      <motion.div
        style={{ y: yRightImg }}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.2, delay: 0.7, ease: "easeOut" }}
        className="hidden lg:block absolute right-10 xl:right-20 bottom-1/4 w-72 aspect-[3/4] border border-[#333] bg-[#1A1A1A] p-2 shadow-[-8px_8px_0px_0px_rgba(232,255,0,0.1)] z-10"
      >
        <div className="w-full h-full overflow-hidden bg-zinc-900 relative group">
          <img
            src="https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=400&auto=format&fit=crop"
            alt="Air Jordan 1"
            className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500"
          />
          <div className="absolute bottom-2 right-2 bg-black text-[#F5F0E8] font-bebas text-xs tracking-wider px-2 py-0.5 border border-zinc-700 shadow-[2px_2px_0px_rgba(232,255,0,1)]">
            AJ1 CHICAGO
          </div>
        </div>
      </motion.div>

      {/* Content wrapper */}
      <motion.div
        style={{ opacity: opacityText, scale: scaleTitle }}
        className="relative z-20 max-w-4xl mx-auto px-4 text-center flex flex-col items-center justify-center pointer-events-none"
      >



        {/* Headline Word Stagger */}
        <motion.h1
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="font-bebas text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-[#F5F0E8] tracking-tighter leading-[0.85] uppercase flex flex-wrap justify-center gap-x-4 gap-y-2 select-none"
        >
          {words.map((word, idx) => (
            <span key={idx} className="overflow-hidden inline-block py-2">
              <motion.span
                variants={wordVariants}
                className={`inline-block ${word === "DIFFERENT" ? "text-transparent stroke-text" : ""}`}
                style={word === "DIFFERENT" ? { WebkitTextStroke: "2px #F5F0E8" } : {}}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="font-space text-zinc-400 text-base md:text-xl max-w-xl mt-6 leading-relaxed select-text"
        >
          Buy. Bid. Sell. — High-contrast branded fits at absolute thrift prices. No rules, just pure wardrobe chaos.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 mt-10 w-full sm:w-auto pointer-events-auto"
        >
          <Link
            to="/store"
            className="raw-btn px-8 py-4 bg-[#E8FF00] text-black font-bold tracking-widest text-base hover:bg-[#F5F0E8] shadow-[5px_5px_0px_0px_rgba(200,184,162,0.3)] hover:shadow-[5px_5px_0px_0px_rgba(255,255,255,1)]"
          >
            BROWSE DROPS
          </Link>
          <Link
            to="/sell"
            className="raw-btn px-8 py-4 bg-transparent text-[#F5F0E8] border-2 border-[#444] font-bold tracking-widest text-base hover:border-[#E8FF00] hover:text-[#E8FF00] shadow-[5px_5px_0px_0px_rgba(0,0,0,0.5)] hover:shadow-[5px_5px_0px_0px_rgba(232,255,0,0.2)]"
          >
            START SELLING
          </Link>
        </motion.div>
      </motion.div>

      {/* Decorative vertical editorial line */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 z-20">
        <span className="font-space text-[10px] tracking-widest text-zinc-500 uppercase rotate-90 my-4">SCROLL DOWN</span>
        <div className="w-[1px] h-16 bg-gradient-to-b from-[#F5F0E8] to-transparent animate-bounce" />
      </div>

      <style>{`
        .stroke-text {
          color: transparent;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
