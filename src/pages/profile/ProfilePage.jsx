import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Star, Car, Instagram, Settings, LogOut, Trophy, Leaf, Edit3, ChevronRight, Check, Shield, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { supabase, transformProfile } from '../../lib/supabase.js'
import Avatar from '../../components/ui/Avatar.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Button from '../../components/ui/Button.jsx'
import TopBar from '../../components/layout/TopBar.jsx'
import { UNIVERSITIES } from '../../data/universities.js'

const YEAR_OPTIONS = ['1°', '2°', '3°', '4°', '5°', '6°', 'Posgrado']

export default function ProfilePage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user: currentUser, logout, connectInstagram, updateProfile } = useAuth()
  const [showInstaModal, setShowInstaModal] = useState(false)
  const [instaHandle, setInstaHandle] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [tab, setTab] = useState('info')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const avatarInputRef = useRef(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)

  const isOwnProfile = !userId || userId === currentUser?.id
  const [otherUser, setOtherUser] = useState(null)
  const profileUser = isOwnProfile ? currentUser : otherUser

  useEffect(() => {
    if (!isOwnProfile && userId) {
      supabase.from('profiles').select('*, reviews(reviewer_id, rating, text, created_at)').eq('id', userId).single()
        .then(({ data }) => { if (data) setOtherUser(transformProfile(data)) })
    }
  }, [userId, isOwnProfile])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${currentUser.id}/avatar.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      await updateProfile({ avatar: publicUrl + '?t=' + Date.now() })
    } catch (err) {
      console.error('Avatar upload error:', err)
    }
    setUploadingAvatar(false)
  }

  const openEditModal = () => {
    setEditForm({
      name: currentUser?.name || '',
      university: currentUser?.university || '',
      career: currentUser?.career || '',
      year: currentUser?.year || '',
    })
    setShowEditModal(true)
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    await updateProfile(editForm)
    setSaving(false)
    setShowEditModal(false)
  }

  const handleConnectInstagram = async () => {
    setConnecting(true)
    await connectInstagram(instaHandle)
    setConnecting(false)
    setShowInstaModal(false)
  }

  return (
    <div className="min-h-dvh bg-[#f5f6ff]">
      {!isOwnProfile && <TopBar back title={profileUser?.name} />}

      {/* Header */}
      <div className="gradient-bg-br pt-14 pb-6 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-20 translate-x-20" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-10 -translate-x-12" />

        {isOwnProfile && (
          <div className="flex justify-between mb-2 relative z-10">
            <button onClick={openEditModal} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center press-effect">
              <Edit3 size={16} className="text-white" />
            </button>
            <button onClick={handleLogout} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center press-effect">
              <LogOut size={16} className="text-white" />
            </button>
          </div>
        )}

        <div className="flex flex-col items-center relative z-10">
          <div className="relative mb-3">
            <img
              src={profileUser?.avatar}
              alt={profileUser?.name}
              className={`w-24 h-24 rounded-full object-cover ring-4 ring-white/30 transition-opacity ${uploadingAvatar ? 'opacity-50' : ''}`}
              onError={e => e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileUser?.name || '')}&background=6366f1&color=fff&size=96`}
            />
            {uploadingAvatar && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {profileUser?.instagramVerified && (
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-pink-500 to-violet-600 rounded-full flex items-center justify-center ring-2 ring-white">
                <Instagram size={14} className="text-white" />
              </div>
            )}
            {isOwnProfile && (
              <>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute bottom-0 left-0 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md press-effect"
                >
                  <Edit3 size={12} className="text-slate-600" />
                </button>
              </>
            )}
          </div>

          <h1 className="text-2xl font-extrabold text-white">{profileUser?.name}</h1>
          <p className="text-indigo-200 text-sm mt-0.5">{profileUser?.career} · {profileUser?.year}</p>
          <p className="text-indigo-300 text-xs mt-0.5">{profileUser?.university}</p>

          {/* Rating + badges */}
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full">
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={12} className={i <= Math.round(profileUser?.rating || 0) ? 'text-amber-300 fill-amber-300' : 'text-white/30 fill-white/30'} />
              ))}
              <span className="text-white font-bold text-sm ml-1">{profileUser?.rating?.toFixed(1)}</span>
              <span className="text-indigo-200 text-xs">({profileUser?.totalRatings})</span>
            </div>
            {profileUser?.instagramVerified && (
              <div className="bg-gradient-to-r from-pink-500 to-violet-600 px-3 py-1.5 rounded-full flex items-center gap-1">
                <Instagram size={11} className="text-white" />
                <span className="text-white text-xs font-semibold">Verificado</span>
              </div>
            )}
          </div>

          {profileUser?.instagram && (
            <p className="text-indigo-200 text-sm mt-2">{profileUser.instagram}</p>
          )}
        </div>
      </div>

      {/* Stats strip */}
      <div className="mx-4 -mt-4 bg-white rounded-3xl p-4 card-shadow relative z-10">
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: profileUser?.tripsAsDriver || 0, label: 'conductor', icon: '🗝️' },
            { value: profileUser?.tripsAsPassenger || 0, label: 'pasajero', icon: '🚶' },
            { value: `${profileUser?.co2SavedKg || 0}kg`, label: 'CO₂', icon: '🌎' },
            { value: profileUser?.points?.toLocaleString() || 0, label: 'puntos', icon: '⭐' },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-0.5">
              <span className="text-base">{s.icon}</span>
              <span className="font-bold text-slate-800 text-sm">{s.value}</span>
              <span className="text-[10px] text-slate-400">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mt-4 mb-3">
        <div className="flex bg-slate-100 rounded-2xl p-1">
          {[
            { key: 'info', label: 'Info' },
            { key: 'reviews', label: `Reseñas (${profileUser?.reviews?.length || 0})` },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === t.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-32 flex flex-col gap-3">
        {tab === 'info' && (
          <>
            {/* Bio */}
            {profileUser?.bio && (
              <div className="bg-white rounded-3xl p-5 card-shadow">
                <p className="text-slate-600 text-sm leading-relaxed">"{profileUser.bio}"</p>
              </div>
            )}

            {/* Car info */}
            {profileUser?.car ? (
              <div className="bg-white rounded-3xl p-5 card-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <Car size={18} className="text-indigo-500" />
                  <span className="font-semibold text-slate-800">Mi auto</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['Marca / Modelo', `${profileUser.car.make} ${profileUser.car.model}`],
                    ['Año', profileUser.car.year],
                    ['Color', profileUser.car.color],
                    ['Asientos', profileUser.car.seats],
                  ].map(([label, value]) => (
                    <div key={label} className="bg-slate-50 rounded-2xl p-3">
                      <p className="text-xs text-slate-400 font-medium mb-0.5">{label}</p>
                      <p className="font-semibold text-slate-700 text-sm">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 bg-indigo-50 rounded-2xl px-4 py-2.5 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Patente</span>
                  <span className="font-mono font-bold text-indigo-700">{profileUser.car.plate}</span>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-5 card-shadow text-center">
                <div className="text-3xl mb-2">🚌</div>
                <p className="text-slate-500 text-sm">{isOwnProfile ? 'No tenés auto registrado' : 'Viaja como pasajero'}</p>
              </div>
            )}

            {/* Instagram verification */}
            {isOwnProfile && !profileUser?.instagramVerified && (
              <button
                onClick={() => setShowInstaModal(true)}
                className="w-full bg-gradient-to-r from-pink-500 to-violet-600 rounded-3xl p-5 flex items-center gap-4 text-left press-effect"
              >
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Instagram size={22} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white">Verificá tu cuenta</p>
                  <p className="text-pink-100 text-sm">Conectá tu Instagram y generá más confianza ✨</p>
                </div>
                <ChevronRight size={20} className="text-white/70" />
              </button>
            )}

            {/* Trust score */}
            <div className="bg-white rounded-3xl p-5 card-shadow">
              <p className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Shield size={16} className="text-indigo-500" /> Puntaje de confianza
              </p>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Email universitario verificado', done: profileUser?.emailVerified },
                  { label: 'Instagram verificado', done: profileUser?.instagramVerified },
                  { label: 'Foto de perfil', done: !!profileUser?.avatar },
                  { label: '5+ reseñas positivas', done: (profileUser?.totalRatings || 0) >= 5 },
                  { label: '10+ viajes completados', done: (profileUser?.tripsAsDriver || 0) + (profileUser?.tripsAsPassenger || 0) >= 10 },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                      {item.done ? <Check size={12} className="text-emerald-600" /> : <span className="w-2 h-2 rounded-full bg-slate-300" />}
                    </div>
                    <span className={`text-sm ${item.done ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === 'reviews' && (
          <>
            {profileUser?.reviews?.length > 0 ? (
              profileUser.reviews.map((r, i) => (
                <div key={i} className="bg-white rounded-3xl p-5 card-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-700 text-sm">{r.author}</span>
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={12} className={s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm">"{r.text}"</p>
                  <p className="text-xs text-slate-400 mt-2">{new Date(r.date).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">⭐</div>
                <p className="text-slate-500 text-sm">Aún no hay reseñas</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit profile bottom sheet */}
      {showEditModal && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setShowEditModal(false)} />
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white rounded-t-3xl z-50 px-5 pt-4 pb-[calc(2rem+var(--safe-bottom))]">
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">Editar perfil</h2>
              <button onClick={() => setShowEditModal(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                <X size={16} className="text-slate-500" />
              </button>
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto max-h-[50vh] pb-1">
              {/* Nombre */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Nombre</label>
                <input
                  value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="Tu nombre completo"
                />
              </div>

              {/* Universidad */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Universidad / Facultad</label>
                <div className="relative">
                  <select
                    value={editForm.university}
                    onChange={e => setEditForm(f => ({ ...f, university: e.target.value }))}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    <option value="">Seleccioná tu facultad</option>
                    {UNIVERSITIES.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </div>
              </div>

              {/* Carrera */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Carrera</label>
                <input
                  value={editForm.career}
                  onChange={e => setEditForm(f => ({ ...f, career: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="Ej: Ingeniería en Sistemas"
                />
              </div>

              {/* Año */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Año</label>
                <div className="flex gap-2 flex-wrap">
                  {YEAR_OPTIONS.map(y => (
                    <button
                      key={y}
                      onClick={() => setEditForm(f => ({ ...f, year: y }))}
                      className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${editForm.year === y ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-600'}`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={saving || !editForm.name}
              className="w-full gradient-bg text-white py-3.5 rounded-2xl font-bold text-sm disabled:opacity-50 mt-4"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </>
      )}

      {/* Instagram modal */}
      {showInstaModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 px-4 pb-8">
          <div className="bg-white rounded-3xl w-full max-w-[430px] p-6 fade-in">
            <h3 className="text-lg font-bold text-slate-800 mb-1">Conectar Instagram</h3>
            <p className="text-slate-500 text-sm mb-4">Ingresá tu usuario para verificar tu identidad</p>
            <input
              value={instaHandle}
              onChange={e => setInstaHandle(e.target.value.startsWith('@') ? e.target.value : '@' + e.target.value)}
              placeholder="@tu_usuario"
              className="w-full bg-slate-50 rounded-2xl border border-slate-200 px-4 py-3.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <div className="flex gap-3">
              <Button onClick={() => setShowInstaModal(false)} variant="secondary" fullWidth>Cancelar</Button>
              <Button onClick={handleConnectInstagram} loading={connecting} fullWidth disabled={!instaHandle}>Verificar ✓</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
