import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/ui/Footer';
import { motion } from 'framer-motion';
import { KeyRound, Mail, User, ShieldCheck, Globe, Smartphone } from 'lucide-react';

const AuthPage = () => {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '';

  // Mode state: 'login' | 'signup'
  const [mode, setMode] = useState('login');

  // Fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'login') {
      if (!email || !password) {
        setError("Please fill all details.");
        return;
      }
      // Simulate login
      const loggedUser = login(email, password);
      // Redirect
      navigate(redirect ? `/${redirect}` : `/profile/${loggedUser.username}`);
    } else {
      if (!username || !email || !password || !confirmPassword) {
        setError("Please fill all details.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      // Simulate signup
      const loggedUser = signup(username, email, password);
      // Redirect
      navigate(redirect ? `/${redirect}` : `/profile/${loggedUser.username}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="grain-overlay w-full min-h-screen bg-black flex flex-col pt-24 justify-between"
    >
      <div className="flex-grow flex items-center justify-center py-12 px-4">
        
        {/* Centered Auth Card */}
        <div className="w-full max-w-md bg-[#1A1A1A] border border-[#2A2A2A] p-8 shadow-[8px_8px_0px_rgba(200,184,162,0.15)] relative">
          
          {/* Top yellow banner highlight */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#E8FF00]" />

          {/* Heading */}
          <div className="text-center mb-8">
            <span className="font-bebas text-3xl tracking-wider text-[#F5F0E8] uppercase block">
              COZA-STORE MEMBERSHIP
            </span>
            <p className="font-space text-zinc-500 text-xs mt-1 uppercase">
              Join the club to bid, list, and buy rare streetwear garments
            </p>
          </div>

          {/* Toggle Switch Tabs */}
          <div className="flex border-b border-zinc-800 mb-6 relative">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 text-center py-2.5 font-bebas text-lg tracking-wider transition-colors ${
                mode === 'login' ? 'text-[#E8FF00]' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              LOGIN
            </button>
            <button
              onClick={() => { setMode('signup'); setError(''); }}
              className={`flex-1 text-center py-2.5 font-bebas text-lg tracking-wider transition-colors ${
                mode === 'signup' ? 'text-[#E8FF00]' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              SIGN UP
            </button>

            {/* Underline Slider animation */}
            <motion.div
              className="absolute bottom-0 h-0.5 bg-[#E8FF00]"
              initial={false}
              animate={{
                left: mode === 'login' ? '0%' : '50%',
                width: '50%'
              }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-950/30 border border-red-900/40 p-2.5 text-red-500 font-space text-xs uppercase text-center flex items-center justify-center gap-1.5">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {mode === 'signup' && (
              <div className="flex flex-col gap-1">
                <label className="font-space text-[10px] tracking-wider text-zinc-500 uppercase">USERNAME HANDLE</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full raw-input pl-9 pr-3 py-2 text-xs uppercase"
                    placeholder="deadstock.dev"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="font-space text-[10px] tracking-wider text-zinc-500 uppercase">EMAIL ADDRESS</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full raw-input pl-9 pr-3 py-2 text-xs"
                  placeholder="name@domain.com"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-space text-[10px] tracking-wider text-zinc-500 uppercase">PASSWORD</label>
              <div className="relative">
                <KeyRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full raw-input pl-9 pr-3 py-2 text-xs"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div className="flex flex-col gap-1">
                <label className="font-space text-[10px] tracking-wider text-zinc-500 uppercase">CONFIRM PASSWORD</label>
                <div className="relative">
                  <KeyRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full raw-input pl-9 pr-3 py-2 text-xs"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full raw-btn py-3 bg-[#E8FF00] hover:bg-[#F5F0E8] text-black font-extrabold tracking-widest text-sm shadow-[4px_4px_0px_rgba(255,255,255,1)]"
            >
              {mode === 'login' ? 'ENTER THE STORE' : 'REGISTER MEMBERSHIP'}
            </button>

          </form>

          {/* Social Logins divider */}
          <div className="my-6 flex items-center justify-between gap-4">
            <div className="h-[1px] bg-zinc-800 flex-grow" />
            <span className="font-space text-[9px] text-zinc-600 uppercase tracking-widest shrink-0">OR RUN VIA KEYS</span>
            <div className="h-[1px] bg-zinc-800 flex-grow" />
          </div>

          {/* OAuth Placeholders */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => alert("Google sign in initialized (simulated click).")}
              className="flex items-center justify-center gap-2 p-2 bg-transparent border border-zinc-800 hover:border-zinc-500 font-space text-[10px] text-zinc-400 uppercase tracking-wider"
            >
              <Globe size={12} />
              GOOGLE
            </button>
            <button
              type="button"
              onClick={() => alert("Apple authentication initialized (simulated click).")}
              className="flex items-center justify-center gap-2 p-2 bg-transparent border border-zinc-800 hover:border-zinc-500 font-space text-[10px] text-zinc-400 uppercase tracking-wider"
            >
              <Smartphone size={12} />
              APPLE ID
            </button>
          </div>

          {/* Demo Login Assist Alert */}
          <div className="mt-6 p-3 bg-zinc-900 border border-zinc-850 flex items-start gap-2 text-[10px] font-space text-zinc-500">
            <ShieldCheck size={16} className="text-[#C8B8A2] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-zinc-400">DEVELOPMENT LOG PASS ASSIST:</p>
              <p>Type any email (e.g. <span className="text-[#C8B8A2]">deadstock.dev@thrift.in</span>) + any password to instantly login with a pre-configured mock profile.</p>
            </div>
          </div>

        </div>

      </div>

      {/* Footer */}
      <Footer />
    </motion.div>
  );
};

export default AuthPage;
