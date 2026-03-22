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
import NotificationsPage from './pages/notifications/NotificationsPage.jsx'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { isAuthenticated } = useAuth()

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
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {isAuthenticated && (
        <Routes>
          <Route path="/login" element={null} />
          <Route path="/register" element={null} />
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
