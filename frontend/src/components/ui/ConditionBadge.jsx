import React from 'react';

const ConditionBadge = ({ rating }) => {
  const configs = {
    1: { label: "BEAT", bg: "bg-[#8B0000]", text: "text-[#F5F0E8]", border: "border-[#A00000]" },
    2: { label: "WORN", bg: "bg-[#D97706]", text: "text-[#F5F0E8]", border: "border-[#F59E0B]" },
    3: { label: "GOOD", bg: "bg-[#EAB308]", text: "text-[#0D0D0D]", border: "border-[#FACC15]" },
    4: { label: "GREAT", bg: "bg-[#16A34A]", text: "text-[#F5F0E8]", border: "border-[#22C55E]" },
    5: { label: "MINT", bg: "bg-[#E8FF00]", text: "text-[#0D0D0D]", border: "border-[#F5F0E8]" }
  };

  const current = configs[rating] || configs[3];

  return (
    <span className={`inline-block px-2.5 py-0.5 font-bebas text-sm tracking-wider border rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${current.bg} ${current.text} ${current.border}`}>
      {current.label}
    </span>
  );
};

export default ConditionBadge;
