export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-16 overflow-hidden mesh-bg">
      {/* Decorative blobs */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full blur-3xl pointer-events-none"
           style={{ background: 'rgba(79,127,255,0.1)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none"
           style={{ background: 'rgba(124,92,252,0.1)' }} />

      <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8 text-center">
        <div className="pill pill-blue mb-6 mx-auto w-fit">
          <span className="w-2 h-2 rounded-full bg-[#4f7fff] inline-block" />
          Now available in 180+ countries
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.05] mb-6">
          Radically different<br />
          <span className="blue-text">banking</span>
        </h1>

        <p className="text-lg sm:text-xl text-[#8892b0] max-w-2xl mx-auto mb-10 leading-relaxed">
          Apply online in minutes. Experience banking unlike anything that's come before — faster transfers, smarter spending, and Bitcoin built in.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <a href="/signup"
             className="w-full sm:w-auto px-8 py-3.5 bg-[#4f7fff] hover:bg-blue-500 text-white font-semibold rounded-xl transition-all text-[15px]">
            Open free account
          </a>
          <a href="#features"
             className="w-full sm:w-auto px-8 py-3.5 border border-white/15 hover:border-white/30 text-white rounded-xl transition-colors text-[15px]">
            Explore features →
          </a>
        </div>

        {/* Dashboard mockup */}
        <div className="relative animate-float max-w-3xl mx-auto">
          <div className="glass rounded-2xl p-6" style={{ boxShadow: '0 0 40px rgba(79,127,255,0.08), 0 4px 24px rgba(0,0,0,0.4)' }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs text-[#8892b0] mb-1">Total balance</p>
                <p className="text-3xl font-bold">$24,819.<span className="text-[#8892b0] text-xl">36</span></p>
              </div>
              <div className="pill pill-teal">+2.4% this month</div>
            </div>

            {/* Mini chart */}
            <div className="mb-6">
              <svg viewBox="0 0 400 80" className="w-full h-16" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f7fff" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#4f7fff" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <path d="M0,60 C40,55 80,40 120,35 C160,30 200,45 240,30 C280,15 320,25 360,15 C380,10 390,12 400,10"
                      fill="none" stroke="#4f7fff" strokeWidth="2"/>
                <path d="M0,60 C40,55 80,40 120,35 C160,30 200,45 240,30 C280,15 320,25 360,15 C380,10 390,12 400,10 L400,80 L0,80 Z"
                      fill="url(#chartGrad)"/>
                <circle cx="400" cy="10" r="4" fill="#4f7fff"/>
                <circle cx="400" cy="10" r="8" fill="#4f7fff" fillOpacity="0.2"/>
              </svg>
            </div>

            {/* Transactions */}
            <div className="space-y-3">
              {[
                { icon: '₿', label: 'Bitcoin Wallet', sub: 'Received', amount: '+$1,240.00', color: 'text-[#00c9b1]', bg: 'bg-[#4f7fff]/20' },
                { icon: '🌍', label: "Int'l Transfer", sub: 'Sent to London', amount: '-$850.00', color: 'text-red-400', bg: 'bg-purple-500/20' },
                { icon: '💳', label: 'Virtual Card', sub: 'Apple Pay', amount: '-$29.99', color: 'text-red-400', bg: 'bg-[#00c9b1]/20' },
              ].map((tx, i) => (
                <div key={i} className={`flex items-center justify-between py-2 ${i < 2 ? 'border-b border-white/5' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${tx.bg} flex items-center justify-center text-sm`}>{tx.icon}</div>
                    <div>
                      <p className="text-sm font-medium">{tx.label}</p>
                      <p className="text-xs text-[#8892b0]">{tx.sub}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${tx.color}`}>{tx.amount}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Floating cards */}
          <div className="absolute -right-4 top-4 hidden md:block">
            <div className="glass rounded-xl p-3 w-36" style={{ boxShadow: '0 0 40px rgba(79,127,255,0.08), 0 4px 24px rgba(0,0,0,0.4)' }}>
              <p className="text-xs text-[#8892b0] mb-1">BTC Price</p>
              <p className="text-sm font-bold">$67,420</p>
              <p className="text-xs text-[#00c9b1]">+3.2% ↑</p>
            </div>
          </div>
          <div className="absolute -left-4 bottom-8 hidden md:block">
            <div className="glass rounded-xl p-3 w-40" style={{ boxShadow: '0 0 40px rgba(79,127,255,0.08), 0 4px 24px rgba(0,0,0,0.4)' }}>
              <p className="text-xs text-[#8892b0] mb-1">Sent instantly</p>
              <p className="text-sm font-bold">€2,000</p>
              <p className="text-xs text-[#8892b0]">→ London, UK</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust bar */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 mt-16 pb-8">
        <p className="text-center text-xs text-[#4a5568] uppercase tracking-widest mb-6">Trusted by leading businesses worldwide</p>
        <div className="flex items-center justify-center gap-8 sm:gap-14 flex-wrap">
          {['Shopify', 'Stripe', 'Notion', 'Linear', 'Vercel', 'Figma'].map(b => (
            <span key={b} className="text-[#4a5568] text-sm font-semibold tracking-wide">{b}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
