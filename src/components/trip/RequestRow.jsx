import { Check, X, Star, Instagram } from 'lucide-react'
import Avatar from '../ui/Avatar.jsx'
import Button from '../ui/Button.jsx'

export default function RequestRow({ user, onAccept, onDeny, loading }) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-2xl p-3 card-shadow">
      <Avatar src={user.avatar} name={user.name} size="md" verified={user.instagramVerified} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-800 text-sm truncate">{user.name}</span>
          {user.instagramVerified && (
            <Instagram size={12} className="text-violet-500 flex-shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <div className="flex items-center gap-0.5">
            <Star size={11} className="text-amber-400 fill-amber-400" />
            <span className="text-xs text-slate-500">{user.rating?.toFixed(1)}</span>
          </div>
          <span className="text-slate-300 text-xs">·</span>
          <span className="text-xs text-slate-500 truncate">{user.university?.split(' - ')[1] || user.university}</span>
        </div>
        <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
          <span>🚗 {user.tripsAsPassenger} viajes como pasajero</span>
        </div>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={onDeny}
          disabled={loading}
          className="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center press-effect"
        >
          <X size={16} className="text-rose-500" />
        </button>
        <button
          onClick={onAccept}
          disabled={loading}
          className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center press-effect"
        >
          <Check size={16} className="text-white" />
        </button>
      </div>
    </div>
  )
}
