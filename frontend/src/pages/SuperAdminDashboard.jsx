import React, { useState, useEffect } from 'react';
import {
  getAdminProducts, getAdminUsers, getAuditLogs, moderateProduct,
  toggleStaffPick, banUser, unbanUser, changeUserRole,
} from '../lib/admin';
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
import toast from 'react-hot-toast';

// Recharts components imports
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, LineChart, Line, BarChart, Bar 
} from 'recharts';

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Real data state
  const [productsList, setProductsList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load data on tab change
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (activeTab === 'listings' || activeTab === 'rewards') {
        const data = await getAdminProducts();
        setProductsList(data);
      } else if (activeTab === 'users' || activeTab === 'admins') {
        const data = await getAdminUsers();
        setUsersList(data);
      } else if (activeTab === 'audit') {
        const data = await getAuditLogs();
        setAuditLogs(data);
      }
      setLoading(false);
    };
    load();
  }, [activeTab]);

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
  const handleUpdateStatus = async (productId, newStatus) => {
    const { error } = await moderateProduct(productId, newStatus);
    if (!error) {
      setProductsList((prev) => prev.map((p) => p.id === productId ? { ...p, status: newStatus } : p));
      toast.success(`Listing ${newStatus}`);
    }
  };

  const handleToggleStaffPick = async (productId, current) => {
    const { error } = await toggleStaffPick(productId, !current);
    if (!error) {
      setProductsList((prev) => prev.map((p) => p.id === productId ? { ...p, is_staff_pick: !current } : p));
      toast.success(current ? 'Staff pick removed' : 'Staff pick applied ⭐');
    }
  };

  // Actions for Users
  const handleToggleUserBan = async (userId, isBanned) => {
    const fn = isBanned ? unbanUser : banUser;
    const { error } = await fn(userId);
    if (!error) {
      setUsersList((prev) => prev.map((u) => u.id === userId ? { ...u, is_banned: !isBanned } : u));
      toast.success(isBanned ? 'User unbanned' : 'User banned');
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    const { error } = await changeUserRole(userId, newRole);
    if (!error) {
      setUsersList((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
      toast.success(`Role set to ${newRole}`);
    }
  };

  // Admin management (UI-only for now)
  const [adminsList, setAdminsList] = useState([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddAdmin = (e) => {
    e.preventDefault();
    if (!newAdminEmail) return;
    toast('To promote to admin, use the Users tab to change their role.');
    setNewAdminEmail('');
    setShowAddModal(false);
  };

  const handleRemoveAdmin = (id) => {
    setAdminsList((prev) => prev.filter((a) => a.id !== id));
  };

  // Stats (static estimates — real stats from admin overview if desired)
  const stats = [
    { title: 'TOTAL USERS', value: usersList.length || '—', icon: Users, change: '' },
    { title: 'ACTIVE LISTINGS', value: productsList.length || '—', icon: Tag, change: '' },
    { title: 'LIVE BIDS', value: productsList.filter((p) => p.status === 'active').length || '—', icon: Hammer, change: '' },
    { title: 'ACTIVE ORDERS', value: '—', icon: CreditCard, change: '' },
  ];

  const getSellerUsername = (product) => product.seller?.username || 'anonymous';

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
              {loading ? (
                <div className="space-y-2">{[1,2,3].map(i=><div key={i} className="h-12 bg-zinc-900 animate-pulse"/>)}</div>
              ) : (
              <AdminTable headers={['Image', 'Fit Title', 'Seller', 'High Bid', 'Condition', 'Status', 'Actions', 'Staff Pick']}>
                {productsList.map((product) => {
                  const currentPrice = product.current_bid || product.starting_bid;
                  return (
                    <tr key={product.id} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="px-4 py-3">
                        {product.images?.[0] && <img src={product.images[0]} alt={product.title} className="w-12 aspect-[3/4] object-cover border border-[#333]" />}
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#F5F0E8] max-w-[120px] truncate">{product.title}</td>
                      <td className="px-4 py-3 text-zinc-400">@{getSellerUsername(product)}</td>
                      <td className="px-4 py-3 font-mono font-bold text-[#E8FF00]">₹{currentPrice?.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3"><ConditionBadge rating={product.condition} /></td>
                      <td className="px-4 py-3 font-space text-xs">
                        <span className={`px-2 py-0.5 font-bold uppercase ${
                          product.status === 'active' ? 'bg-green-950/50 text-green-400 border border-green-900/30' :
                          product.status === 'rejected' ? 'bg-red-950/50 text-red-400 border border-red-900/30' :
                          product.status === 'flagged' ? 'bg-orange-950/50 text-orange-400 border border-orange-900/30' :
                          'bg-zinc-900 text-zinc-500 border border-zinc-800'
                        }`}>{product.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => handleUpdateStatus(product.id, 'active')} className="p-1 bg-green-950/20 hover:bg-green-950 text-green-400 border border-zinc-800"><CheckCircle size={14} /></button>
                          <button onClick={() => handleUpdateStatus(product.id, 'rejected')} className="p-1 bg-red-950/20 hover:bg-red-950 text-red-400 border border-zinc-800"><XCircle size={14} /></button>
                          <button onClick={() => handleUpdateStatus(product.id, 'flagged')} className="p-1 bg-orange-950/20 hover:bg-orange-950 text-orange-400 border border-zinc-800"><ShieldAlert size={14} /></button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleStaffPick(product.id, product.is_staff_pick)}
                          className={`px-3 py-1 font-bebas text-xs tracking-wider transition-colors ${
                            product.is_staff_pick ? 'bg-[#E8FF00] text-black font-bold' : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-white'
                          }`}
                        >
                          {product.is_staff_pick ? 'STAFF PICK!' : 'FEATURE'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </AdminTable>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              {loading ? (
                <div className="space-y-2">{[1,2,3].map(i=><div key={i} className="h-12 bg-zinc-900 animate-pulse"/>)}</div>
              ) : (
              <AdminTable headers={['Avatar', 'Username', 'Name', 'Role', 'Status', 'Actions']}>
                {usersList.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="px-4 py-3">
                      {user.avatar_url
                        ? <img src={user.avatar_url} alt={user.username} className="w-8 h-8 object-cover border border-[#333]" />
                        : <div className="w-8 h-8 bg-zinc-800 border border-[#333] flex items-center justify-center text-xs font-bold text-zinc-500">{user.username?.[0]?.toUpperCase()}</div>
                      }
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#F5F0E8]">@{user.username}</td>
                    <td className="px-4 py-3 text-zinc-400">{user.full_name}</td>
                    <td className="px-4 py-3">
                      <select value={user.role} onChange={(e) => handleChangeRole(user.id, e.target.value)} className="raw-input text-xs px-2 py-1 bg-black border-zinc-800">
                        <option value="user">USER</option>
                        <option value="admin">ADMIN</option>
                        <option value="superadmin">SUPERADMIN</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 font-space text-xs">
                      <span className={`px-2 py-0.5 font-bold uppercase ${
                        user.is_banned ? 'bg-red-950/50 text-red-500 border border-red-900/30' : 'bg-green-950/50 text-green-400 border border-green-900/30'
                      }`}>
                        {user.is_banned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleUserBan(user.id, user.is_banned)}
                        className={`flex items-center gap-1.5 px-3 py-1 font-bebas text-xs tracking-wider border transition-colors ${
                          user.is_banned
                            ? 'bg-green-900/20 text-green-400 border-green-900 hover:bg-green-900/50'
                            : 'bg-red-900/20 text-red-400 border-red-900 hover:bg-red-900/50'
                        }`}
                      >
                        <Ban size={12} />
                        {user.is_banned ? 'UNBAN' : 'BAN'}
                      </button>
                    </td>
                  </tr>
                ))}
              </AdminTable>
              )}
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

          {activeTab === 'audit' && (
            <div className="space-y-6">
              <div className="mb-6">
                <span className="font-space text-xs text-zinc-500 uppercase block mb-1">HISTORY LOG DECK</span>
                <h3 className="font-bebas text-2xl text-[#F5F0E8] uppercase tracking-wider">STAFF AUDIT LOGGING</h3>
              </div>
              {loading ? (
                <div className="space-y-2">{[1,2,3,4].map(i=><div key={i} className="h-10 bg-zinc-900 animate-pulse"/>)}</div>
              ) : auditLogs.length === 0 ? (
                <p className="font-space text-sm text-zinc-600 uppercase">No audit logs found.</p>
              ) : (
              <AdminTable headers={['Timestamp', 'Admin', 'Action', 'Target']}>
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-zinc-500">
                      {new Date(log.created_at || log.time).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#F5F0E8]">{log.admin?.username || log.admin || '—'}</td>
                    <td className="px-4 py-3 font-space text-xs text-[#C8B8A2] uppercase font-bold">{log.action}</td>
                    <td className="px-4 py-3 text-zinc-400 font-mono text-xs">{log.target_id || log.target || '—'}</td>
                  </tr>
                ))}
              </AdminTable>
              )}
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
