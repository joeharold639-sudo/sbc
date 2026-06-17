const features = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M2 9H16M16 9L12 5M16 9L12 13" stroke="#00c9b1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    bg: 'bg-[#00c9b1]/15',
    title: 'Real exchange rate',
    desc: 'We use the mid-market rate — the same one you see on Google.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7" stroke="#4f7fff" strokeWidth="1.5"/>
        <path d="M9 5.5V9L11.5 11.5" stroke="#4f7fff" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    bg: 'bg-[#4f7fff]/15',
    title: 'Arrives in seconds',
    desc: 'Most transfers complete within 20 seconds, 24/7/365.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 2C5.13 2 2 5.13 2 9C2 12.87 5.13 16 9 16C12.87 16 16 12.87 16 9" stroke="#7c5cfc" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M13 3L15 5L10.5 9.5" stroke="#7c5cfc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    bg: 'bg-[#7c5cfc]/15',
    title: 'No hidden fees',
    desc: 'See exactly what the recipient gets before you send.',
  },
]

const currencies = [
  { flag: '🇬🇧', code: 'GBP' },
  { flag: '🇯🇵', code: 'JPY' },
  { flag: '🇨🇦', code: 'CAD' },
  { flag: '🇦🇺', code: 'AUD' },
]

export default function Transfers() {
  return (
    <section id="transfers" className="py-24 bg-[#111422] overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <div className="pill pill-teal mb-5">Go global, not local</div>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-5">
              Send money<br /><span className="blue-text">anywhere, instantly</span>
            </h2>
            <p className="text-[#8892b0] text-lg mb-8 leading-relaxed">
              Transfer money to 180+ countries at the real exchange rate with no hidden fees. Arrives in seconds, not days.
            </p>

            <div className="space-y-5 mb-8">
              {features.map(f => (
                <div key={f.title} className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    {f.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-1">{f.title}</p>
                    <p className="text-sm text-[#8892b0]">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <a href="#" className="inline-flex items-center gap-2 text-sm font-semibold text-[#4f7fff] hover:text-white transition-colors">
              Calculate your transfer
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>

          {/* Transfer widget */}
          <div className="flex justify-center">
            <div className="glass rounded-2xl p-6 w-full max-w-sm card-3d" style={{ boxShadow: '0 0 40px rgba(79,127,255,0.08), 0 4px 24px rgba(0,0,0,0.4)' }}>
              <p className="text-sm font-semibold mb-5">New Transfer</p>

              <div className="mb-3">
                <label className="text-xs text-[#8892b0] mb-1.5 block">You send</label>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                  <span className="text-lg font-bold flex-1">$1,000</span>
                  <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg">
                    <span>🇺🇸</span>
                    <span className="text-sm font-medium">USD</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 py-3 px-4 rounded-xl mb-3"
                   style={{ background: 'rgba(0,201,177,0.08)', border: '1px solid rgba(0,201,177,0.15)' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 8H14" stroke="#00c9b1" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M8 2L14 8L8 14" stroke="#00c9b1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div>
                  <p className="text-xs text-[#00c9b1] font-medium">1 USD = 0.9248 EUR</p>
                  <p className="text-xs text-[#8892b0]">Mid-market rate · No fee applied</p>
                </div>
              </div>

              <div className="mb-5">
                <label className="text-xs text-[#8892b0] mb-1.5 block">Recipient gets</label>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                  <span className="text-lg font-bold flex-1 text-[#00c9b1]">€924.80</span>
                  <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg">
                    <span>🇪🇺</span>
                    <span className="text-sm font-medium">EUR</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-5">
                {currencies.map(c => (
                  <span key={c.code} className="text-xs bg-white/5 px-2.5 py-1 rounded-lg">{c.flag} {c.code}</span>
                ))}
                <span className="text-xs text-[#8892b0]">+176 more</span>
              </div>

              <button className="w-full py-3 bg-[#4f7fff] hover:bg-blue-500 rounded-xl text-sm font-semibold transition-all">
                Send now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
