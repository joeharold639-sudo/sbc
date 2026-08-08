import { useState, useMemo } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { useAccount } from '../hooks/useAccount'
import { useTransactions } from '../hooks/useTransactions'

function fmt(n) { return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }

const TYPE_LABELS = {
  credit:       { label: 'Credit',   cls: 'text-[#00c9b1] bg-[#00c9b1]/10' },
  debit:        { label: 'Debit',    cls: 'text-red-400 bg-red-500/10' },
  transfer:     { label: 'Transfer', cls: 'text-[#4f7fff] bg-[#4f7fff]/10' },
  btc_buy:      { label: 'BTC Buy',  cls: 'text-orange-400 bg-orange-500/10' },
  btc_sell:     { label: 'BTC Sell', cls: 'text-orange-300 bg-orange-400/10' },
  bill_payment: { label: 'Bill',     cls: 'text-[#f5c842] bg-[#f5c842]/10' },
}

const PAGE_SIZE = 20

export default function History() {
  const { account }              = useAccount()
  const { transactions, loading } = useTransactions(account?.id)

  const [search,    setSearch]    = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [page,      setPage]      = useState(1)

  const TYPES = ['all', ...Object.keys(TYPE_LABELS)]

  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      const matchType   = typeFilter === 'all' || tx.type === typeFilter
      const matchSearch = !search ||
        tx.description?.toLowerCase().includes(search.toLowerCase()) ||
        tx.recipient_name?.toLowerCase().includes(search.toLowerCase())
      return matchType && matchSearch
    })
  }, [transactions, typeFilter, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Summary stats
  const stats = useMemo(() => {
    const credits  = filtered.filter(t => t.type === 'credit').reduce((s, t) => s + Number(t.amount), 0)
    const debits   = filtered.filter(t => t.type !== 'credit').reduce((s, t) => s + Number(t.amount), 0)
    return { credits, debits, count: filtered.length }
  }, [filtered])

  function handleTypeChange(t) { setTypeFilter(t); setPage(1) }
  function handleSearch(v)     { setSearch(v);     setPage(1) }

  const inputCls = "bg-[#111422] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#4a5568] focus:outline-none focus:border-[#4f7fff] transition-colors"

  return (
    <DashboardLayout title="Transaction History" subtitle="Complete record of all account activity">
      <div className="max-w-4xl space-y-5">

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Transactions', value: stats.count,               color: '#4f7fff', prefix: '' },
            { label: 'Total Credited',     value: fmt(stats.credits),        color: '#00c9b1', prefix: '+$' },
            { label: 'Total Debited',      value: fmt(stats.debits),         color: '#f56565', prefix: '-$' },
          ].map(({ label, value, color, prefix }) => (
            <div key={label} className="rounded-2xl border border-white/5 p-4" style={{ background: 'rgba(17,20,34,0.8)' }}>
              <p className="text-xs text-[#8892b0] mb-1">{label}</p>
              <p className="text-xl font-black" style={{ color }}>{prefix}{value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-white/5 p-4" style={{ background: 'rgba(17,20,34,0.8)' }}>
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search description or recipient…"
              value={search}
              onChange={e => handleSearch(e.target.value)}
              className={inputCls + " flex-1 min-w-48"}
            />
            <div className="flex gap-1 flex-wrap">
              {TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => handleTypeChange(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                    typeFilter === t
                      ? 'bg-[#4f7fff]/20 text-white border border-[#4f7fff]/30'
                      : 'text-[#8892b0] hover:text-white border border-transparent hover:border-white/10'
                  }`}>
                  {t === 'all' ? 'All' : TYPE_LABELS[t]?.label ?? t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: 'rgba(17,20,34,0.8)' }}>
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-6 h-6 border-2 border-[#4f7fff] border-t-transparent rounded-full animate-spin"/>
            </div>
          ) : paginated.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-[#4a5568] text-sm">No transactions found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      {['Date', 'Description', 'Type', 'Amount', 'Status'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[#8892b0] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((tx, i) => {
                      const isCredit = tx.type === 'credit' || tx.type === 'btc_sell'
                      const meta     = TYPE_LABELS[tx.type] ?? { label: tx.type, cls: 'text-[#8892b0] bg-white/5' }
                      return (
                        <tr key={tx.id} className={`border-b border-white/5 hover:bg-white/2 transition-colors ${i % 2 === 0 ? '' : 'bg-white/1'}`}>
                          <td className="px-5 py-3.5 text-sm text-[#8892b0] whitespace-nowrap">
                            {new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="px-5 py-3.5 max-w-xs">
                            <p className="text-sm text-white truncate">{tx.description || '—'}</p>
                            {tx.recipient_name && <p className="text-xs text-[#4a5568] truncate">To: {tx.recipient_name}</p>}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${meta.cls}`}>{meta.label}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`font-bold font-mono text-sm ${isCredit ? 'text-[#00c9b1]' : 'text-red-400'}`}>
                              {isCredit ? '+' : '-'}${fmt(tx.amount)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              tx.status === 'completed' ? 'text-[#00c9b1] bg-[#00c9b1]/10' :
                              tx.status === 'pending'   ? 'text-[#f5c842] bg-[#f5c842]/10' :
                              'text-red-400 bg-red-500/10'
                            }`}>{tx.status ?? 'completed'}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-white/5">
                  <p className="text-xs text-[#4a5568]">
                    Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                  </p>
                  <div className="flex gap-1">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      className="px-3 py-1.5 rounded-lg text-xs text-[#8892b0] hover:text-white border border-white/10 hover:border-white/20 disabled:opacity-30 transition-all">
                      ← Prev
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
                      return (
                        <button key={p} onClick={() => setPage(p)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            p === page ? 'bg-[#4f7fff]/20 text-white border border-[#4f7fff]/30' : 'text-[#8892b0] hover:text-white border border-white/10 hover:border-white/20'
                          }`}>
                          {p}
                        </button>
                      )
                    })}
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                      className="px-3 py-1.5 rounded-lg text-xs text-[#8892b0] hover:text-white border border-white/10 hover:border-white/20 disabled:opacity-30 transition-all">
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
