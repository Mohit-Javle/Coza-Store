import React from 'react';
import { LayoutDashboard, ShoppingBag, Users, Gift, FileText, Settings, BarChart2, ScrollText } from 'lucide-react';

const AdminSidebar = ({ activeTab, setActiveTab, isSuperAdmin = false }) => {
  const baseTabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'listings', label: 'Listings Moderation', icon: ShoppingBag },
    { id: 'users', label: 'Users Directory', icon: Users },
    { id: 'rewards', label: 'Seller Rewards', icon: Gift }
  ];

  const superAdminTabs = [
    { id: 'admins', label: 'Admin Management', icon: Settings },
    { id: 'analytics', label: 'Analytics Panel', icon: BarChart2 },
    { id: 'audit', label: 'Audit Log', icon: ScrollText }
  ];

  const tabs = isSuperAdmin ? [...baseTabs, ...superAdminTabs] : baseTabs;

  return (
    <aside className="w-full md:w-64 bg-[#1A1A1A] border-b md:border-b-0 md:border-r border-[#2A2A2A] p-4 flex flex-col gap-4">
      {/* Editorial Header inside Admin Sidebar */}
      <div className="pb-4 border-b border-zinc-800 hidden md:block">
        <span className="font-bebas text-2xl tracking-wider text-[#F5F0E8] block">CONTROL DECK</span>
        <span className="font-space text-[10px] text-zinc-500 uppercase tracking-widest">
          {isSuperAdmin ? "SUPER ADMIN PRIVILEGES" : "STAFF MODERATOR"}
        </span>
      </div>

      <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible no-scrollbar gap-1 md:gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 text-xs md:text-sm font-space uppercase font-semibold border tracking-wider transition-all duration-150 shrink-0 ${
                isActive
                  ? 'bg-[#E8FF00] text-black border-transparent shadow-[3px_3px_0px_rgba(255,255,255,1)]'
                  : 'bg-black/30 text-zinc-400 border-zinc-900 hover:text-[#F5F0E8] hover:bg-black/55'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
