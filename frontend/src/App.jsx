import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'
import NavBar from './components/ui/NavBar'
import LandingPage from './pages/LandingPage'
import StorePage from './pages/StorePage'
import ProductDetailPage from './pages/ProductDetailPage'
import ProfilePage from './pages/ProfilePage'
import SellPage from './pages/SellPage'
import AuthPage from './pages/AuthPage'
import AdminDashboard from './pages/AdminDashboard'
import SuperAdminDashboard from './pages/SuperAdminDashboard'
import OrderPage from './pages/OrderPage'
import LeaderboardPage from './pages/LeaderboardPage'
import { AnimatePresence } from 'framer-motion'

// ── Loading Spinner ────────────────────────────────────────────
const FullPageLoader = () => (
  <div className="w-full min-h-screen bg-[#0D0D0D] flex items-center justify-center">
    <div className="text-center">
      <div className="w-8 h-8 border-2 border-[#E8FF00] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <span className="font-bebas text-xl text-zinc-600 tracking-widest">LOADING...</span>
    </div>
  </div>
)

// ── 403 Unauthorized Page ──────────────────────────────────────
const UnauthorizedPage = () => (
  <div className="w-full min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center text-center p-6 pt-24">
    <span className="font-bebas text-7xl text-[#E8FF00] mb-2">403</span>
    <h2 className="font-bebas text-4xl text-[#F5F0E8] mb-4 uppercase">Access Denied</h2>
    <p className="font-space text-zinc-400 text-sm max-w-sm mb-8 uppercase tracking-wider">
      You don't have clearance for this zone.
    </p>
    <a href="/" className="raw-btn bg-[#E8FF00] text-black px-6 py-3 text-xs font-bold tracking-widest uppercase">
      BACK TO HOME
    </a>
  </div>
)

// ── Protected Route: requires login ───────────────────────────
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth()
  if (loading) return <FullPageLoader />
  if (!isLoggedIn) return <Navigate to="/auth" replace />
  return children
}

// ── Admin Route: requires admin or superadmin role ─────────────
const AdminRoute = ({ children }) => {
  const { isLoggedIn, isAdmin, loading } = useAuth()
  if (loading) return <FullPageLoader />
  if (!isLoggedIn) return <Navigate to="/auth" replace />
  if (!isAdmin) return <UnauthorizedPage />
  return children
}

// ── SuperAdmin Route ───────────────────────────────────────────
const SuperAdminRoute = ({ children }) => {
  const { isLoggedIn, isSuperAdmin, loading } = useAuth()
  if (loading) return <FullPageLoader />
  if (!isLoggedIn) return <Navigate to="/auth" replace />
  if (!isSuperAdmin) return <UnauthorizedPage />
  return children
}

// ── Animated Routes ────────────────────────────────────────────
const AnimatedRoutes = () => {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/store" element={<StorePage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />

        {/* Protected routes */}
        <Route
          path="/sell"
          element={
            <ProtectedRoute>
              <SellPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order/:id"
          element={
            <ProtectedRoute>
              <OrderPage />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* SuperAdmin routes */}
        <Route
          path="/superadmin"
          element={
            <SuperAdminRoute>
              <SuperAdminDashboard />
            </SuperAdminRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="bg-[#0D0D0D] min-h-screen text-[#F5F0E8] flex flex-col font-space relative selection:bg-[#E8FF00] selection:text-black">
          {/* Global Navigation Bar */}
          <NavBar />

          {/* Dynamic Animated Pages */}
          <AnimatedRoutes />

          {/* Global Toast Notifications */}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#1A1A1A',
                color: '#F5F0E8',
                border: '1px solid #2A2A2A',
                borderRadius: '0',
                fontFamily: '"Space Grotesk", sans-serif',
                fontSize: '12px',
                letterSpacing: '0.05em',
              },
              success: {
                iconTheme: { primary: '#E8FF00', secondary: '#0D0D0D' },
                style: {
                  border: '1px solid rgba(232,255,0,0.2)',
                },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#0D0D0D' },
                style: {
                  border: '1px solid rgba(239,68,68,0.2)',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
