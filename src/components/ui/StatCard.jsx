export default function StatCard({ emoji, value, label, color = 'indigo', className = '' }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-700',
    violet: 'bg-violet-50 text-violet-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
  }

  return (
    <div className={`${colors[color]} rounded-2xl p-4 flex flex-col gap-1 ${className}`}>
      <span className="text-2xl">{emoji}</span>
      <span className="text-xl font-bold">{value}</span>
      <span className="text-xs font-medium opacity-70">{label}</span>
    </div>
  )
}
