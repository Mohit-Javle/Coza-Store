import React from 'react';

const StatsCard = ({ title, value, icon: Icon, change, changeType = 'positive' }) => {
  return (
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] flex flex-col justify-between relative overflow-hidden group">
      
      {/* Small top-right accent badge */}
      <div className="absolute top-0 right-0 w-8 h-8 bg-zinc-800/20 group-hover:bg-[#E8FF00]/10 transition-colors duration-200" />

      <div className="flex items-start justify-between">
        <div>
          <span className="font-space text-[10px] tracking-widest text-zinc-500 uppercase block mb-1">
            {title}
          </span>
          <span className="font-mono text-3xl font-black text-[#F5F0E8] block tracking-tighter">
            {value}
          </span>
        </div>
        
        <div className="p-3 bg-black/40 border border-zinc-800 text-[#C8B8A2] group-hover:text-[#E8FF00] group-hover:border-[#E8FF00]/30 transition-all duration-300">
          <Icon size={20} />
        </div>
      </div>

      {change && (
        <div className="mt-4 flex items-center gap-1.5 font-space text-[11px]">
          <span className={`font-bold px-1.5 py-0.5 rounded-none ${
            changeType === 'positive' 
              ? 'bg-green-950/40 text-green-400 border border-green-900/30' 
              : 'bg-red-950/40 text-red-400 border border-red-900/30'
          }`}>
            {change}
          </span>
          <span className="text-zinc-500 uppercase">VS PREV MONTH</span>
        </div>
      )}
    </div>
  );
};

export default StatsCard;
