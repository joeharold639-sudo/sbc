const actions = [
  {
    label: 'Send',
    color: '#4f7fff',
    bg: 'rgba(79,127,255,0.15)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4f7fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
      </svg>
    ),
  },
  {
    label: 'Receive',
    color: '#00c9b1',
    bg: 'rgba(0,201,177,0.15)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00c9b1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="8 17 12 21 16 17"/><line x1="12" y1="12" x2="12" y2="21"/>
        <path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"/>
      </svg>
    ),
  },
  {
    label: 'Top up',
    color: '#7c5cfc',
    bg: 'rgba(124,92,252,0.15)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c5cfc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    ),
  },
  {
    label: 'Exchange',
    color: '#f5c842',
    bg: 'rgba(245,200,66,0.15)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f5c842" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
        <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
      </svg>
    ),
  },
  {
    label: 'Bills',
    color: '#f56565',
    bg: 'rgba(245,101,101,0.15)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f56565" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  {
    label: 'Bitcoin',
    color: '#f5c842',
    bg: 'rgba(245,200,66,0.1)',
    icon: <span style={{ color: '#f5c842', fontSize: 20, lineHeight: 1 }}>₿</span>,
  },
]

export default function QuickActions({ onSend, onReceive }) {
  const handlers = { Send: onSend, Receive: onReceive }

  return (
    <div>
      <h3 className="text-sm font-semibold text-[#8892b0] uppercase tracking-widest mb-4">Quick actions</h3>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {actions.map(a => (
          <button
            key={a.label}
            onClick={handlers[a.label]}
            className="flex flex-col items-center gap-2.5 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-all group"
            style={{ background: 'rgba(17,20,34,0.8)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                 style={{ background: a.bg }}>
              {a.icon}
            </div>
            <span className="text-xs text-[#8892b0] group-hover:text-white transition-colors">{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
