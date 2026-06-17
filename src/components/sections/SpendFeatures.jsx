const cards = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M2 5C2 4.45 2.45 4 3 4H17C17.55 4 18 4.45 18 5V15C18 15.55 17.55 16 17 16H3C2.45 16 2 15.55 2 15V5Z" stroke="#4f7fff" strokeWidth="1.5"/>
        <path d="M2 8H18" stroke="#4f7fff" strokeWidth="1.5"/>
        <circle cx="6" cy="12" r="1.5" fill="#4f7fff"/>
      </svg>
    ),
    bg: 'bg-[#4f7fff]/20',
    title: 'Virtual & Physical Cards',
    desc: 'Issue virtual cards instantly. Set spending limits, freeze/unfreeze in one tap, and get real-time alerts for every transaction.',
    wide: true,
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 2L10.9 7H16L11.6 10.1L13.5 15L9 11.8L4.5 15L6.4 10.1L2 7H7.1L9 2Z" fill="#7c5cfc" fillOpacity="0.5" stroke="#7c5cfc" strokeWidth="1.2"/>
      </svg>
    ),
    bg: 'bg-[#7c5cfc]/20',
    title: 'Smart Analytics',
    desc: 'Category-based spending breakdown with monthly trends.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 1.5L11.2 6.5H16.5L12.1 9.7L13.9 14.9L9 11.5L4.1 14.9L5.9 9.7L1.5 6.5H6.8L9 1.5Z" stroke="#00c9b1" strokeWidth="1.2"/>
      </svg>
    ),
    bg: 'bg-[#00c9b1]/20',
    title: 'Cashback Rewards',
    desc: 'Earn up to 2% cashback on all your purchases globally.',
  },
]

function PhoneMockup() {
  return (
    <div className="relative w-64 h-[520px] mx-auto">
      <div className="absolute inset-0 rounded-[40px] overflow-hidden border border-white/10"
           style={{ background: 'linear-gradient(to bottom, #1e2240, #111422)', boxShadow: '0 0 40px rgba(79,127,255,0.08), 0 4px 24px rgba(0,0,0,0.4)' }}>
        <div className="pt-12 px-5">
          <p className="text-xs text-[#8892b0] mb-1">Spending this month</p>
          <p className="text-2xl font-bold mb-4">$3,241.50</p>
          <div className="w-32 h-32 mx-auto mb-4 relative">
            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
              <circle cx="60" cy="60" r="45" fill="none" stroke="#1e2240" strokeWidth="18"/>
              <circle cx="60" cy="60" r="45" fill="none" stroke="#4f7fff" strokeWidth="18" strokeDasharray="113 169" strokeLinecap="round"/>
              <circle cx="60" cy="60" r="45" fill="none" stroke="#7c5cfc" strokeWidth="18" strokeDasharray="56 226" strokeDashoffset="-113" strokeLinecap="round"/>
              <circle cx="60" cy="60" r="45" fill="none" stroke="#00c9b1" strokeWidth="18" strokeDasharray="28 254" strokeDashoffset="-169" strokeLinecap="round"/>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs text-[#8892b0] text-center">by category</span>
            </div>
          </div>
          <div className="space-y-2 text-xs mb-4">
            {[['#4f7fff','Shopping','40%'],['#7c5cfc','Food & Drink','20%'],['#00c9b1','Travel','10%']].map(([c,l,p]) => (
              <div key={l} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ background: c }}/>
                  {l}
                </span>
                <span>{p}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <p className="text-xs text-[#8892b0]">Recent</p>
            {[['Netflix','-$15.99','text-red-400'],['Salary deposit','+$4,500','text-[#00c9b1]']].map(([label,amt,cls]) => (
              <div key={label} className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2">
                <span className="text-xs">{label}</span>
                <span className={`text-xs ${cls}`}>{amt}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 border-t border-white/5 flex items-center justify-around px-4"
             style={{ background: 'rgba(15,18,32,0.8)', backdropFilter: 'blur(12px)' }}>
          <div className="w-6 h-6 rounded-md bg-[#4f7fff]/20 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" fill="#4f7fff"/>
              <rect x="8" y="1" width="5" height="5" rx="1" fill="#4f7fff" fillOpacity="0.4"/>
              <rect x="1" y="8" width="5" height="5" rx="1" fill="#4f7fff" fillOpacity="0.4"/>
              <rect x="8" y="8" width="5" height="5" rx="1" fill="#4f7fff" fillOpacity="0.4"/>
            </svg>
          </div>
          {[
            <path key="card" d="M2 5C2 4.45 2.45 4 3 4H11C11.55 4 12 4.45 12 5V9C12 9.55 11.55 10 11 10H3C2.45 10 2 9.55 2 9V5Z" stroke="#4a5568" strokeWidth="1.2"/>,
            <><circle key="c" cx="7" cy="5" r="2.5" stroke="#4a5568" strokeWidth="1.2"/><path key="p" d="M2 12C2 9.8 4.2 8 7 8C9.8 8 12 9.8 12 12" stroke="#4a5568" strokeWidth="1.2" strokeLinecap="round"/></>,
          ].map((path, i) => (
            <div key={i} className="w-6 h-6 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">{path}</svg>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#0b0d14] rounded-full z-10"/>
    </div>
  )
}

export default function SpendFeatures() {
  return (
    <section id="features" className="py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="text-center mb-16">
          <div className="pill pill-blue mb-4 mx-auto w-fit">One app, all things money</div>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
            Spend smarter, <span className="blue-text">every day</span>
          </h2>
          <p className="text-[#8892b0] text-lg max-w-xl mx-auto">
            Real-time spending insights, instant notifications, and smart budgeting tools built directly into your account.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 items-center">
          <div className="grid sm:grid-cols-2 gap-4">
            {cards.map((c, i) => (
              <div key={i} className={`feature-card card-3d ${c.wide ? 'col-span-2' : ''}`}>
                <div className={`w-${c.wide ? '10' : '9'} h-${c.wide ? '10' : '9'} rounded-xl ${c.bg} flex items-center justify-center mb-${c.wide ? '4' : '3'}`}>
                  {c.icon}
                </div>
                <h3 className={`font-semibold ${c.wide ? 'text-base' : 'text-sm'} mb-${c.wide ? '2' : '1.5'}`}>{c.title}</h3>
                <p className={`${c.wide ? 'text-sm' : 'text-xs'} text-[#8892b0] leading-relaxed`}>{c.desc}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-center lg:justify-end">
            <PhoneMockup />
          </div>
        </div>
      </div>
    </section>
  )
}
