import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, GraduationCap } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading } = useAuth()
  const [email, setEmail] = useState('vlopez@fi.uba.ar')
  const [password, setPassword] = useState('123456')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      navigate('/home', { replace: true })
    } catch (err) {
      setError('Email o contraseña incorrectos')
    }
  }

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Header gradient */}
      <div className="gradient-bg-br flex flex-col items-center justify-center px-6 pt-16 pb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-10 -translate-x-10" />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-3xl flex items-center justify-center">
            <GraduationCap size={36} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">CampusGo</h1>
          <p className="text-indigo-200 text-sm text-center font-medium">
            Llegá juntos, gastá menos 🚗✨
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 bg-[#f5f6ff] rounded-t-[32px] -mt-4 px-6 pt-8 pb-10">
        <h2 className="text-xl font-bold text-slate-800 mb-1">¡Bienvenido de vuelta!</h2>
        <p className="text-slate-500 text-sm mb-6">Iniciá sesión con tu email universitario</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <Input
            label="Email universitario"
            type="email"
            placeholder="tumail@uni.edu.ar"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={Mail}
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Contraseña</label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock size={18} />
              </div>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white rounded-2xl border border-slate-200 px-4 py-3.5 pl-10 pr-12 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-600 text-sm px-4 py-3 rounded-2xl font-medium">
              ⚠️ {error}
            </div>
          )}

          <Button type="submit" loading={isLoading} fullWidth size="lg" className="mt-2">
            Iniciar sesión
          </Button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400 font-medium">o ingresá con</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Instagram connect */}
        <button
          type="button"
          onClick={() => handleLogin({ preventDefault: () => {} })}
          className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white py-3.5 rounded-2xl font-semibold text-sm press-effect"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
          Continuar con Instagram
        </button>

        <p className="text-center mt-6 text-sm text-slate-500">
          ¿No tenés cuenta?{' '}
          <Link to="/register" className="text-indigo-600 font-semibold">
            Registrate gratis
          </Link>
        </p>

        <p className="text-center mt-3 text-xs text-slate-400">
          Solo para estudiantes universitarios 🎓
        </p>
      </div>
    </div>
  )
}
