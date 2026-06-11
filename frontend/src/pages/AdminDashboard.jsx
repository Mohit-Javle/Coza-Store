import React, { useState } from 'react';
import { products as initialProducts } from '../data/products';
import { users as initialUsers } from '../data/users';
import AdminSidebar from '../components/admin/AdminSidebar';
import StatsCard from '../components/admin/StatsCard';
import AdminTable from '../components/admin/AdminTable';
import ConditionBadge from '../components/ui/ConditionBadge';
import Footer from '../components/ui/Footer';
import { motion } from 'framer-motion';
import { Users, Tag, Hammer, CreditCard, ShieldAlert, Award, Ban, CheckCircle, XCircle } from 'lucide-react';

const AdminDashboard = ({ isSuperAdmin = false }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Local reactive states for interactive tables
  const [productsList, setProductsList] = useState([...initialProducts]);
  const [usersList, setUsersList] = useState([...initialUsers]);

  // Actions for Listings
  const handleUpdateStatus = (productId, newStatus) => {
    // Modify in local memory
    // TODO: API call to update status in database (Supabase)
    const updated = productsList.map(p => {
      if (p.id === productId) {
        return { ...p, status: newStatus }; // Adding dynamic status field
      }
      return p;
    });
    setProductsList(updated);
    
    // Also update global products array for persistency within session
    const idx = initialProducts.findIndex(p => p.id === productId);
    if (idx !== -1) {
      initialProducts[idx].status = newStatus;
    }
  };

  const handleToggleStaffPick = (productId) => {
    const updated = productsList.map(p => {
      if (p.id === productId) {
        const hasTag = p.tags.includes('staffpick');
        const nextTags = hasTag ? p.tags.filter(t => t !== 'staffpick') : [...p.tags, 'staffpick'];
        return { ...p, tags: nextTags };
      }
      return p;
    });
    setProductsList(updated);

    const idx = initialProducts.findIndex(p => p.id === productId);
    if (idx !== -1) {
      const hasTag = initialProducts[idx].tags.includes('staffpick');
      initialProducts[idx].tags = hasTag 
        ? initialProducts[idx].tags.filter(t => t !== 'staffpick') 
        : [...initialProducts[idx].tags, 'staffpick'];
    }
  };

  // Actions for Rewards Tags
  const handleAssignReward = (productId, rewardTag) => {
    const updated = productsList.map(p => {
      if (p.id === productId) {
        const hasTag = p.tags.includes(rewardTag);
        const nextTags = hasTag ? p.tags.filter(t => t !== rewardTag) : [...p.tags, rewardTag];
        return { ...p, tags: nextTags };
      }
      return p;
    });
    setProductsList(updated);

    const idx = initialProducts.findIndex(p => p.id === productId);
    if (idx !== -1) {
      const hasTag = initialProducts[idx].tags.includes(rewardTag);
      initialProducts[idx].tags = hasTag 
        ? initialProducts[idx].tags.filter(t => t !== rewardTag) 
        : [...initialProducts[idx].tags, rewardTag];
    }
  };

  // Actions for Users
  const handleToggleUserBan = (userId) => {
    const updated = usersList.map(u => {
      if (u.id === userId) {
        return { ...u, isBanned: !u.isBanned }; // Adding dynamic isBanned flag
      }
      return u;
    });
    setUsersList(updated);

    const idx = initialUsers.findIndex(u => u.id === userId);
    if (idx !== -1) {
      initialUsers[idx].isBanned = !initialUsers[idx].isBanned;
    }
  };

  // Overview Mock Data
  const stats = [
    { title: "TOTAL REGISTERED USERS", value: usersList.length, icon: Users, change: "+12%" },
    { title: "ACTIVE SHIRT/FIT LISTINGS", value: productsList.length, icon: Tag, change: "+4%" },
    { title: "LIVE CAMPAIGN BIDS", value: productsList.filter(p => p.isLive).length, icon: Hammer, change: "+19%" },
    { title: "GROSS VOLUME TRANSACTIONS", value: "₹2,14,500", icon: CreditCard, change: "+24%" }
  ];

  // Mock Bar Chart Data (listings per day)
  const chartData = [
    { day: "Mon", count: 4, height: "h-16" },
    { day: "Tue", count: 7, height: "h-28" },
    { day: "Wed", count: 5, height: "h-20" },
    { day: "Thu", count: 8, height: "h-32" },
    { day: "Fri", count: 12, height: "h-48" },
    { day: "Sat", count: 9, height: "h-36" },
    { day: "Sun", count: 15, height: "h-60" }
  ];

  const getSellerUsername = (sellerId) => {
    const s = usersList.find(u => u.id === sellerId);
    return s ? s.username : 'anonymous';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full min-h-screen bg-[#0D0D0D] flex flex-col pt-20"
    >
      <div className="flex-grow flex flex-col md:flex-row max-w-7xl mx-auto w-full px-4 md:px-8 py-8 gap-6">
        
        {/* Navigation Sidebar */}
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} isSuperAdmin={isSuperAdmin} />

        {/* Dashboard Work Deck */}
        <main className="flex-grow bg-[#111] border border-[#222] p-6 relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#E8FF00]/5 rounded-bl-full pointer-events-none" />

          {/* Heading */}
          <div className="mb-8 border-b border-zinc-800 pb-4">
            <span className="font-space text-xs text-[#E8FF00] uppercase tracking-widest block mb-0.5">STAFF CONTROL BOARD</span>
            <h1 className="font-bebas text-4xl md:text-5xl tracking-wide text-[#F5F0E8] uppercase">
              {activeTab === 'overview' && "OVERVIEW DESK"}
              {activeTab === 'listings' && "LISTINGS MODERATION DECK"}
              {activeTab === 'users' && "USER REGISTRY MANAGEMENT"}
              {activeTab === 'rewards' && "REWARDS & BADGING PORTAL"}
            </h1>
          </div>

          {/* Tab Content 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                  <StatsCard
                    key={idx}
                    title={stat.title}
                    value={stat.value}
                    icon={stat.icon}
                    change={stat.change}
                  />
                ))}
              </div>

              {/* Simple Chart Display */}
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-6">
                <div className="mb-6">
                  <span className="font-space text-xs text-zinc-500 block uppercase">ANALYTICAL ACTIVITY</span>
                  <h3 className="font-bebas text-xl text-[#F5F0E8] tracking-wider uppercase">NEW STREETWEAR LISTINGS / DAY</h3>
                </div>
                
                {/* CSS Columns graph */}
                <div className="flex items-end justify-between h-72 border-b border-l border-zinc-800 px-4 pt-10 relative">
                  {/* Grid Lines */}
                  <div className="absolute top-1/4 left-0 right-0 h-[1px] bg-zinc-900 border-dashed pointer-events-none" />
                  <div className="absolute top-2/4 left-0 right-0 h-[1px] bg-zinc-900 border-dashed pointer-events-none" />
                  <div className="absolute top-3/4 left-0 right-0 h-[1px] bg-zinc-900 border-dashed pointer-events-none" />

                  {chartData.map((data, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-2 group w-full">
                      {/* Bar Count Display on hover */}
                      <span className="font-mono text-xs text-[#E8FF00] opacity-0 group-hover:opacity-100 transition-opacity">
                        {data.count}
                      </span>
                      {/* Visual Bar */}
                      <div className={`w-8 bg-[#C8B8A2] group-hover:bg-[#E8FF00] transition-colors relative shadow-[3px_3px_0px_rgba(0,0,0,1)] ${data.height}`}>
                        <div className="absolute top-0 left-0 w-full h-1 bg-[#F5F0E8] opacity-60" />
                      </div>
                      <span className="font-space text-xs text-zinc-500 uppercase">{data.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab Content 2: Listings Moderation */}
          {activeTab === 'listings' && (
            <div className="space-y-6">
              <AdminTable headers={["Image", "Fit Title", "Seller", "High Bid", "Condition", "Status", "Actions", "Promotions"]}>
                {productsList.map((product) => {
                  const currentPrice = product.currentBid || product.startingBid;
                  const isStaffPick = product.tags.includes('staffpick');
                  
                  return (
                    <tr key={product.id} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="px-4 py-3">
                        <img 
                          src={product.images[0]} 
                          alt={product.title} 
                          className="w-12 aspect-[3/4] object-cover border border-[#333]" 
                        />
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#F5F0E8]">{product.title}</td>
                      <td className="px-4 py-3 text-zinc-400">@{getSellerUsername(product.sellerId)}</td>
                      <td className="px-4 py-3 font-mono font-bold text-[#E8FF00]">₹{currentPrice}</td>
                      <td className="px-4 py-3"><ConditionBadge rating={product.condition} /></td>
                      <td className="px-4 py-3 font-space text-xs">
                        <span className={`px-2 py-0.5 font-bold uppercase ${
                          product.status === 'Approved' ? 'bg-green-950/50 text-green-400 border border-green-900/30' :
                          product.status === 'Rejected' ? 'bg-red-950/50 text-red-400 border border-red-900/30' :
                          product.status === 'Flagged' ? 'bg-orange-950/50 text-orange-400 border border-orange-900/30' :
                          'bg-zinc-900 text-zinc-500 border border-zinc-800'
                        }`}>
                          {product.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleUpdateStatus(product.id, 'Approved')}
                            className="p-1 bg-green-950/20 hover:bg-green-950 text-green-400 border border-zinc-800"
                            title="Approve listing"
                          >
                            <CheckCircle size={14} />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(product.id, 'Rejected')}
                            className="p-1 bg-red-950/20 hover:bg-red-950 text-red-400 border border-zinc-800"
                            title="Reject listing"
                          >
                            <XCircle size={14} />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(product.id, 'Flagged')}
                            className="p-1 bg-orange-950/20 hover:bg-orange-950 text-orange-400 border border-zinc-800"
                            title="Flag listing"
                          >
                            <ShieldAlert size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleStaffPick(product.id)}
                          className={`px-3 py-1 font-bebas text-xs tracking-wider transition-colors ${
                            isStaffPick 
                              ? 'bg-[#E8FF00] text-black font-bold' 
                              : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-white'
                          }`}
                        >
                          {isStaffPick ? 'STAFF PICK!' : 'FEATURE'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </AdminTable>
            </div>
          )}

          {/* Tab Content 3: Users Directory */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <AdminTable headers={["Avatar", "Username", "Name", "Location", "Listed Items", "Status", "Actions"]}>
                {usersList.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="px-4 py-3">
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-8 h-8 rounded-none object-cover border border-[#333]"
                      />
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#F5F0E8]">@{user.username}</td>
                    <td className="px-4 py-3 text-zinc-400">{user.name}</td>
                    <td className="px-4 py-3 font-space text-xs text-[#C8B8A2] uppercase">{user.location}</td>
                    <td className="px-4 py-3 font-mono font-semibold">{user.listedItems.length} listed</td>
                    <td className="px-4 py-3 font-space text-xs">
                      <span className={`px-2 py-0.5 font-bold uppercase ${
                        user.isBanned 
                          ? 'bg-red-950/50 text-red-500 border border-red-900/30' 
                          : 'bg-green-950/50 text-green-400 border border-green-900/30'
                      }`}>
                        {user.isBanned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleUserBan(user.id)}
                        className={`flex items-center gap-1.5 px-3 py-1 font-bebas text-xs tracking-wider border transition-colors ${
                          user.isBanned
                            ? 'bg-green-900/20 text-green-400 border-green-900 hover:bg-green-900 hover:text-black'
                            : 'bg-red-900/20 text-red-400 border-red-900 hover:bg-red-900 hover:text-black'
                        }`}
                      >
                        <Ban size={12} />
                        {user.isBanned ? 'UNBAN VISITOR' : 'BAN USER'}
                      </button>
                    </td>
                  </tr>
                ))}
              </AdminTable>
            </div>
          )}

          {/* Tab Content 4: Rewards */}
          {activeTab === 'rewards' && (
            <div className="space-y-6">
              <div className="bg-[#1A1A1A] p-4 border border-[#2A2A2A] mb-6">
                <span className="font-space text-xs text-[#E8FF00] uppercase font-bold block mb-1">REWARDS BADGING MATRIX</span>
                <p className="font-space text-zinc-400 text-xs">
                  Apply promotion stamps directly to thrift item cards. Hot Deals trigger pulsing icons, discount badges show markdown calculations, and Verified Sellers get structural checkmarks.
                </p>
              </div>

              <AdminTable headers={["Image", "Fit Title", "Original Bid", "Current Bid", "Active Tags", "Stamps Editor"]}>
                {productsList.map((product) => {
                  const isHot = product.tags.includes('hot');
                  const isDiscounted = product.tags.includes('discount');
                  
                  return (
                    <tr key={product.id} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="px-4 py-3">
                        <img 
                          src={product.images[0]} 
                          alt={product.title} 
                          className="w-12 aspect-[3/4] object-cover border border-[#333]" 
                        />
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#F5F0E8]">{product.title}</td>
                      <td className="px-4 py-3 font-mono text-xs text-zinc-500">₹{product.startingBid}</td>
                      <td className="px-4 py-3 font-mono font-bold text-[#E8FF00]">₹{product.currentBid}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {product.tags.map((tag, i) => (
                            <span key={i} className="bg-black/60 border border-zinc-800 text-[#C8B8A2] font-mono text-[9px] uppercase px-1.5 py-0.5">
                              {tag}
                            </span>
                          ))}
                          {product.tags.length === 0 && <span className="text-zinc-600 font-space text-xs uppercase italic">No active tags</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAssignReward(product.id, 'hot')}
                            className={`px-2 py-1 font-space text-[10px] uppercase font-bold border transition-colors ${
                              isHot ? 'bg-[#E8FF00] text-black border-transparent' : 'bg-black text-zinc-500 border-zinc-800 hover:text-white'
                            }`}
                          >
                            Stamp: HOT
                          </button>
                          <button
                            onClick={() => handleAssignReward(product.id, 'discount')}
                            className={`px-2 py-1 font-space text-[10px] uppercase font-bold border transition-colors ${
                              isDiscounted ? 'bg-[#E8FF00] text-black border-transparent' : 'bg-black text-zinc-500 border-zinc-800 hover:text-white'
                            }`}
                          >
                            Stamp: 10% OFF
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </AdminTable>
            </div>
          )}

        </main>

      </div>

      {/* Footer */}
      <Footer />
    </motion.div>
  );
};

export default AdminDashboard;
