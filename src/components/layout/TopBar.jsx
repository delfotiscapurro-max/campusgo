import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Bell } from 'lucide-react'
import { useNotifications } from '../../context/NotificationsContext.jsx'

export default function TopBar({ title, back = false, action = null, transparent = false }) {
  const navigate = useNavigate()
  const { unreadCount } = useNotifications()

  return (
    <div className={`top-bar flex items-center justify-between px-4 ${transparent ? 'bg-transparent border-none backdrop-filter-none' : ''}`}>
      <div className="flex items-center gap-2">
        {back && (
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/80 shadow-sm press-effect"
          >
            <ChevronLeft size={20} className="text-slate-700" />
          </button>
        )}
        {title && (
          <span className="font-semibold text-slate-800 text-base">{title}</span>
        )}
      </div>
      {action || (
        !back && (
          <button
            onClick={() => navigate('/notifications')}
            className="relative w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-sm press-effect"
          >
            <Bell size={18} className="text-slate-700" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center">
                <span className="text-white text-[9px] font-bold">{unreadCount > 9 ? '9+' : unreadCount}</span>
              </span>
            )}
          </button>
        )
      )}
    </div>
  )
}
