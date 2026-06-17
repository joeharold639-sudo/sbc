import { useState, useMemo } from 'react'

const TYPE_META = {
  credit:       { label: 'Credit',        color: 'text-[#00c9b1]', sign: '+', icon: '↙', bg: 'bg-[#00c9b1]/15' },
  debit:        { label: 'Debit',         color: 'text-red-400',   sign: '-', icon: '↗', bg: 'bg-red-500/15' },
  transfer:     { label: 'Transfer',      color: 'text-red-400',   sign: '-', icon: '⇄', bg: 'bg-[#4f7fff]/15' },
  btc_buy:      { label: 'BTC Purchase',  color: 'text-red-400',   sign: '-', icon: '₿', bg: 'bg-[#f5c842]/15' },
  btc_sell:     { label: 'BTC Sale',      color: 'text-[#00c9b1]', sign: '+', icon: '₿', bg: 'bg-[#f5c842]/15' },
  bill_payment: { label: 'Bill Payment',  color: 'text-red-400',   sign: '-', icon: '📄', bg: 'bg-purple-500/15' },
}

function fmt(n) {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

function groupByDate(txns) {
  const groups = {}
  txns.forEach(tx => {
    const d = new Date(tx.created_at)
    const today = new Date()
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
    let label
    if (d.toDateString() === today.toDateString()) label = 'Today'
    else if (d.toDateString() === yesterday.toDateString()) label = 'Yesterday'
    else label = d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
    if (!groups[label]) groups[label] = []
    groups[label].push(tx)
  })
  return groups
}

function StatusBadge({ status }) {
  if (status === 'completed') return null
  const cls = status === 'pending' ? 'text-[#f5c842] bg-[#f5c842]/10' : 'text-red-400 bg-red-500/10'
  return <span className={`text-[10px] px-1.5 py-0.5 rounded-md capitalize ${cls}`}>{status}</span>
}

export default function TransactionFeed({ transactions, loading }) {
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('all')

  const filters = ['all', 'credit', 'debit', 'transfer', 'btc_buy', 'bill_payment']

  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      const matchesFilter = filter === 'all' || tx.type === filter
      const q = search.toLowerCase()
      const matchesSearch = !q ||
        tx.description?.toLowerCase().includes(q) ||
        tx.recipient_name?.toLowerCase().includes(q) ||
        tx.type.includes(q)
      return matchesFilter && matchesSearch
    })
  }, [transactions, search, filter])

  const groups = useMemo(() => groupByDate(filtered), [filtered])

  return (
    <div>
      {/* Header + search */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#8892b0] uppercase tracking-widest">Transactions</h3>
        <a href="/history" className="text-xs text-[#4f7fff] hover:text-white transition-colors">View all →</a>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4a5568" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search transactions…"
          className="w-full bg-[#111422] border border-white/8 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-[#4a5568] focus:outline-none focus:border-[#4f7fff]/50 transition-colors"
        />
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
              filter === f
                ? 'bg-[#4f7fff] text-white'
                : 'bg-white/5 text-[#8892b0] hover:text-white hover:bg-white/10'
            }`}>
            {f === 'all' ? 'All' : f === 'btc_buy' ? 'Bitcoin' : f === 'bill_payment' ? 'Bills' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-9 h-9 rounded-xl bg-white/5 flex-shrink-0"/>
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-white/5 rounded w-1/2"/>
                <div className="h-2.5 bg-white/5 rounded w-1/3"/>
              </div>
              <div className="h-3 bg-white/5 rounded w-16"/>
            </div>
          ))}
        </div>
      ) : Object.keys(groups).length === 0 ? (
        <div className="text-center py-12 text-[#4a5568]">
          <svg className="w-10 h-10 mx-auto mb-3 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <p className="text-sm">No transactions found</p>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(groups).map(([date, txns]) => (
            <div key={date}>
              <p className="text-[11px] text-[#4a5568] font-semibold uppercase tracking-widest mb-2.5">{date}</p>
              <div className="space-y-1">
                {txns.map(tx => {
                  const meta = TYPE_META[tx.type] ?? TYPE_META.debit
                  const time = new Date(tx.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                  return (
                    <div key={tx.id}
                         className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/4 transition-colors group cursor-pointer">
                      <div className={`w-9 h-9 rounded-xl ${meta.bg} flex items-center justify-center text-base flex-shrink-0`}>
                        {meta.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{tx.description}</p>
                        <p className="text-xs text-[#4a5568] flex items-center gap-1.5 mt-0.5">
                          {time}
                          {tx.recipient_name && <><span>·</span><span className="truncate">{tx.recipient_name}</span></>}
                          <StatusBadge status={tx.status}/>
                        </p>
                      </div>
                      <p className={`text-sm font-semibold flex-shrink-0 ${meta.color}`}>
                        {meta.sign}${fmt(tx.amount)}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
