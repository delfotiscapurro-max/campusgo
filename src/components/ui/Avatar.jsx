import { Instagram } from 'lucide-react'

export default function Avatar({ src, name, size = 'md', verified = false, className = '' }) {
  const sizes = {
    xs: 'w-7 h-7 text-xs',
    sm: 'w-9 h-9 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl',
  }
  const badgeSizes = {
    xs: 'w-3 h-3 -bottom-0.5 -right-0.5',
    sm: 'w-4 h-4 -bottom-0.5 -right-0.5',
    md: 'w-5 h-5 -bottom-0.5 -right-0.5',
    lg: 'w-6 h-6 bottom-0 right-0',
    xl: 'w-8 h-8 bottom-0 right-0',
  }

  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <div className={`relative inline-block flex-shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizes[size]} rounded-full object-cover ring-2 ring-white`}
          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
        />
      ) : null}
      <div
        className={`${sizes[size]} rounded-full gradient-bg flex items-center justify-center text-white font-semibold ${src ? 'hidden' : 'flex'}`}
      >
        {initials}
      </div>
      {verified && (
        <div className={`absolute ${badgeSizes[size]} bg-gradient-to-br from-pink-500 to-violet-600 rounded-full flex items-center justify-center ring-2 ring-white`}>
          <Instagram size={size === 'xl' ? 14 : size === 'lg' ? 10 : 8} className="text-white" />
        </div>
      )}
    </div>
  )
}
