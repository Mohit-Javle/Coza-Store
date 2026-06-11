import React from 'react';

const AdminTable = ({ headers = [], children }) => {
  return (
    <div className="w-full overflow-x-auto border border-[#2A2A2A] bg-[#1A1A1A]">
      <table className="w-full border-collapse text-left font-space text-sm">
        
        {/* Table Header */}
        <thead>
          <tr className="bg-black border-b border-[#2A2A2A]">
            {headers.map((header, idx) => (
              <th
                key={idx}
                className="px-4 py-3 font-bebas text-sm md:text-base tracking-wider text-[#C8B8A2] font-normal uppercase select-none"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        
        {/* Table Body */}
        <tbody className="divide-y divide-[#262626]">
          {children}
        </tbody>

      </table>
    </div>
  );
};

export default AdminTable;
