const stats = [
  { value: '$2.4B+', label: 'Transfers processed' },
  { value: '1.8M+', label: 'Active users' },
  { value: '180+',  label: 'Countries supported' },
  { value: '4.9★',  label: 'App store rating' },
]

export default function Stats() {
  return (
    <section className="py-16 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-4xl font-black text-white mb-1">
                {s.value.slice(0, -1)}<span className="text-[#4f7fff]">{s.value.slice(-1)}</span>
              </p>
              <p className="text-sm text-[#8892b0]">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
