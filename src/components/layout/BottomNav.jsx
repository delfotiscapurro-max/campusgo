import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Map, Plus, LayoutDashboard, User } from 'lucide-react'

const tabs = [
  { to: '/home', icon: Home, label: 'Inicio' },
  { to: '/discover', icon: Map, label: 'Explorar' },
  { to: '/publish', icon: Plus, label: '', isFab: true },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Mis viajes' },
  { to: '/profile', icon: User, label: 'Perfil' },
]

export default function BottomNav() {
  const navigate = useNavigate()

  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around h-[72px] px-2">
        {tabs.map((tab) =>
          tab.isFab ? (
            <button
              key={tab.to}
              onClick={() => navigate(tab.to)}
              className="relative -mt-6 w-14 h-14 rounded-full gradient-bg flex items-center justify-center shadow-lg press-effect"
              style={{ boxShadow: '0 4px 20px rgba(99,102,241,0.45)' }}
            >
              <Plus size={26} className="text-white" strokeWidth={2.5} />
            </button>
          ) : (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1 rounded-2xl transition-all ${
                  isActive
                    ? 'text-indigo-600'
                    : 'text-slate-400'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all ${isActive ? 'bg-indigo-50' : ''}`}>
                    <tab.icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                  </div>
                  <span className={`text-[10px] font-medium ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>{tab.label}</span>
                </>
              )}
            </NavLink>
          )
        )}
      </div>
    </nav>
  )
}
