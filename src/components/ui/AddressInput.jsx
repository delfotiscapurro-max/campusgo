import { useState, useEffect, useRef } from 'react'
import { MapPin, Loader } from 'lucide-react'

export default function AddressInput({ label, placeholder, value, onChange }) {
  const [query, setQuery] = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (query.length < 3) { setSuggestions([]); setOpen(false); return }

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ', Buenos Aires, Argentina')}&format=json&addressdetails=1&limit=6&countrycodes=ar`,
          { headers: { 'Accept-Language': 'es' } }
        )
        const data = await res.json()
        setSuggestions(data.map(r => ({
          label: r.display_name.split(', Argentina')[0],
          lat: parseFloat(r.lat),
          lng: parseFloat(r.lon),
        })))
        setOpen(true)
      } catch {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 350)
  }, [query])

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function select(suggestion) {
    setQuery(suggestion.label)
    onChange(suggestion)
    setOpen(false)
    setSuggestions([])
  }

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      {label && <label className="text-sm font-semibold text-slate-700">{label}</label>}
      <div className="relative">
        <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        {loading && <Loader size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400 animate-spin" />}
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={e => { setQuery(e.target.value); onChange({ label: e.target.value, lat: -34.59, lng: -58.44 }) }}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          className="w-full bg-white rounded-2xl border border-slate-200 pl-10 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        {open && suggestions.length > 0 && (
          <ul className="absolute z-50 top-full mt-1 w-full bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
            {suggestions.map((s, i) => (
              <li
                key={i}
                onMouseDown={() => select(s)}
                className="px-4 py-3 text-sm text-slate-700 hover:bg-indigo-50 cursor-pointer border-b border-slate-50 last:border-0 flex items-start gap-2"
              >
                <MapPin size={14} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                <span>{s.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
