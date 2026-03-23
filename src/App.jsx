import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { TripsProvider } from './context/TripsContext.jsx'
import { NotificationsProvider } from './context/NotificationsContext.jsx'
import AppShell from './components/layout/AppShell.jsx'
import BottomNav from './components/layout/BottomNav.jsx'

import LoginPage from './pages/auth/LoginPage.jsx'
import RegisterPage from './pages/auth/RegisterPage.jsx'
import HomePage from './pages/home/HomePage.jsx'
import DiscoverPage from './pages/discover/DiscoverPage.jsx'
import PublishPage from './pages/publish/PublishPage.jsx'
import DashboardPage from './pages/dashboard/DashboardPage.jsx'
import ProfilePage from './pages/profile/ProfilePage.jsx'
import TripDetailPage from './pages/trip/TripDetailPage.jsx'
import ChatPage from './pages/trip/ChatPage.jsx'
import NotificationsPage from './pages/notifications/NotificationsPage.jsx'

function LoadingScreen() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gradient-bg-br relative overflow-hidden">
      {/* Círculos decorativos */}
      <div className="absolute top-[-80px] right-[-80px] w-64 h-64 bg-white/10 rounded-full" />
      <div className="absolute bottom-[-100px] left-[-60px] w-72 h-72 bg-white/10 rounded-full" />
      <div className="absolute top-1/2 right-[-50px] w-40 h-40 bg-white/5 rounded-full" />

      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Ícono animado */}
        <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center animate-pulse">
          <svg viewBox="0 0 64 64" className="w-20 h-20" fill="none">
            {/* Carretera */}
            <rect x="6" y="46" width="52" height="8" rx="4" fill="white" opacity="0.3"/>
            <rect x="28" y="48" width="8" height="2" rx="1" fill="white" opacity="0.6"/>
            {/* Auto */}
            <rect x="10" y="30" width="44" height="18" rx="6" fill="white" opacity="0.95"/>
            <rect x="17" y="20" width="30" height="14" rx="5" fill="white" opacity="0.75"/>
            {/* Ventanas */}
            <rect x="19" y="22" width="11" height="9" rx="2.5" fill="#6366f1" opacity="0.55"/>
            <rect x="34" y="22" width="11" height="9" rx="2.5" fill="#6366f1" opacity="0.55"/>
            {/* Ruedas */}
            <circle cx="20" cy="49" r="6" fill="#4f46e5"/>
            <circle cx="20" cy="49" r="3" fill="white" opacity="0.5"/>
            <circle cx="44" cy="49" r="6" fill="#4f46e5"/>
            <circle cx="44" cy="49" r="3" fill="white" opacity="0.5"/>
          </svg>
        </div>

        {/* Nombre */}
        <h1 className="text-3xl font-black text-white tracking-tight">CampusGo</h1>

        {/* Puntitos de carga */}
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 bg-white rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <LoadingScreen />

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to={isAuthenticated ? '/home' : '/login'} replace />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/home" replace /> : <LoginPage />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/home" replace /> : <RegisterPage />} />

        <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/discover" element={<ProtectedRoute><DiscoverPage /></ProtectedRoute>} />
        <Route path="/publish" element={<ProtectedRoute><PublishPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/profile/:userId" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/trip/:id" element={<ProtectedRoute><TripDetailPage /></ProtectedRoute>} />
        <Route path="/trip/:id/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {isAuthenticated && (
        <Routes>
          <Route path="/login" element={null} />
          <Route path="/register" element={null} />
          <Route path="/trip/:id" element={null} />
          <Route path="/trip/:id/chat" element={null} />
          <Route path="*" element={<BottomNav />} />
        </Routes>
      )}
    </AppShell>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TripsProvider>
          <NotificationsProvider>
            <AppRoutes />
          </NotificationsProvider>
        </TripsProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
