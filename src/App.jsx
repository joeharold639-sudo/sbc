import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'

const Landing   = lazy(() => import('./pages/Landing'))
const Login     = lazy(() => import('./pages/auth/Login'))
const SignUp    = lazy(() => import('./pages/auth/SignUp'))
const KYC       = lazy(() => import('./pages/auth/KYC'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Transfers = lazy(() => import('./pages/Transfers'))
const Bitcoin   = lazy(() => import('./pages/Bitcoin'))
const Cards     = lazy(() => import('./pages/Cards'))
const Bills     = lazy(() => import('./pages/Bills'))
const Admin     = lazy(() => import('./pages/Admin'))

const PageSpinner = () => (
  <div className="min-h-screen bg-[#0b0d14] flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-[#4f7fff] border-t-transparent rounded-full animate-spin" />
  </div>
)

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-st-bg flex items-center justify-center"><div className="w-6 h-6 border-2 border-[#4f7fff] border-t-transparent rounded-full animate-spin"/></div>
  return user ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-st-bg flex items-center justify-center"><div className="w-6 h-6 border-2 border-[#4f7fff] border-t-transparent rounded-full animate-spin"/></div>
  if (!user) return <Navigate to="/login" replace />
  if (!profile?.is_admin) return <Navigate to="/dashboard" replace />
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <Suspense fallback={<PageSpinner />}>
    <Routes>
      {/* Public marketing pages */}
      <Route path="/" element={<><Header /><Landing /><Footer /></>} />

      {/* Auth pages */}
      <Route path="/login"  element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
      <Route path="/kyc"    element={<PrivateRoute><KYC /></PrivateRoute>} />

      {/* Protected app pages */}
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/transfers" element={<PrivateRoute><Transfers /></PrivateRoute>} />
      <Route path="/bitcoin"   element={<PrivateRoute><Bitcoin /></PrivateRoute>} />
      <Route path="/cards"     element={<PrivateRoute><Cards /></PrivateRoute>} />
      <Route path="/bills"     element={<PrivateRoute><Bills /></PrivateRoute>} />
      <Route path="/admin"     element={<AdminRoute><Admin /></AdminRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  )
}
