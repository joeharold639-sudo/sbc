const btcFeatures = [
  { title: 'Instant BTC purchase', desc: 'Buy Bitcoin with your balance or card in seconds.' },
  { title: 'Cold wallet security', desc: '95% of assets stored in air-gapped cold storage.' },
  { title: 'Live price tracking', desc: 'Real-time charts and price alerts via push notification.' },
  { title: 'Send & receive BTC', desc: 'Transfer BTC to any wallet address worldwide.' },
]

function BTCCard() {
  return (
    <div className="glass rounded-2xl p-6 w-full max-w-sm mx-auto card-3d"
         style={{ boxShadow: '0 0 40px rgba(79,127,255,0.08), 0 4px 24px rgba(0,0,0,0.4)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#f5c842]/20 flex items-center justify-center text-lg">₿</div>
          <div>
            <p className="font-semibold text-sm">Bitcoin</p>
            <p className="text-xs text-[#8892b0]">BTC</p>
          </div>
        </div>
        <div className="pill pill-teal text-xs">+3.24% ↑</div>
      </div>

      <p className="text-3xl font-black mb-1">$67,420</p>
      <p className="text-xs text-[#8892b0] mb-4">Last updated 2 min ago</p>

      <div className="mb-4">
        <svg viewBox="0 0 300 60" className="w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="btcGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f5c842" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#f5c842" stopOpacity="0"/>
            </linearGradient>
          </defs>
          <path d="M0,45 C30,42 60,30 90,28 C120,26 150,35 180,22 C210,10 240,18 270,10 C280,8 290,7 300,5"
                fill="none" stroke="#f5c842" strokeWidth="1.5"/>
          <path d="M0,45 C30,42 60,30 90,28 C120,26 150,35 180,22 C210,10 240,18 270,10 C280,8 290,7 300,5 L300,60 L0,60 Z"
                fill="url(#btcGrad)"/>
        </svg>
      </div>

      <div className="bg-white/5 rounded-xl p-4 mb-4">
        <p className="text-xs text-[#8892b0] mb-2">Your BTC balance</p>
        <p className="font-bold text-lg">0.0358 BTC</p>
        <p className="text-sm text-[#8892b0]">≈ $2,413.63</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button className="py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{ background: 'rgba(79,127,255,0.2)', border: '1px solid rgba(79,127,255,0.3)', color: '#4f7fff' }}>
          Buy BTC
        </button>
        <button className="py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors">
          Send BTC
        </button>
      </div>
    </div>
  )
}

export default function Bitcoin() {
  return (
    <section className="py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <BTCCard />
          </div>

          <div className="order-1 lg:order-2">
            <div className="pill pill-purple mb-5">Get investing today</div>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-5">
              Your <span className="blue-text">Bitcoin wallet</span><br />built right in
            </h2>
            <p className="text-[#8892b0] text-lg mb-8 leading-relaxed">
              Buy, hold, and send Bitcoin directly from your bank account. No separate apps, no third-party wallets — just one unified experience.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {btcFeatures.map(f => (
                <div key={f.title} className="feature-card card-3d">
                  <p className="font-semibold text-sm mb-1.5">{f.title}</p>
                  <p className="text-xs text-[#8892b0]">{f.desc}</p>
                </div>
              ))}
            </div>

            <a href="#" className="inline-flex items-center gap-2 text-sm font-semibold text-[#4f7fff] hover:text-white transition-colors">
              Learn about our Bitcoin wallet
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
