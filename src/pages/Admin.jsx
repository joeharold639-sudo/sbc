import { useState, useMemo } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { useAdmin } from '../hooks/useAdmin'

function fmt(n, d = 2) { return Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) }

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="rounded-2xl border border-white/5 p-5" style={{ background: 'rgba(17,20,34,0.8)' }}>
      <p className="text-xs text-[#8892b0] uppercase tracking-widest mb-3">{label}</p>
      <p className="text-2xl font-black" style={{ color: accent }}>{value}</p>
      {sub && <p className="text-xs text-[#4a5568] mt-1">{sub}</p>}
    </div>
  )
}

function KYCBadge({ status }) {
  const map = {
    verified:    { label: 'Verified',    cls: 'text-[#00c9b1] bg-[#00c9b1]/10' },
    in_progress: { label: 'In Progress', cls: 'text-[#f5c842] bg-[#f5c842]/10' },
    pending:     { label: 'Pending',     cls: 'text-[#8892b0] bg-white/5' },
    rejected:    { label: 'Rejected',    cls: 'text-red-400 bg-red-500/10' },
  }
  const { label, cls } = map[status] ?? map.pending
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{label}</span>
}

function TxBadge({ type }) {
  const map = {
    transfer:   { label: 'Transfer',   cls: 'text-[#4f7fff] bg-[#4f7fff]/10' },
    deposit:    { label: 'Deposit',    cls: 'text-[#00c9b1] bg-[#00c9b1]/10' },
    withdrawal: { label: 'Withdrawal', cls: 'text-red-400 bg-red-500/10' },
    bill:       { label: 'Bill',       cls: 'text-[#f5c842] bg-[#f5c842]/10' },
    bitcoin:    { label: 'Bitcoin',    cls: 'text-orange-400 bg-orange-500/10' },
  }
  const { label, cls } = map[type] ?? { label: type, cls: 'text-[#8892b0] bg-white/5' }
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{label}</span>
}

function Avatar({ name }) {
  return (
    <div className="w-8 h-8 rounded-full bg-[#4f7fff]/20 flex items-center justify-center text-xs font-bold text-[#4f7fff] flex-shrink-0">
      {name?.[0]?.toUpperCase() ?? '?'}
    </div>
  )
}

const TAB_CLS = active =>
  `px-4 py-2 text-sm font-medium rounded-lg transition-all ${active ? 'bg-[#4f7fff]/15 text-white' : 'text-[#8892b0] hover:text-white'}`

const TX_TYPES = ['all', 'transfer', 'deposit', 'withdrawal', 'bill', 'bitcoin']

