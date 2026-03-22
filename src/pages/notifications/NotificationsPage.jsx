import { useNavigate } from 'react-router-dom'
import { Bell, Check, X, ChevronRight } from 'lucide-react'
import { useNotifications } from '../../context/NotificationsContext.jsx'
import Avatar from '../../components/ui/Avatar.jsx'
import { formatRelative } from '../../utils/dateUtils.js'
import TopBar from '../../components/layout/TopBar.jsx'
import { useState } from 'react'

const typeConfig = {
  join_request: { emoji: '🚗', color: 'bg-indigo-50', border: 'border-indigo-100' },
  request_accepted: { emoji: '🎉', color: 'bg-emerald-50', border: 'border-emerald-100' },
  request_denied: { emoji: '😕', color: 'bg-rose-50', border: 'border-rose-100' },
  trip_reminder: { emoji: '⏰', color: 'bg-amber-50', border: 'border-amber-100' },
  new_rating: { emoji: '⭐', color: 'bg-violet-50', border: 'border-violet-100' },
}

export default function NotificationsPage() {
  const { notifications, markRead, markAllRead, respondToRequest, unreadCount } = useNotifications()
  const navigate = useNavigate()
  const [loadingId, setLoadingId] = useState(null)

  async function handleRespond(notifId, action) {
    setLoadingId(notifId + action)
    await respondToRequest(notifId, action)
    setLoadingId(null)
  }

  const today = notifications.filter(n => {
    const d = new Date(n.createdAt)
    const now = new Date()
    return d.toDateString() === now.toDateString()
  })
  const earlier = notifications.filter(n => {
    const d = new Date(n.createdAt)
    const now = new Date()
    return d.toDateString() !== now.toDateString()
  })

  return (
    <div className="page-content">
      <TopBar
        back
        title="Notificaciones"
        action={
          unreadCount > 0 ? (
            <button onClick={markAllRead} className="text-indigo-600 text-sm font-semibold press-effect">
              Leer todas
            </button>
          ) : null
        }
      />

      <div className="px-4 pt-4 page-enter">
        {notifications.length === 0 ? (
          <div className="text-center py-20">
            <Bell size={48} className="text-slate-200 mx-auto mb-4" />
            <p className="font-semibold text-slate-600">Sin notificaciones</p>
            <p className="text-slate-400 text-sm mt-1">Cuando alguien quiera unirse a tu viaje lo verás aquí</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {today.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Hoy</p>
                <div className="flex flex-col gap-2">
                  {today.map(n => <NotificationItem key={n.id} notif={n} onRead={markRead} onRespond={handleRespond} loadingId={loadingId} onNavigate={navigate} />)}
                </div>
              </div>
            )}
            {earlier.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Antes</p>
                <div className="flex flex-col gap-2">
                  {earlier.map(n => <NotificationItem key={n.id} notif={n} onRead={markRead} onRespond={handleRespond} loadingId={loadingId} onNavigate={navigate} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function NotificationItem({ notif, onRead, onRespond, loadingId, onNavigate }) {
  const actor = notif.actor || null
  const config = typeConfig[notif.type] || typeConfig.trip_reminder

  function handleClick() {
    if (!notif.read) onRead(notif.id)
    if (notif.tripId) onNavigate(`/trip/${notif.tripId}`)
  }

  return (
    <div
      className={`bg-white rounded-3xl p-4 card-shadow border ${config.border} ${!notif.read ? 'ring-2 ring-indigo-100' : ''} transition-all`}
    >
      <div className="flex items-start gap-3">
        {/* Icon or avatar */}
        {actor ? (
          <Avatar src={actor.avatar} name={actor.name} size="md" verified={actor.instagramVerified} />
        ) : (
          <div className={`w-12 h-12 ${config.color} rounded-2xl flex items-center justify-center flex-shrink-0 text-xl`}>
            {config.emoji}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm leading-snug ${notif.read ? 'text-slate-600' : 'text-slate-800 font-semibold'}`}>
              {notif.message}
            </p>
            {!notif.read && (
              <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-1" />
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">{formatRelative(notif.createdAt)}</p>

          {/* Action buttons for join requests */}
          {notif.actions?.length > 0 && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => onRespond(notif.id, 'deny')}
                disabled={!!loadingId}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-600 rounded-full text-sm font-semibold press-effect disabled:opacity-50"
              >
                <X size={14} />
                {loadingId === notif.id + 'deny' ? '...' : 'Rechazar'}
              </button>
              <button
                onClick={() => onRespond(notif.id, 'accept')}
                disabled={!!loadingId}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white rounded-full text-sm font-semibold press-effect disabled:opacity-50"
              >
                <Check size={14} />
                {loadingId === notif.id + 'accept' ? '...' : 'Aceptar'}
              </button>
            </div>
          )}

          {/* View trip link */}
          {notif.tripId && !notif.actions?.length && (
            <button
              onClick={handleClick}
              className="flex items-center gap-1 mt-2 text-indigo-600 text-xs font-semibold press-effect"
            >
              Ver viaje <ChevronRight size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
