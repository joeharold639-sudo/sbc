import { useState } from 'react'

function fmt(n) {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

export default function BalanceCard({ account, onSend, onReceive }) {
  const [hidden, setHidden] = useState(false)

  if (!account) return (
    <div className="rounded-2xl bg-[#111422] border border-white/5 p-6 animate-pulse h-52"/>
  )

  const [whole, dec] = fmt(account.balance).split('.')

  return (
    <div className="relative rounded-2xl overflow-hidden p-6"
         style={{ background: 'linear-gradient(135deg, #1a2e6e 0%, #0f1a45 60%, #0b0d20 100%)' }}>
      {/* Decorative blur */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none"
           style={{ background: 'rgba(79,127,255,0.15)' }}/>
      <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full blur-3xl pointer-events-none"
           style={{ background: 'rgba(124,92,252,0.1)' }}/>

      <div className="relative z-10">
        {/* Header row */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs text-[#8892b0] uppercase tracking-widest mb-1">Total balance</p>
            <div className="flex items-end gap-1">
              <span className="text-[13px] text-[#8892b0] mb-1">USD</span>
              {hidden
                ? <span className="text-4xl font-black tracking-tight">••••••</span>
                : <span className="text-4xl font-black tracking-tight">${whole}<span className="text-2xl text-[#8892b0]">.{dec}</span></span>
              }
            </div>
            <p className="text-xs text-[#8892b0] mt-1.5">
              Acct •••• {account.account_number?.slice(-4)}
            </p>
          </div>

          <button onClick={() => setHidden(h => !h)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            {hidden
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8892b0" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8892b0" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            }
          </button>
        </div>

        {/* Sparkline */}
        <div className="mb-6">
          <svg viewBox="0 0 400 48" className="w-full h-10" preserveAspectRatio="none">
            <defs>
              <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f7fff" stopOpacity="0.25"/>
                <stop offset="100%" stopColor="#4f7fff" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <path d="M0,38 C50,35 100,28 150,22 C200,16 240,30 280,18 C320,8 360,14 400,6"
                  fill="none" stroke="#4f7fff" strokeWidth="1.5"/>
            <path d="M0,38 C50,35 100,28 150,22 C200,16 240,30 280,18 C320,8 360,14 400,6 L400,48 L0,48 Z"
                  fill="url(#balGrad)"/>
            <circle cx="400" cy="6" r="3" fill="#4f7fff"/>
          </svg>
          <div className="flex justify-between text-[10px] text-[#4a5568] mt-0.5">
            {['6d','5d','4d','3d','2d','1d','Now'].map(d => <span key={d}>{d}</span>)}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onSend}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#4f7fff] hover:bg-blue-500 rounded-xl text-sm font-semibold transition-all">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            Send
          </button>
          <button onClick={onReceive}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/10 hover:bg-white/15 rounded-xl text-sm font-semibold transition-all border border-white/10">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="8 17 12 21 16 17"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"/>
            </svg>
            Receive
          </button>
          <button className="px-3.5 py-2.5 bg-white/10 hover:bg-white/15 rounded-xl text-sm font-semibold transition-all border border-white/10">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
