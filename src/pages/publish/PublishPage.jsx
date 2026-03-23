import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Clock, Users, DollarSign, Navigation, ChevronLeft, Check, Car, Bus } from 'lucide-react'
import { useTrips } from '../../context/TripsContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import AddressInput from '../../components/ui/AddressInput.jsx'
import { UNIVERSITIES } from '../../data/universities.js'

const RADII = [1, 2, 3, 5, 8, 10]

export default function PublishPage() {
  const navigate = useNavigate()
  const { publishTrip, isLoading } = useTrips()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    type: 'offer',
    direction: 'to_uni',
    origin: { label: '', lat: -34.59, lng: -58.44 },
    destination: { label: '', lat: -34.54, lng: -58.45 },
    date: new Date().toISOString().slice(0, 10),
    time: '07:30',
    seats: { total: '', available: '' },
    radiusKm: 2,
    price: '',
    description: '',
    tags: [],
  })
  const [published, setPublished] = useState(false)

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const TAGS_OPTIONS = ['puntual', 'AC', 'música suave', 'no fumar', 'silencioso', 'mascotas ok', 'buena onda', 'playlist en Spotify']

  function toggleTag(tag) {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }))
  }

  async function handlePublish() {
    const depAt = new Date(`${form.date}T${form.time}:00`).toISOString()
    await publishTrip({ ...form, departureAt: depAt }, user.id)
    setPublished(true)
  }

  if (published) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-[#f5f6ff] px-6 text-center page-enter">
        <div className="gradient-bg w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg" style={{ boxShadow: '0 8px 32px rgba(99,102,241,0.4)' }}>
          <Check size={36} className="text-white" strokeWidth={3} />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-800 mb-2">¡Viaje publicado! 🎉</h2>
        <p className="text-slate-500 mb-2">Tu viaje ya está visible para todos los universitarios cerca tuyo</p>
        <p className="text-indigo-600 font-semibold text-sm mb-8">+50 puntos ganados ⭐</p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button onClick={() => navigate('/home')} fullWidth size="lg">Ver el feed</Button>
          <Button onClick={() => { setPublished(false); setStep(1); setForm(f => ({ ...f, description: '', tags: [] })) }} variant="secondary" fullWidth size="lg">
            Publicar otro viaje
          </Button>
        </div>
      </div>
    )
  }

  const stepTitles = ['¿Cómo viajás?', 'La ruta', 'Cuándo', 'Detalles', 'Confirmá']

  return (
    <div className="min-h-dvh flex flex-col bg-[#f5f6ff]">
      {/* Header */}
      <div className="gradient-bg-br px-4 pt-14 pb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/5" />
        <div className="flex items-center gap-3 mb-4 relative z-10">
          {step > 1 ? (
            <button onClick={() => setStep(s => s - 1)} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <ChevronLeft size={18} className="text-white" />
            </button>
          ) : (
            <button onClick={() => navigate(-1)} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <ChevronLeft size={18} className="text-white" />
            </button>
          )}
          <div>
            <h1 className="text-white font-bold text-lg">{stepTitles[step - 1]}</h1>
            <p className="text-indigo-200 text-xs">Paso {step} de 5</p>
          </div>
        </div>
        <div className="relative z-10 bg-white/20 rounded-full h-1.5">
          <div className="bg-white rounded-full h-1.5 transition-all duration-500" style={{ width: `${(step / 5) * 100}%` }} />
        </div>
      </div>

      <div className="flex-1 px-4 pt-6 pb-32 overflow-x-hidden">
        {/* Step 1: Role */}
        {step === 1 && (
          <div className="flex flex-col gap-4 page-enter">
            <p className="text-slate-500 text-sm">¿Ofrecés un lugar en tu auto o buscás que te lleven?</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => update('type', 'offer')}
                className={`w-full p-5 rounded-3xl flex items-center gap-4 border-2 transition-all press-effect ${form.type === 'offer' ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-white'}`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${form.type === 'offer' ? 'gradient-bg' : 'bg-slate-100'}`}>
                  <Car size={26} className={form.type === 'offer' ? 'text-white' : 'text-slate-400'} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-800">Soy conductor 🗝️</p>
                  <p className="text-sm text-slate-500">Ofrezco asientos en mi auto</p>
                </div>
                {form.type === 'offer' && <div className="ml-auto w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center"><Check size={14} className="text-white" /></div>}
              </button>
              <button
                onClick={() => update('type', 'request')}
                className={`w-full p-5 rounded-3xl flex items-center gap-4 border-2 transition-all press-effect ${form.type === 'request' ? 'border-violet-400 bg-violet-50' : 'border-slate-200 bg-white'}`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${form.type === 'request' ? 'bg-violet-500' : 'bg-slate-100'}`}>
                  <Bus size={26} className={form.type === 'request' ? 'text-white' : 'text-slate-400'} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-800">Busco viaje 🙋</p>
                  <p className="text-sm text-slate-500">Necesito que me lleven</p>
                </div>
                {form.type === 'request' && <div className="ml-auto w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center"><Check size={14} className="text-white" /></div>}
              </button>
            </div>
            <Button onClick={() => setStep(2)} fullWidth size="lg">Continuar</Button>
          </div>
        )}

        {/* Step 2: Route */}
        {step === 2 && (
          <div className="flex flex-col gap-4 page-enter">
            {/* Direction toggle */}
            <div className="flex bg-slate-100 rounded-2xl p-1">
              <button
                onClick={() => { update('direction', 'to_uni'); update('origin', { label: '', lat: -34.59, lng: -58.44 }); update('destination', { label: '', lat: -34.54, lng: -58.45 }) }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${form.direction === 'to_uni' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
              >
                🏠 → 🎓 Voy a la facu
              </button>
              <button
                onClick={() => { update('direction', 'from_uni'); update('origin', { label: '', lat: -34.54, lng: -58.45 }); update('destination', { label: '', lat: -34.59, lng: -58.44 }) }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${form.direction === 'from_uni' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
              >
                🎓 → 🏠 Salgo de la facu
              </button>
            </div>

            {form.direction === 'to_uni' ? (
              <>
                <AddressInput
                  label="Punto de partida"
                  placeholder="Ej: Av. Corrientes 1234, Palermo..."
                  value={form.origin.label}
                  onChange={suggestion => update('origin', suggestion)}
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Destino (universidad)</label>
                  <select
                    value={form.destination.label}
                    onChange={e => update('destination', { label: e.target.value, lat: -34.54, lng: -58.45 })}
                    className="w-full bg-white rounded-2xl border border-slate-200 px-4 py-3.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  >
                    <option value="">Seleccioná la universidad</option>
                    {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Punto de partida (universidad)</label>
                  <select
                    value={form.origin.label}
                    onChange={e => update('origin', { label: e.target.value, lat: -34.54, lng: -58.45 })}
                    className="w-full bg-white rounded-2xl border border-slate-200 px-4 py-3.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  >
                    <option value="">Seleccioná la universidad</option>
                    {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <AddressInput
                  label="Destino"
                  placeholder="Ej: Av. Corrientes 1234, Palermo..."
                  value={form.destination.label}
                  onChange={suggestion => update('destination', suggestion)}
                />
              </>
            )}
            {form.type === 'offer' && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">Radio de recogida: <span className="text-indigo-600">{form.radiusKm}km</span></label>
                <p className="text-xs text-slate-400">Distancia máxima a la que podés ir a buscar pasajeros desde tu origen</p>
                <div className="flex gap-2 flex-wrap">
                  {RADII.map(r => (
                    <button key={r} onClick={() => update('radiusKm', r)} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all press-effect ${form.radiusKm === r ? 'gradient-bg text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
                      {r}km
                    </button>
                  ))}
                </div>
              </div>
            )}
            <Button onClick={() => setStep(3)} fullWidth size="lg" disabled={!form.origin.label || !form.destination.label}>
              Continuar
            </Button>
          </div>
        )}

        {/* Step 3: Date & Time */}
        {step === 3 && (
          <div className="flex flex-col gap-4 page-enter">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Fecha</label>
              <input type="date" value={form.date} onChange={e => update('date', e.target.value)} style={{ boxSizing: 'border-box', maxWidth: '100%' }} className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Hora de salida</label>
              <input type="time" value={form.time} onChange={e => update('time', e.target.value)} style={{ boxSizing: 'border-box', maxWidth: '100%' }} className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            {form.type === 'offer' && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">
                  Asientos para ofrecer
                  {form.seats.total === '' && <span className="text-rose-400 ml-1">*</span>}
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={form.seats.total}
                  onChange={e => { const v = e.target.value; const n = v === '' ? '' : Math.max(1, parseInt(v) || 1); update('seats', { total: n, available: n }) }}
                  className={`w-full bg-white border rounded-2xl px-4 py-3.5 text-slate-800 text-sm font-semibold text-center focus:outline-none focus:ring-2 focus:ring-indigo-300 ${form.seats.total === '' ? 'border-rose-300' : 'border-slate-200'}`}
                />
              </div>
            )}
            {form.type === 'offer' && form.seats.total === '' && (
              <p className="text-rose-500 text-xs font-medium -mt-2">Ingresá la cantidad de asientos para continuar</p>
            )}
            <Button onClick={() => setStep(4)} fullWidth size="lg" disabled={form.type === 'offer' && !form.seats.total}>Continuar</Button>
          </div>
        )}

        {/* Step 4: Details */}
        {step === 4 && (
          <div className="flex flex-col gap-4 page-enter">
            {form.type === 'offer' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">
                  Precio por persona (ARS)
                  {form.price === '' && <span className="text-rose-400 ml-1">*</span>}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">$</span>
                  <input
                    type="number"
                    value={form.price}
                    onChange={e => update('price', e.target.value === '' ? '' : Number(e.target.value))}
                    className={`w-full bg-white rounded-2xl border pl-8 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 ${form.price === '' ? 'border-rose-300' : 'border-slate-200'}`}
                    min={0}
                    step={50}
                  />
                </div>
                {form.price === '' && (
                  <p className="text-rose-500 text-xs font-medium">Ingresá el precio para continuar (puede ser $0)</p>
                )}
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Mensaje (opcional)</label>
              <textarea
                value={form.description}
                onChange={e => update('description', e.target.value)}
                placeholder="Ej: Salgo puntual, buena música, AC en verano..."
                rows={3}
                className="w-full bg-white rounded-2xl border border-slate-200 px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Características del viaje</label>
              <div className="flex flex-wrap gap-2">
                {TAGS_OPTIONS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all press-effect ${form.tags.includes(tag) ? 'gradient-bg text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={() => setStep(5)} fullWidth size="lg" disabled={form.type === 'offer' && form.price === ''}>Revisar viaje</Button>
          </div>
        )}

        {/* Step 5: Confirm */}
        {step === 5 && (
          <div className="flex flex-col gap-4 page-enter">
            <div className="bg-white rounded-3xl p-5 card-shadow">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 gradient-bg rounded-xl flex items-center justify-center">
                  {form.type === 'offer' ? <Car size={16} className="text-white" /> : <Bus size={16} className="text-white" />}
                </div>
                <span className="font-bold text-slate-800">{form.type === 'offer' ? 'Oferta de viaje' : 'Búsqueda de viaje'}</span>
              </div>
              <div className="flex flex-col gap-3 text-sm text-slate-700">
                <div className="flex justify-between"><span className="text-slate-400">Desde</span><span className="font-medium">{form.origin.label}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Hasta</span><span className="font-medium">{form.destination.label}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Fecha</span><span className="font-medium">{new Date(form.date).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Hora</span><span className="font-medium">{form.time}</span></div>
                {form.type === 'offer' && <div className="flex justify-between"><span className="text-slate-400">Asientos</span><span className="font-medium">{form.seats.total || '-'}</span></div>}
                {form.type === 'offer' && <div className="flex justify-between"><span className="text-slate-400">Precio</span><span className="font-bold text-indigo-600">{form.price !== '' ? `$${Number(form.price).toLocaleString('es-AR')} p/p` : '-'}</span></div>}
                {form.type === 'offer' && <div className="flex justify-between"><span className="text-slate-400">Radio recogida</span><span className="font-medium">{form.radiusKm}km</span></div>}
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-slate-50">
                  {form.tags.map(t => <span key={t} className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-medium">{t}</span>)}
                </div>
              )}
            </div>
            <Button onClick={handlePublish} loading={isLoading} fullWidth size="lg">
              Publicar viaje 🚀
            </Button>
            <p className="text-center text-xs text-slate-400">Al publicar aceptás los términos de CampusGo</p>
          </div>
        )}
      </div>
    </div>
  )
}
