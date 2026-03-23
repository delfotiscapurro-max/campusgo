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
    <div className="min-h-dvh flex flex-col items-center justify-center gradient-bg relative overflow-hidden">
      {/* Círculos decorativos de fondo */}
      <div className="absolute top-[-60px] right-[-60px] w-52 h-52 bg-white/10 rounded-full" />
      <div className="absolute bottom-[-80px] left-[-40px] w-64 h-64 bg-white/10 rounded-full" />
      <div className="absolute top-1/3 left-[-30px] w-24 h-24 bg-white/5 rounded-full" />

      {/* Logo */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Ícono animado */}
        <div className="relative">
          <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center animate-pulse">
            <svg viewBox="0 0 64 64" className="w-14 h-14" fill="none">
              {/* Carretera */}
              <rect x="8" y="44" width="48" height="8" rx="4" fill="white" opacity="0.3"/>
              <rect x="29" y="45" width="6" height="2" rx="1" fill="white" opacity="0.6"/>
              {/* Auto */}
              <rect x="14" y="30" width="36" height="16" rx="5" fill="white" opacity="0.95"/>
              <rect x="20" y="23" width="24" height="12" rx="4" fill="white" opacity="0.7"/>
              {/* Ventanas */}
              <rect x="22" y="25" width="8" height="7" rx="2" fill="#6366f1" opacity="0.6"/>
              <rect x="34" y="25" width="8" height="7" rx="2" fill="#6366f1" opacity="0.6"/>
              {/* Ruedas */}
              <circle cx="22" cy="47" r="5" fill="#4f46e5"/>
              <circle cx="22" cy="47" r="2.5" fill="white" opacity="0.5"/>
              <circle cx="42" cy="47" r="5" fill="#4f46e5"/>
              <circle cx="42" cy="47" r="2.5" fill="white" opacity="0.5"/>
            </svg>
          </div>
          {/* Líneas de velocidad */}
          <div className="absolute -left-6 top-1/2 -translate-y-1/2 flex flex-col gap-1.5">
            <div className="h-0.5 bg-white/40 rounded-full animate-pulse" style={{width:'18px', animationDelay:'0s'}}/>
            <div className="h-0.5 bg-white/40 rounded-full animate-pulse" style={{width:'12px', animationDelay:'0.15s'}}/>
            <div className="h-0.5 bg-white/40 rounded-full animate-pulse" style={{width:'16px', animationDelay:'0.3s'}}/>
          </div>
        </div>

        {/* Nombre */}
        <div className="text-center">
          <h1 className="text-3xl font-black text-white tracking-tight">CampusGo</h1>
          <p className="text-indigo-200 text-sm mt-1">Viajes universitarios 🎓</p>
        </div>

        {/* Puntitos de carga */}
        <div className="flex gap-2 mt-2">
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
