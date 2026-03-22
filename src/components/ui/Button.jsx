import { Loader2 } from 'lucide-react'

export default function Button({ children, variant = 'primary', size = 'md', loading = false, disabled = false, className = '', onClick, type = 'button', fullWidth = false }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all press-effect select-none'
  const variants = {
    primary: 'gradient-bg text-white shadow-md disabled:opacity-50',
    secondary: 'bg-indigo-50 text-indigo-700 disabled:opacity-50',
    ghost: 'text-slate-600 hover:bg-slate-100 disabled:opacity-50',
    danger: 'bg-rose-50 text-rose-600 disabled:opacity-50',
    success: 'bg-emerald-500 text-white disabled:opacity-50',
    white: 'bg-white text-slate-800 shadow-sm disabled:opacity-50',
    outline: 'border-2 border-indigo-200 text-indigo-700 bg-white disabled:opacity-50',
  }
  const sizes = {
    sm: 'text-sm px-4 py-2',
    md: 'text-sm px-5 py-3',
    lg: 'text-base px-6 py-3.5',
    xl: 'text-base px-8 py-4',
    icon: 'w-10 h-10 p-0',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : children}
    </button>
  )
}