export default function Admin() {
  const { profiles, transactions, stats, accountByUserId, profileByAccountId, loading } = useAdmin()

  const [tab, setTab]           = useState('overview')
  const [userSearch, setUserSearch] = useState('')
  const [txFilter, setTxFilter] = useState('all')
  const [txSearch, setTxSearch] = useState('')

  const filteredUsers = useMemo(() =>
    profiles.filter(p => !userSearch ||
      p.full_name?.toLowerCase().includes(userSearch.toLowerCase())
    ), [profiles, userSearch])

  const filteredTxns = useMemo(() =>
    transactions.filter(t => {
      const matchType   = txFilter === 'all' || t.type === txFilter
      const matchSearch = !txSearch ||
        t.description?.toLowerCase().includes(txSearch.toLowerCase()) ||
        profileByAccountId[t.account_id]?.full_name?.toLowerCase().includes(txSearch.toLowerCase())
      return matchType && matchSearch
    }), [transactions, txFilter, txSearch, profileByAccountId])

  const inputCls = "bg-[#111422] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#4a5568] focus:outline-none focus:border-[#4f7fff] transition-colors"

  return (
    <DashboardLayout
      title="Admin Panel"
      subtitle="User management · transaction monitoring · system overview"
      right={
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#4f7fff]/15 text-[#4f7fff] border border-[#4f7fff]/20 uppercase tracking-widest">
          Admin
        </span>
      }
    >
      {/* Tab bar */}
      <div className="flex gap-1 mb-6">
        {[['overview', 'Overview'], ['users', 'Users'], ['transactions', 'Transactions']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} className={TAB_CLS(tab === key)}>{label}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-7 h-7 border-2 border-[#4f7fff] border-t-transparent rounded-full animate-spin"/>
        </div>
      ) : (
        <>
          {/* ── OVERVIEW ── */}
          {tab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Users"        value={stats.totalUsers}                        sub="registered accounts"          accent="#4f7fff" />
                <StatCard label="Total Balance"      value={`$${fmt(stats.totalBalance)}`}           sub="across all accounts"          accent="#00c9b1" />
                <StatCard label="Transactions"       value={stats.totalTransactions}                 sub="last 300 records"             accent="#7c5cfc" />
                <StatCard label="Volume Processed"   value={`$${fmt(stats.totalVolume)}`}            sub="total outflow"                accent="#f5c842" />
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent users */}
                <div className="rounded-2xl border border-white/5 p-5" style={{ background: 'rgba(17,20,34,0.8)' }}>
                  <h3 className="text-sm font-semibold text-[#8892b0] uppercase tracking-widest mb-4">Recent Users</h3>
                  {profiles.length === 0 ? (
                    <p className="text-sm text-[#4a5568] text-center py-8">No users yet</p>
                  ) : (
                    <div className="space-y-1">
                      {profiles.slice(0, 8).map(p => {
                        const acct = accountByUserId[p.id]
                        return (
                          <div key={p.id} className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-white/4 transition-colors">
                            <Avatar name={p.full_name} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{p.full_name || 'Unnamed'}</p>
                              <p className="text-xs text-[#4a5568]">{new Date(p.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-semibold">{acct ? `$${fmt(acct.balance)}` : '—'}</p>
                              <KYCBadge status={p.kyc_status} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Recent transactions */}
                <div className="rounded-2xl border border-white/5 p-5" style={{ background: 'rgba(17,20,34,0.8)' }}>
                  <h3 className="text-sm font-semibold text-[#8892b0] uppercase tracking-widest mb-4">Recent Transactions</h3>
                  {transactions.length === 0 ? (
                    <p className="text-sm text-[#4a5568] text-center py-8">No transactions yet</p>
                  ) : (
                    <div className="space-y-1">
                      {transactions.slice(0, 8).map(tx => {
                        const p = profileByAccountId[tx.account_id]
                        return (
                          <div key={tx.id} className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-white/4 transition-colors">
                            <TxBadge type={tx.type} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{p?.full_name || 'Unknown'}</p>
                              <p className="text-xs text-[#4a5568] truncate">{tx.description}</p>
                            </div>
                            <span className="text-sm font-semibold text-red-400 flex-shrink-0">-${fmt(tx.amount)}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── USERS ── */}
          {tab === 'users' && (
            <div className="space-y-4">
              <input
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Search by name…"
                className={inputCls + ' w-full max-w-sm'}
              />

              <div className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: 'rgba(17,20,34,0.8)' }}>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      {['User', 'Balance', 'Account No.', 'KYC', 'Role', 'Joined'].map(h => (
                        <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-[#4a5568] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-[#4a5568]">No users found</td></tr>
                    ) : filteredUsers.map(p => {
                      const acct = accountByUserId[p.id]
                      return (
                        <tr key={p.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <Avatar name={p.full_name} />
                              <span className="text-sm font-medium">{p.full_name || 'Unnamed'}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-sm font-semibold">{acct ? `$${fmt(acct.balance)}` : '—'}</td>
                          <td className="px-5 py-3.5 text-sm text-[#8892b0] font-mono">{acct?.account_number ?? '—'}</td>
                          <td className="px-5 py-3.5"><KYCBadge status={p.kyc_status} /></td>
                          <td className="px-5 py-3.5">
                            {p.is_admin
                              ? <span className="px-2 py-0.5 rounded-full text-xs font-medium text-[#4f7fff] bg-[#4f7fff]/10">Admin</span>
                              : <span className="px-2 py-0.5 rounded-full text-xs font-medium text-[#8892b0] bg-white/5">User</span>
                            }
                          </td>
                          <td className="px-5 py-3.5 text-sm text-[#4a5568]">{new Date(p.created_at).toLocaleDateString()}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                <div className="px-5 py-3 border-t border-white/5">
                  <p className="text-xs text-[#4a5568]">{filteredUsers.length} of {profiles.length} users</p>
                </div>
              </div>
            </div>
          )}

          {/* ── TRANSACTIONS ── */}
          {tab === 'transactions' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <input
                  value={txSearch}
                  onChange={e => setTxSearch(e.target.value)}
                  placeholder="Search by user or description…"
                  className={inputCls + ' flex-1 min-w-48'}
                />
                <div className="flex gap-1 flex-wrap">
                  {TX_TYPES.map(t => (
                    <button
                      key={t}
                      onClick={() => setTxFilter(t)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors capitalize ${
                        txFilter === t ? 'bg-[#4f7fff] border-[#4f7fff] text-white' : 'border-white/10 text-[#8892b0] hover:border-white/20'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: 'rgba(17,20,34,0.8)' }}>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      {['Date', 'User', 'Type', 'Amount', 'Status', 'Description'].map(h => (
                        <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-[#4a5568] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTxns.length === 0 ? (
                      <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-[#4a5568]">No transactions found</td></tr>
                    ) : filteredTxns.map(tx => {
                      const p = profileByAccountId[tx.account_id]
                      return (
                        <tr key={tx.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                          <td className="px-5 py-3.5 text-xs text-[#4a5568] whitespace-nowrap">
                            {new Date(tx.created_at).toLocaleDateString()}<br/>
                            <span className="text-[10px]">{new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <Avatar name={p?.full_name} />
                              <span className="text-sm font-medium">{p?.full_name || 'Unknown'}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5"><TxBadge type={tx.type} /></td>
                          <td className="px-5 py-3.5 text-sm font-semibold text-red-400">-${fmt(tx.amount)}</td>
                          <td className="px-5 py-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tx.status === 'completed' ? 'text-[#00c9b1] bg-[#00c9b1]/10' : 'text-[#f5c842] bg-[#f5c842]/10'}`}>
                              {tx.status ?? 'completed'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-[#8892b0] max-w-xs truncate">{tx.description}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                <div className="px-5 py-3 border-t border-white/5">
                  <p className="text-xs text-[#4a5568]">{filteredTxns.length} of {transactions.length} transactions</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  )
}
