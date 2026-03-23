import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Send, ChevronLeft } from 'lucide-react'
import { supabase } from '../../lib/supabase.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useTrips } from '../../context/TripsContext.jsx'
import { useNotifications } from '../../context/NotificationsContext.jsx'
import Avatar from '../../components/ui/Avatar.jsx'

export default function ChatPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { getTripById } = useTrips()
  const { addNotification } = useNotifications()
  const [trip, setTrip] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  // Load trip info
  useEffect(() => {
    getTripById(id).then(setTrip)
  }, [id])

  // Load messages
  useEffect(() => {
    supabase
      .from('trip_messages')
      .select('*, sender:profiles!trip_messages_sender_id_fkey(id, name, avatar_url, instagram_verified)')
      .eq('trip_id', id)
      .order('created_at', { ascending: true })
      .then(({ data }) => { if (data) setMessages(data) })

    // Realtime subscription
    const channel = supabase
      .channel('chat:' + id)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'trip_messages',
        filter: `trip_id=eq.${id}`,
      }, async (payload) => {
        // Fetch sender profile for the new message
        const { data: sender } = await supabase
          .from('profiles')
          .select('id, name, avatar_url, instagram_verified')
          .eq('id', payload.new.sender_id)
          .single()
        setMessages(prev => [...prev, { ...payload.new, sender }])
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [id])

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e) {
    e.preventDefault()
    if (!text.trim() || sending) return
    setSending(true)
    const msgText = text.trim()
    const { error } = await supabase.from('trip_messages').insert({
      trip_id: id,
      sender_id: user.id,
      text: msgText,
    })
    if (!error) {
      setText('')
      // Notificar a todos los miembros del viaje excepto al que escribió
      if (trip) {
        const members = [trip.driverId, ...(trip.passengerIds || [])].filter(uid => uid && uid !== user.id)
        const preview = msgText.length > 40 ? msgText.slice(0, 40) + '...' : msgText
        for (const uid of members) {
          await addNotification({
            recipientId: uid,
            type: 'chat_message',
            tripId: id,
            actorId: user.id,
            message: `${user.name} escribió en el chat: "${preview}"`,
            actions: [],
          })
        }
      }
    }
    setSending(false)
  }

  const tripName = trip ? `${trip.origin?.label?.split(',')[0]} → ${trip.destination?.label?.split(',')[0]}` : 'Chat del viaje'

  return (
    <div className="min-h-dvh bg-[#f5f6ff] flex flex-col">
      {/* Header */}
      <div className="gradient-bg-br px-4 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center press-effect flex-shrink-0">
          <ChevronLeft size={20} className="text-white" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold truncate">{tripName}</p>
          <p className="text-indigo-200 text-xs">Chat del viaje</p>
        </div>
        {trip?.driver && (
          <Avatar src={trip.driver.avatar} name={trip.driver.name} size="sm" verified={trip.driver.instagramVerified} />
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 pb-24">
        {messages.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-slate-500 text-sm">Nadie ha escrito todavía</p>
            <p className="text-slate-400 text-xs mt-1">¡Rompé el hielo!</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_id === user?.id
          const senderName = msg.sender?.name || 'Usuario'
          const senderAvatar = msg.sender?.avatar_url
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
              {!isMe && (
                <img
                  src={senderAvatar}
                  alt={senderName}
                  className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                  onError={e => e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(senderName)}&background=6366f1&color=fff&size=28`}
                />
              )}
              <div className={`max-w-[72%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                {!isMe && (
                  <span className="text-[10px] text-slate-400 ml-1">{senderName}</span>
                )}
                <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                  isMe
                    ? 'gradient-bg text-white rounded-br-sm'
                    : 'bg-white text-slate-800 rounded-bl-sm card-shadow'
                }`}>
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-400 mx-1">
                  {new Date(msg.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-slate-100 px-4 py-3 pb-[calc(0.75rem+var(--safe-bottom))]">
        <form onSubmit={handleSend} className="flex items-center gap-3">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Escribí un mensaje..."
            className="flex-1 bg-slate-50 rounded-2xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 border border-slate-200"
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="w-11 h-11 gradient-bg rounded-2xl flex items-center justify-center press-effect disabled:opacity-40 flex-shrink-0"
          >
            <Send size={18} className="text-white" />
          </button>
        </form>
      </div>
    </div>
  )
}
