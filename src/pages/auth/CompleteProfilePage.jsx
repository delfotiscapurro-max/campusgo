import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, ChevronRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import { UNIVERSITIES } from '../../data/universities.js'

export default function CompleteProfilePage() {
  const navigate = useNavigate()
  const { user, updateProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState({ university: '', career: '', year: '' })

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    setIsLoading(true)
    await updateProfile(form)
    navigate('/home', { replace: true })
    setIsLoading(false)
  }

  return (
    <div className="min-h-dvh flex flex-col bg-[#f5f6ff]">
      <div className="gradient-bg-br px-6 pt-14 pb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
        <h1 className="text-2xl font-bold text-white">¡Casi listo, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="text-indigo-200 text-sm mt-1">Completá tu perfil universitario</p>
      </div>

      <div className="flex-1 px-6 pt-8 pb-10 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-700">Universidad</label>
          <select
            value={form.university}
            onChange={e => update('university', e.target.value)}
            className="w-full bg-white rounded-2xl border border-slate-200 px-4 py-3.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="">Seleccioná tu universidad</option>
            {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>

        <Input
          label="Carrera"
          placeholder="Ej: Ingeniería en Sistemas"
          value={form.career}
          onChange={e => update('career', e.target.value)}
          icon={GraduationCap}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-700">Año que cursás</label>
          <div className="flex gap-2">
            {['1er año', '2do año', '3er año', '4to año', '5to año', '6to año'].map(y => (
              <button
                key={y}
                onClick={() => update('year', y)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${form.year === y ? 'gradient-bg text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
              >
                {y.replace(' año', '')}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          loading={isLoading}
          fullWidth
          size="lg"
          disabled={!form.university || !form.career || !form.year}
          className="mt-4"
        >
          Empezar a viajar 🚀
        </Button>
      </div>
    </div>
  )
}
