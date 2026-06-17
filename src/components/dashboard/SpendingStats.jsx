import { useMemo } from 'react'

const TYPE_LABELS = {
  debit:        { label: 'Spending',    color: '#4f7fff' },
  credit:       { label: 'Income',      color: '#00c9b1' },
  transfer:     { label: 'Transfers',   color: '#7c5cfc' },
  btc_buy:      { label: 'Bitcoin',     color: '#f5c842' },
  bill_payment: { label: 'Bills',       color: '#f56565' },
}

function fmt(n) {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

function DonutChart({ slices }) {
  const total = slices.reduce((s, x) => s + x.value, 0)
  if (total === 0) return null

  let offset = 0
  const r = 40, circ = 2 * Math.PI * r
  const arcs = slices.map(s => {
    const pct   = s.value / total
    const dash  = pct * circ
    const arc   = { ...s, dash, offset, pct }
    offset += dash
    return arc
  })

  return (
    <div className="relative flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-28 h-28 -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#1a1d2e" strokeWidth="16"/>
        {arcs.map((a, i) => (
          <circle key={i} cx="50" cy="50" r={r} fill="none"
            stroke={a.color} strokeWidth="16"
            strokeDasharray={`${a.dash} ${circ - a.dash}`}
            strokeDashoffset={-a.offset}
            strokeLinecap="butt"/>
        ))}
      </svg>
      <div className="absolute text-center pointer-events-none">
        <p className="text-[10px] text-[#8892b0]">spent</p>
        <p className="text-base font-black leading-none">
          ${(slices.find(s => s.key === 'debit')?.value ?? 0) < 1000
            ? fmt(slices.find(s => s.key === 'debit')?.value ?? 0)
            : ((slices.find(s => s.key === 'debit')?.value ?? 0) / 1000).toFixed(1) + 'k'}
        </p>
      </div>
    </div>
  )
}

export default function SpendingStats({ transactions, account }) {
  const thisMonth = useMemo(() => {
    const now   = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    return transactions.filter(tx => new Date(tx.created_at) >= start)
  }, [transactions])

  const breakdown = useMemo(() => {
    const totals = {}
    thisMonth.forEach(tx => {
      totals[tx.type] = (totals[tx.type] ?? 0) + Number(tx.amount)
    })
    return Object.entries(totals)
      .map(([key, value]) => ({ key, value, ...TYPE_LABELS[key] }))
      .filter(s => s.label)
      .sort((a, b) => b.value - a.value)
  }, [thisMonth])

  const totalIn  = thisMonth.filter(t => t.type === 'credit').reduce((s, t) => s + Number(t.amount), 0)
  const totalOut = thisMonth.filter(t => t.type !== 'credit').reduce((s, t) => s + Number(t.amount), 0)

  return (
    <div className="space-y-5">

      {/* Month summary */}
      <div className="rounded-2xl p-5 border border-white/5" style={{ background: 'rgba(17,20,34,0.8)' }}>
        <h3 className="text-xs font-semibold text-[#8892b0] uppercase tracking-widest mb-4">This month</h3>
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-[#00c9b1]/8 border border-[#00c9b1]/15 rounded-xl p-3">
            <p className="text-[10px] text-[#8892b0] mb-1">Money in</p>
            <p className="text-sm font-bold text-[#00c9b1]">+${fmt(totalIn)}</p>
          </div>
          <div className="bg-red-500/8 border border-red-500/15 rounded-xl p-3">
            <p className="text-[10px] text-[#8892b0] mb-1">Money out</p>
            <p className="text-sm font-bold text-red-400">-${fmt(totalOut)}</p>
          </div>
        </div>

        {/* Donut */}
        {breakdown.length > 0 && (
          <div className="flex items-center gap-4">
            <DonutChart slices={breakdown}/>
            <div className="flex-1 space-y-2">
              {breakdown.map(s => (
                <div key={s.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }}/>
                    <span className="text-xs text-[#8892b0]">{s.label}</span>
                  </div>
                  <span className="text-xs font-medium">${fmt(s.value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* BTC mini card */}
      <div className="rounded-2xl p-5 border border-white/5" style={{ background: 'rgba(17,20,34,0.8)' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-[#8892b0] uppercase tracking-widest">Bitcoin</h3>
          <span className="pill pill-teal text-[10px]">+3.24%</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#f5c842]/15 flex items-center justify-center text-xl flex-shrink-0">₿</div>
          <div>
            <p className="font-bold text-sm">$67,420 <span className="text-[10px] text-[#8892b0] font-normal">/ BTC</span></p>
            <p className="text-xs text-[#8892b0]">0.0000 BTC in wallet</p>
          </div>
        </div>
        <div className="mt-3">
          <svg viewBox="0 0 200 32" className="w-full h-8" preserveAspectRatio="none">
            <defs>
              <linearGradient id="btcMini" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f5c842" stopOpacity="0.2"/>
                <stop offset="100%" stopColor="#f5c842" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <path d="M0,28 C20,26 40,20 60,18 C80,16 100,22 120,14 C140,6 160,11 180,6 C188,4 194,4 200,2"
                  fill="none" stroke="#f5c842" strokeWidth="1.5"/>
            <path d="M0,28 C20,26 40,20 60,18 C80,16 100,22 120,14 C140,6 160,11 180,6 C188,4 194,4 200,2 L200,32 L0,32 Z"
                  fill="url(#btcMini)"/>
          </svg>
        </div>
        <a href="/bitcoin" className="block mt-3 text-center py-2 rounded-xl text-xs font-medium text-[#4f7fff] border border-[#4f7fff]/20 hover:bg-[#4f7fff]/10 transition-colors">
          Open wallet →
        </a>
      </div>

      {/* Card widget */}
      <div className="rounded-2xl p-5 border border-white/5 overflow-hidden relative"
           style={{ background: 'linear-gradient(135deg, #1a1f35 0%, #111422 100%)' }}>
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl pointer-events-none"
             style={{ background: 'rgba(124,92,252,0.15)' }}/>
        <h3 className="text-xs font-semibold text-[#8892b0] uppercase tracking-widest mb-4">Virtual card</h3>
        <div className="relative">
          {/* Mini card */}
          <div className="rounded-xl p-4 mb-3"
               style={{ background: 'linear-gradient(135deg, #2d1f5e, #1a1040)', border: '1px solid rgba(124,92,252,0.3)' }}>
            <div className="flex justify-between items-start mb-6">
              <div className="w-7 h-5 rounded bg-[#f5c842]/80"/>
              <span className="text-xs text-white/60 font-mono">VISA</span>
            </div>
            <p className="text-xs font-mono tracking-[0.2em] text-white/70 mb-1">•••• •••• •••• 4521</p>
            <div className="flex justify-between">
              <div>
                <p className="text-[9px] text-white/40 uppercase">Cardholder</p>
                <p className="text-xs text-white/80">K. Black</p>
              </div>
              <div>
                <p className="text-[9px] text-white/40 uppercase">Expires</p>
                <p className="text-xs text-white/80">12/28</p>
              </div>
            </div>
          </div>
          <a href="/cards" className="block text-center py-2 rounded-xl text-xs font-medium text-[#7c5cfc] border border-[#7c5cfc]/20 hover:bg-[#7c5cfc]/10 transition-colors">
            Manage cards →
          </a>
        </div>
      </div>
    </div>
  )
}
