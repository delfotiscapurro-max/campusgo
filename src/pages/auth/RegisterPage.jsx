import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, GraduationCap, Car, Instagram, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'

import { UNIVERSITIES } from '../../data/universities.js'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', email: '', password: '', university: '', career: '', year: '',
    instagram: '', hasCar: false,
    car: { make: '', model: '', year: '', color: '', plate: '', seats: 4 },
  })

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    setIsLoading(true)
    setError('')
    try {
      await register(form)
      navigate('/home', { replace: true })
    } catch (err) {
      setError(err.message || 'Error al registrarse')
    } finally {
      setIsLoading(false)
    }
  }

  const steps = ['Tus datos', 'Tu universidad', 'Verificación', '¿Tenés auto?']

  return (
    <div className="min-h-dvh flex flex-col bg-[#f5f6ff]">
      {/* Header */}
      <div className="gradient-bg-br px-6 pt-14 pb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
        <button onClick={() => step === 1 ? navigate('/login') : setStep(s => s - 1)} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center mb-4">
          <ChevronLeft size={18} className="text-white" />
        </button>
        <h1 className="text-2xl font-bold text-white">Crear cuenta</h1>
        <p className="text-indigo-200 text-sm mt-1">Paso {step} de {steps.length} — {steps[step - 1]}</p>
        {/* Progress bar */}
        <div className="mt-4 bg-white/20 rounded-full h-1.5">
          <div
            className="bg-white rounded-full h-1.5 transition-all duration-500"
            style={{ width: `${(step / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex-1 px-6 pt-8 pb-10">
        {step === 1 && (
          <div className="flex flex-col gap-4 page-enter">
            <Input label="Nombre completo" placeholder="María González" value={form.name} onChange={e => update('name', e.target.value)} icon={User} />
            <Input label="Email universitario" type="email" placeholder="tumail@uni.edu.ar" value={form.email} onChange={e => update('email', e.target.value)} icon={Mail} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Contraseña</label>
              <input type="password" placeholder="Mínimo 6 caracteres" value={form.password} onChange={e => update('password', e.target.value)} className="w-full bg-white rounded-2xl border border-slate-200 px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent" />
            </div>
            <Button onClick={() => setStep(2)} fullWidth size="lg" disabled={!form.name || !form.email || !form.password}>
              Continuar <ChevronRight size={18} />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4 page-enter">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Universidad</label>
              <select value={form.university} onChange={e => update('university', e.target.value)} className="w-full bg-white rounded-2xl border border-slate-200 px-4 py-3.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300">
                <option value="">Seleccioná tu universidad</option>
                {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <Input label="Carrera" placeholder="Ej: Ingeniería en Sistemas" value={form.career} onChange={e => update('career', e.target.value)} icon={GraduationCap} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Año que cursás</label>
              <div className="flex gap-2">
                {['1er año', '2do año', '3er año', '4to año', '5to año', '6to año'].map(y => (
                  <button key={y} onClick={() => update('year', y)} className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${form.year === y ? 'gradient-bg text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
                    {y.replace(' año', '')}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={() => setStep(3)} fullWidth size="lg" disabled={!form.university || !form.career || !form.year}>
              Continuar <ChevronRight size={18} />
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4 page-enter">
            <div className="bg-gradient-to-br from-pink-50 to-violet-50 rounded-3xl p-5 border border-violet-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-violet-600 rounded-2xl flex items-center justify-center">
                  <Instagram size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Verificá con Instagram</h3>
                  <p className="text-xs text-slate-500">Genera más confianza entre viajeros</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Al vincular tu Instagram obtenés el badge de verificación ✨ y los demás usuarios podrán conocerte mejor antes de viajar.
              </p>
              <Input placeholder="@tu_usuario" value={form.instagram} onChange={e => update('instagram', e.target.value.startsWith('@') ? e.target.value : '@' + e.target.value)} icon={Instagram} />
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setStep(4)} fullWidth variant="secondary" size="lg">
                Omitir por ahora
              </Button>
              <Button onClick={() => setStep(4)} fullWidth size="lg" disabled={!form.instagram}>
                Verificar ✓
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-4 page-enter">
            <p className="text-slate-500 text-sm">Si tenés auto podés publicar viajes como conductor y ganar puntos extra 🚗</p>
            <div className="flex gap-3">
              <button onClick={() => update('hasCar', false)} className={`flex-1 py-4 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all ${!form.hasCar ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-white'}`}>
                <span className="text-3xl">🚌</span>
                <span className="text-sm font-semibold text-slate-700">Soy pasajero</span>
              </button>
              <button onClick={() => update('hasCar', true)} className={`flex-1 py-4 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all ${form.hasCar ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-white'}`}>
                <span className="text-3xl">🚗</span>
                <span className="text-sm font-semibold text-slate-700">Tengo auto</span>
              </button>
            </div>
            {form.hasCar && (
              <div className="flex flex-col gap-3 bg-white rounded-2xl p-4 card-shadow">
                <Input label="Marca" placeholder="Ej: Toyota" value={form.car.make} onChange={e => update('car', { ...form.car, make: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Modelo" placeholder="Corolla" value={form.car.model} onChange={e => update('car', { ...form.car, model: e.target.value })} />
                  <Input label="Año" placeholder="2020" type="number" value={form.car.year} onChange={e => update('car', { ...form.car, year: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Color" placeholder="Blanco" value={form.car.color} onChange={e => update('car', { ...form.car, color: e.target.value })} />
                  <Input label="Patente" placeholder="AB 123 CD" value={form.car.plate} onChange={e => update('car', { ...form.car, plate: e.target.value })} />
                </div>
              </div>
            )}
            {error && (
              <div className="bg-rose-50 text-rose-600 text-sm px-4 py-3 rounded-2xl font-medium">
                ⚠️ {error}
              </div>
            )}
            <Button onClick={handleSubmit} loading={isLoading} fullWidth size="lg">
              ¡Empezar a viajar! 🚀
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
