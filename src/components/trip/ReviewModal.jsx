import { useState } from 'react'
import { Star, X } from 'lucide-react'
import { supabase } from '../../lib/supabase.js'
import { useAuth } from '../../context/AuthContext.jsx'
import Avatar from '../ui/Avatar.jsx'
import Button from '../ui/Button.jsx'

export default function ReviewModal({ isOpen, onClose, reviewee, tripId, onReviewed }) {
  const { user } = useAuth()
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  if (!isOpen) return null

  async function handleSubmit() {
    if (rating === 0) return
    setLoading(true)
    const { error } = await supabase.from('reviews').insert({
      reviewer_id: user.id,
      reviewee_id: reviewee.id,
      trip_id: tripId,
      rating,
      text: text.trim() || null,
    })
    setLoading(false)
    if (!error) {
      setDone(true)
      onReviewed?.()
      setTimeout(() => {
        setDone(false)
        setRating(0)
        setText('')
        onClose()
      }, 1500)
    }
  }

  const starLabels = ['', 'Malo', 'Regular', 'Bien', 'Muy bien', 'Excelente']
  const activeRating = hover || rating

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="bg-white w-full max-w-[430px] rounded-t-3xl px-5 pt-5 pb-[calc(1.5rem+var(--safe-bottom))]">
        {/* Handle */}
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />

        {done ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-3">🎉</div>
            <p className="font-bold text-slate-800 text-lg">¡Reseña enviada!</p>
            <p className="text-slate-500 text-sm mt-1">Gracias por calificar el viaje</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">Calificar a {reviewee?.name?.split(' ')[0]}</h2>
              <button onClick={onClose} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                <X size={16} className="text-slate-500" />
              </button>
            </div>

            {/* Reviewee */}
            <div className="flex items-center gap-3 mb-6 bg-slate-50 rounded-2xl p-3">
              <Avatar src={reviewee?.avatar} name={reviewee?.name} size="md" verified={reviewee?.instagramVerified} />
              <div>
                <p className="font-semibold text-slate-800">{reviewee?.name}</p>
                <p className="text-xs text-slate-400">{reviewee?.university?.split(' - ')[0]}</p>
              </div>
            </div>

            {/* Stars */}
            <div className="flex flex-col items-center mb-6">
              <div className="flex gap-2 mb-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <button
                    key={i}
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(0)}
                    onTouchStart={() => setHover(i)}
                    onTouchEnd={() => { setRating(i); setHover(0) }}
                    onClick={() => setRating(i)}
                    className="press-effect"
                    style={{ touchAction: 'manipulation' }}
                  >
                    <Star
                      size={40}
                      className={i <= activeRating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm font-semibold text-slate-600 h-5">
                {activeRating > 0 ? starLabels[activeRating] : 'Tocá para calificar'}
              </p>
            </div>

            {/* Text */}
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Contá tu experiencia (opcional)..."
              maxLength={300}
              rows={3}
              className="w-full bg-slate-50 rounded-2xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 resize-none outline-none border border-slate-100 focus:border-indigo-300 mb-5"
            />

            <Button
              onClick={handleSubmit}
              loading={loading}
              disabled={rating === 0}
              fullWidth
              size="lg"
            >
              Enviar reseña
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
