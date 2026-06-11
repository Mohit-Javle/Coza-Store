import React, { useState } from 'react';
import { products as initialProducts } from '../data/products';
import { users as initialUsers } from '../data/users';
import AdminSidebar from '../components/admin/AdminSidebar';
import StatsCard from '../components/admin/StatsCard';
import AdminTable from '../components/admin/AdminTable';
import ConditionBadge from '../components/ui/ConditionBadge';
import Footer from '../components/ui/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Tag, Hammer, CreditCard, Ban, CheckCircle, XCircle, 
  Trash2, Plus, ArrowUpRight, ShieldAlert, LineChart as ChartIcon
} from 'lucide-react';

// Recharts components imports
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, LineChart, Line, BarChart, Bar 
} from 'recharts';

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Local reactive states for interactive tables
  const [productsList, setProductsList] = useState([...initialProducts]);
  const [usersList, setUsersList] = useState([...initialUsers]);

  // Admin list state
  const [adminsList, setAdminsList] = useState([
    { id: 'adm1', email: 'mod.kabir@chaos.in', role: 'Staff Moderator', addedAt: '2026-05-12' },
    { id: 'adm2', email: 'lead.zoya@chaos.in', role: 'Billing Inspector', addedAt: '2026-05-20' },
    { id: 'adm3', email: 'owner.dev@chaos.in', role: 'Super Admin', addedAt: '2026-04-01' }
  ]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Audit Logs mock state
  const [auditLogs, setAuditLogs] = useState([
    { id: 'log1', time: '2026-06-11 14:20:10', admin: 'lead.zoya@chaos.in', action: 'Approved listing', target: 'AJ1 Chicago (p3)' },
    { id: 'log2', time: '2026-06-11 11:05:00', admin: 'mod.kabir@chaos.in', action: 'Flagged user comment', target: 'u5 comment on p1' },
    { id: 'log3', time: '2026-06-10 18:30:15', admin: 'owner.dev@chaos.in', action: 'Banned user', target: 'u7 (nikhil.j)' },
    { id: 'log4', time: '2026-06-09 10:12:44', admin: 'lead.zoya@chaos.in', action: 'Assigned reward stamp', target: 'Ralph Flannel (p1) -> staffpick' },
    { id: 'log5', time: '2026-06-08 17:40:02', admin: 'mod.kabir@chaos.in', action: 'Approved listing', target: 'Casio Watch (p15)' }
  ]);

  // Analytics Chart mock data
  const dauData = [
    { name: '06-05', dau: 1200 },
    { name: '06-06', dau: 1350 },
    { name: '06-07', dau: 1100 },
    { name: '06-08', dau: 1550 },
    { name: '06-09', dau: 1800 },
    { name: '06-10', dau: 1650 },
    { name: '06-11', dau: 2100 }
  ];

  const bidsVolumeData = [
    { name: '06-05', volume: 45000 },
    { name: '06-06', volume: 62000 },
    { name: '06-07', volume: 55000 },
    { name: '06-08', volume: 84000 },
    { name: '06-09', volume: 95000 },
    { name: '06-10', volume: 112000 },
    { name: '06-11', volume: 135000 }
  ];

  const listingsData = [
    { name: '06-05', count: 6 },
    { name: '06-06', count: 9 },
    { name: '06-07', count: 5 },
    { name: '06-08', count: 12 },
    { name: '06-09', count: 14 },
    { name: '06-10', count: 8 },
    { name: '06-11', count: 18 }
  ];

  // Actions for Listings
  const handleUpdateStatus = (productId, newStatus) => {
    const updated = productsList.map(p => {
      if (p.id === productId) {
        return { ...p, status: newStatus };
      }
      return p;
    });
    setProductsList(updated);
    
    // Log audit log
    const newLog = {
      id: `log${auditLogs.length + 1}`,
      time: new Date().toISOString().replace('T', ' ').substring(0, 19),
      admin: 'owner.dev@chaos.in',
      action: `Set status to ${newStatus}`,
      target: `Product ID: ${productId}`
    };
    setAuditLogs([newLog, ...auditLogs]);

    const idx = initialProducts.findIndex(p => p.id === productId);
    if (idx !== -1) initialProducts[idx].status = newStatus;
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
      initialProducts[idx].tags = hasTag ? initialProducts[idx].tags.filter(t => t !== 'staffpick') : [...initialProducts[idx].tags, 'staffpick'];
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
      initialProducts[idx].tags = hasTag ? initialProducts[idx].tags.filter(t => t !== rewardTag) : [...initialProducts[idx].tags, rewardTag];
    }
  };

  // Actions for Users
  const handleToggleUserBan = (userId) => {
    const updated = usersList.map(u => {
      if (u.id === userId) {
        return { ...u, isBanned: !u.isBanned };
      }
      return u;
    });
    setUsersList(updated);

    const targetUser = usersList.find(u => u.id === userId);
    const newLog = {
      id: `log${auditLogs.length + 1}`,
      time: new Date().toISOString().replace('T', ' ').substring(0, 19),
      admin: 'owner.dev@chaos.in',
      action: targetUser?.isBanned ? 'Unbanned user' : 'Banned user',
      target: `@${targetUser?.username}`
    };
    setAuditLogs([newLog, ...auditLogs]);

    const idx = initialUsers.findIndex(u => u.id === userId);
    if (idx !== -1) initialUsers[idx].isBanned = !initialUsers[idx].isBanned;
  };

  // Add / Remove Admin
  const handleAddAdmin = (e) => {
    e.preventDefault();
    if (!newAdminEmail) return;

    const newAdmin = {
      id: `adm${adminsList.length + 1}`,
      email: newAdminEmail.trim(),
      role: 'Staff Moderator',
      addedAt: new Date().toISOString().split('T')[0]
    };

    setAdminsList([...adminsList, newAdmin]);

    const newLog = {
      id: `log${auditLogs.length + 1}`,
      time: new Date().toISOString().replace('T', ' ').substring(0, 19),
      admin: 'owner.dev@chaos.in',
      action: 'Promoted admin',
      target: newAdminEmail.trim()
    };
    setAuditLogs([newLog, ...auditLogs]);

    setNewAdminEmail('');
    setShowAddModal(false);
  };

  const handleRemoveAdmin = (id, email) => {
    setAdminsList(adminsList.filter(a => a.id !== id));

    const newLog = {
      id: `log${auditLogs.length + 1}`,
      time: new Date().toISOString().replace('T', ' ').substring(0, 19),
      admin: 'owner.dev@chaos.in',
      action: 'Demoted admin',
      target: email
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  // Stats
  const stats = [
    { title: "TOTAL USERS", value: usersList.length, icon: Users, change: "+12%" },
    { title: "ACTIVE LISTINGS", value: productsList.length, icon: Tag, change: "+4%" },
    { title: "LIVE BIDS", value: productsList.filter(p => p.isLive).length, icon: Hammer, change: "+19%" },
    { title: "GROSS VOLUME TRANSACTIONS", value: "₹2,14,500", icon: CreditCard, change: "+24%" }
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
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} isSuperAdmin={true} />

        {/* Dashboard Work Deck */}
        <main className="flex-grow bg-[#111] border border-[#222] p-6 relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#E8FF00]/5 rounded-bl-full pointer-events-none" />

          {/* Heading */}
          <div className="mb-8 border-b border-zinc-800 pb-4">
            <span className="font-space text-xs text-[#E8FF00] uppercase tracking-widest block mb-0.5">SUPERADMIN DECK COMMAND</span>
            <h1 className="font-bebas text-4xl md:text-5xl tracking-wide text-[#F5F0E8] uppercase">
              {activeTab === 'overview' && "OVERVIEW CONTROL"}
              {activeTab === 'listings' && "LISTINGS CONTROL PANEL"}
              {activeTab === 'users' && "USER REGISTRY PANEL"}
              {activeTab === 'rewards' && "SELLER PROMO GATE"}
              {activeTab === 'admins' && "ADMIN TEAM STRUCTURE"}
              {activeTab === 'analytics' && "INTERACTIVE METRIC RUN"}
              {activeTab === 'audit' && "DECK AUDIT LOGS"}
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

              {/* Chart Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Micro chart DAU */}
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-5">
                  <span className="font-space text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">DAU INDEX</span>
                  <span className="font-bebas text-lg text-[#F5F0E8] block mb-4 uppercase">DAILY ACTIVE COZA VISITORS</span>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dauData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                        <XAxis dataKey="name" stroke="#444" style={{ fontFamily: 'monospace', fontSize: '9px' }} />
                        <YAxis stroke="#444" style={{ fontFamily: 'monospace', fontSize: '9px' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }} />
                        <Line type="monotone" dataKey="dau" stroke="#E8FF00" strokeWidth={2} dot={{ fill: '#E8FF00', stroke: '#0D0D0D' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Micro chart Bid Volume */}
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-5">
                  <span className="font-space text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">BID CAPS</span>
                  <span className="font-bebas text-lg text-[#F5F0E8] block mb-4 uppercase">BID VOLUME VELOCITY (INR)</span>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={bidsVolumeData}>
                        <defs>
                          <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#C8B8A2" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#C8B8A2" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                        <XAxis dataKey="name" stroke="#444" style={{ fontFamily: 'monospace', fontSize: '9px' }} />
                        <YAxis stroke="#444" style={{ fontFamily: 'monospace', fontSize: '9px' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }} />
                        <Area type="monotone" dataKey="volume" stroke="#C8B8A2" fillOpacity={1} fill="url(#colorVolume)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Tab Content 2: Listings Moderation (Inherited from Admin) */}
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
                          >
                            <CheckCircle size={14} />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(product.id, 'Rejected')}
                            className="p-1 bg-red-950/20 hover:bg-red-950 text-red-400 border border-zinc-800"
                          >
                            <XCircle size={14} />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(product.id, 'Flagged')}
                            className="p-1 bg-orange-950/20 hover:bg-orange-950 text-orange-400 border border-zinc-800"
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

          {/* Tab Content 3: Users Directory (Inherited) */}
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

          {/* Tab Content 5: Admin Management */}
          {activeTab === 'admins' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <span className="font-space text-xs text-zinc-500 uppercase block mb-1">STAFF STRUCTURE</span>
                  <h3 className="font-bebas text-2xl text-[#F5F0E8] uppercase tracking-wider">ACTIVE CREDENTIAL DECK ({adminsList.length})</h3>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="raw-btn flex items-center gap-1.5 px-4 py-2 bg-[#E8FF00] text-black font-bold text-xs shadow-[3px_3px_0px_rgba(255,255,255,1)]"
                >
                  <Plus size={14} />
                  PROMOTE NEW ADMIN
                </button>
              </div>

              <AdminTable headers={["ID", "Admin Email Address", "Operational Role", "Promotion Date", "Removal"]}>
                {adminsList.map((adm) => (
                  <tr key={adm.id} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-zinc-500">{adm.id}</td>
                    <td className="px-4 py-3 font-semibold text-[#F5F0E8]">{adm.email}</td>
                    <td className="px-4 py-3 font-space text-xs text-[#C8B8A2] uppercase font-bold">{adm.role}</td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-500">{adm.addedAt}</td>
                    <td className="px-4 py-3">
                      {adm.email === 'owner.dev@chaos.in' ? (
                        <span className="font-space text-[10px] text-zinc-600 uppercase font-bold italic">PRIMARY OWNER</span>
                      ) : (
                        <button
                          onClick={() => handleRemoveAdmin(adm.id, adm.email)}
                          className="p-1.5 bg-red-950/20 hover:bg-red-950 text-red-500 border border-zinc-800"
                          title="Demote administrator"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </AdminTable>
            </div>
          )}

          {/* Tab Content 6: Analytics */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* DAU Chart (Line) */}
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-5">
                  <span className="font-space text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">DAU VELOCITY</span>
                  <h3 className="font-bebas text-lg text-[#F5F0E8] mb-4 uppercase">DAILY ACTIVE USERS (7 DAY SPLIT)</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dauData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                        <XAxis dataKey="name" stroke="#444" style={{ fontFamily: 'monospace', fontSize: '9px' }} />
                        <YAxis stroke="#444" style={{ fontFamily: 'monospace', fontSize: '9px' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }} />
                        <Line type="monotone" dataKey="dau" stroke="#E8FF00" strokeWidth={2} dot={{ fill: '#E8FF00', stroke: '#0D0D0D' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Bids Volume Chart (Area) */}
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-5">
                  <span className="font-space text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">BID TRACTION</span>
                  <h3 className="font-bebas text-lg text-[#F5F0E8] mb-4 uppercase">DAILY BID TRANSACTION SUM (INR)</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={bidsVolumeData}>
                        <defs>
                          <linearGradient id="colorVolumeSA" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#E8FF00" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#E8FF00" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                        <XAxis dataKey="name" stroke="#444" style={{ fontFamily: 'monospace', fontSize: '9px' }} />
                        <YAxis stroke="#444" style={{ fontFamily: 'monospace', fontSize: '9px' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }} />
                        <Area type="monotone" dataKey="volume" stroke="#E8FF00" fillOpacity={1} fill="url(#colorVolumeSA)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* Listings Created Chart (Bar) */}
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-5">
                <span className="font-space text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">LISTINGS GROWTH</span>
                <h3 className="font-bebas text-lg text-[#F5F0E8] mb-4 uppercase">NEW GARMENTS LISTED / DAY (7 DAY SPLIT)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={listingsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                      <XAxis dataKey="name" stroke="#444" style={{ fontFamily: 'monospace', fontSize: '9px' }} />
                      <YAxis stroke="#444" style={{ fontFamily: 'monospace', fontSize: '9px' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }} />
                      <Bar dataKey="count" fill="#C8B8A2" shadow={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          )}

          {/* Tab Content 7: Audit Log */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <span className="font-space text-xs text-zinc-500 uppercase block mb-1">HISTORY LOG DECK</span>
                  <h3 className="font-bebas text-2xl text-[#F5F0E8] uppercase tracking-wider">STAFF AUDIT LOGGING</h3>
                </div>
                <button
                  onClick={() => {
                    setAuditLogs([]);
                    alert("Audit log memory wiped (simulated).");
                  }}
                  className="raw-btn px-4 py-2 bg-transparent border border-zinc-800 hover:border-red-800 hover:text-red-500 text-xs font-bold"
                >
                  CLEAR SYSTEM LOG
                </button>
              </div>

              <AdminTable headers={["Timestamp", "Administrator", "Activity Action", "Target component"]}>
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-zinc-500">{log.time}</td>
                    <td className="px-4 py-3 font-semibold text-[#F5F0E8]">{log.admin}</td>
                    <td className="px-4 py-3 font-space text-xs text-[#C8B8A2] uppercase font-bold">{log.action}</td>
                    <td className="px-4 py-3 text-zinc-400 font-mono text-xs">{log.target}</td>
                  </tr>
                ))}
              </AdminTable>
            </div>
          )}

        </main>

      </div>

      {/* Promoted Admin Overlay modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1A1A1A] border border-[#2A2A2A] p-6 max-w-sm w-full relative z-10 shadow-2xl"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#E8FF00]" />
            <h3 className="font-bebas text-2xl text-[#F5F0E8] uppercase mb-4 tracking-wider">PROMOTE ADMINISTRATOR</h3>
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-space text-[10px] text-zinc-500 uppercase">ENTER ADMIN EMAIL ADDRESS</label>
                <input
                  type="email"
                  required
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="raw-input px-3 py-2 text-xs"
                  placeholder="e.g. inspector@chaos.in"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="raw-btn bg-zinc-800 text-zinc-400 hover:text-white px-4 py-2 text-xs"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="raw-btn bg-[#E8FF00] text-black px-4 py-2 font-bold text-xs"
                >
                  PROMPT PROMOTION
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </motion.div>
  );
};

export default SuperAdminDashboard;
