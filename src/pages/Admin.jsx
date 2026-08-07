import { useState, useMemo } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { useAdmin } from '../hooks/useAdmin'
import { useAdminActions } from '../hooks/useAdminActions'
import { useAuth } from '../context/AuthContext'
import BalanceModal from '../components/admin/BalanceModal'
import AreaChart, { Area, XAxis, YAxis, ChartTooltip, Grid } from '../components/ui/area-chart'

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n, d = 2) {
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function fmtTime(d) {
  return new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

// ── Mini components ───────────────────────────────────────────────────────────
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
    credit:       { label: 'Credit',    cls: 'text-[#00c9b1] bg-[#00c9b1]/10' },
    debit:        { label: 'Debit',     cls: 'text-red-400 bg-red-500/10' },
    transfer:     { label: 'Transfer',  cls: 'text-[#4f7fff] bg-[#4f7fff]/10' },
    btc_buy:      { label: 'BTC Buy',   cls: 'text-orange-400 bg-orange-500/10' },
    bill_payment: { label: 'Bill',      cls: 'text-[#f5c842] bg-[#f5c842]/10' },
  }
  const { label, cls } = map[type] ?? { label: type, cls: 'text-[#8892b0] bg-white/5' }
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{label}</span>
}

function AuditBadge({ action }) {
  const map = {
    credit:   { label: 'Credit',   cls: 'text-[#00c9b1] bg-[#00c9b1]/10' },
    debit:    { label: 'Debit',    cls: 'text-red-400 bg-red-500/10' },
    freeze:   { label: 'Freeze',   cls: 'text-[#f5c842] bg-[#f5c842]/10' },
    unfreeze: { label: 'Unfreeze', cls: 'text-[#4f7fff] bg-[#4f7fff]/10' },
  }
  const { label, cls } = map[action] ?? { label: action, cls: 'text-[#8892b0] bg-white/5' }
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{label}</span>
}

function Avatar({ name }) {
  return (
    <div className="w-8 h-8 rounded-full bg-[#4f7fff]/20 flex items-center justify-center text-xs font-bold text-[#4f7fff] flex-shrink-0">
      {name?.[0]?.toUpperCase() ?? '?'}
    </div>
  )
}

function AmountCell({ type, amount }) {
  const isCredit = type === 'credit'
  return (
    <span className={`font-semibold font-mono ${isCredit ? 'text-[#00c9b1]' : 'text-red-400'}`}>
      {isCredit ? '+' : '-'}${fmt(amount)}
    </span>
  )
}

const TAB_CLS = active =>
  `px-4 py-2 text-sm font-medium rounded-lg transition-all ${active
    ? 'bg-[#4f7fff]/15 text-white'
    : 'text-[#8892b0] hover:text-white'}`

const inputCls = "bg-[#111422] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#4a5568] focus:outline-none focus:border-[#4f7fff] transition-colors"

const TABS = [
  ['overview',     'Overview'],
  ['users',        'Users'],
  ['transactions', 'Transactions'],
  ['analytics',    'Analytics'],
  ['audit',        'Audit Log'],
]

const TX_TYPES = ['all', 'credit', 'debit', 'transfer', 'btc_buy', 'bill_payment']

// ── Main component ────────────────────────────────────────────────────────────
export default function Admin() {
  const { profile: myProfile } = useAuth()
  const isSuperAdmin = myProfile?.admin_role === 'super_admin'

  const {
    profiles, accounts, transactions, auditLog,
    stats, accountByUserId, profileByAccountId, profileById,
    loading, refresh,
  } = useAdmin()

  const { freezeAccount, unfreezeAccount, loading: actionLoading } = useAdminActions()

  const [tab,        setTab]        = useState('overview')
  const [userSearch, setUserSearch] = useState('')
  const [txFilter,   setTxFilter]   = useState('all')
  const [txSearch,   setTxSearch]   = useState('')
  const [freezingId, setFreezingId] = useState(null)
  const [balanceModal, setBalanceModal] = useState(null) // { user, account }

  // ── Filtered data ──────────────────────────────────────────────────────────
  const filteredUsers = useMemo(() =>
    profiles.filter(p => !userSearch ||
      p.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      p.email?.toLowerCase().includes(userSearch.toLowerCase())
    ), [profiles, userSearch])

  const filteredTxns = useMemo(() =>
    transactions.filter(t => {
      const matchType   = txFilter === 'all' || t.type === txFilter
      const matchSearch = !txSearch ||
        t.description?.toLowerCase().includes(txSearch.toLowerCase()) ||
        profileByAccountId[t.account_id]?.full_name?.toLowerCase().includes(txSearch.toLowerCase())
      return matchType && matchSearch
    }), [transactions, txFilter, txSearch, profileByAccountId])

  // ── Analytics data (computed from existing state, no extra queries) ────────
  const analyticsData = useMemo(() => {
    // Cumulative user growth
    const sorted = [...profiles].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    let count = 0
    const userGrowth = sorted.map(p => ({ date: new Date(p.created_at), value: ++count }))

    // Daily transaction volume — last 30 days
    const cutoff = Date.now() - 30 * 86400000
    const byDay = {}
    transactions
      .filter(t => new Date(t.created_at).getTime() > cutoff)
      .forEach(t => {
        const day = new Date(t.created_at).toISOString().slice(0, 10)
        byDay[day] = (byDay[day] || 0) + Number(t.amount)
      })
    const txVolume = Object.entries(byDay)
      .map(([day, value]) => ({ date: new Date(day + 'T00:00:00'), value }))
      .sort((a, b) => a.date - b.date)

    return { userGrowth, txVolume }
  }, [profiles, transactions])

  // ── Actions ────────────────────────────────────────────────────────────────
  async function handleFreeze(account) {
    const isFrozen = account.status === 'frozen'
    const user = profileByAccountId[account.id]
    const label = isFrozen ? 'Unfreeze' : 'Freeze'
    if (!window.confirm(`${label} ${user?.full_name ?? 'this account'}?`)) return
    setFreezingId(account.id)
    const action = isFrozen ? unfreezeAccount : freezeAccount
    await action(account.id, `${label} by admin`)
    setFreezingId(null)
    refresh()
  }

  function openBalanceModal(user, account) {
    setBalanceModal({ user, account })
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout
      title="Admin Panel"
      subtitle="User management · transaction monitoring · system overview"
      right={
        <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-widest ${
          isSuperAdmin
            ? 'bg-[#4f7fff]/15 text-[#4f7fff] border-[#4f7fff]/20'
            : 'bg-[#f5c842]/10 text-[#f5c842] border-[#f5c842]/20'
        }`}>
          {isSuperAdmin ? 'Super Admin' : 'Support'}
        </span>
      }
    >
      {/* Tab bar */}
      <div className="flex gap-1 mb-6 flex-wrap">
        {TABS.map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} className={TAB_CLS(tab === key)}>
            {label}
          </button>
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
                <StatCard label="Total Users"      value={stats.totalUsers}              sub="registered accounts"  accent="#4f7fff" />
                <StatCard label="Total Balance"    value={`$${fmt(stats.totalBalance)}`} sub="across all accounts"  accent="#00c9b1" />
                <StatCard label="Transactions"     value={stats.totalTransactions}       sub="last 300 records"     accent="#7c5cfc" />
                <StatCard label="Volume Processed" value={`$${fmt(stats.totalVolume)}`}  sub="total tx value"       accent="#f5c842" />
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent users */}
                <div className="rounded-2xl border border-white/5 p-5" style={{ background: 'rgba(17,20,34,0.8)' }}>
                  <h3 className="text-xs font-bold text-[#8892b0] uppercase tracking-widest mb-4">Recent Users</h3>
                  {profiles.length === 0
                    ? <p className="text-sm text-[#4a5568] text-center py-8">No users yet</p>
                    : (
                      <div className="space-y-1">
                        {profiles.slice(0, 8).map(p => {
                          const acct = accountByUserId[p.id]
                          return (
                            <div key={p.id} className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-white/4 transition-colors">
                              <Avatar name={p.full_name} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{p.full_name || 'Unnamed'}</p>
                                <p className="text-xs text-[#4a5568]">{fmtDate(p.created_at)}</p>
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
                  <h3 className="text-xs font-bold text-[#8892b0] uppercase tracking-widest mb-4">Recent Transactions</h3>
                  {transactions.length === 0
                    ? <p className="text-sm text-[#4a5568] text-center py-8">No transactions yet</p>
                    : (
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
                              <AmountCell type={tx.type} amount={tx.amount} />
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
                placeholder="Search by name or email…"
                className={inputCls + ' w-full max-w-sm'}
              />

              <div className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: 'rgba(17,20,34,0.8)' }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5">
                        {['User', 'Balance', 'Account No.', 'Status', 'KYC', 'Role', 'Joined', 'Actions'].map(h => (
                          <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-[#4a5568] uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-[#4a5568]">No users found</td></tr>
                      ) : filteredUsers.map(p => {
                        const acct = accountByUserId[p.id]
                        const isFrozen = acct?.status === 'frozen'
                        const isProcessing = freezingId === acct?.id
                        return (
                          <tr key={p.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-3">
                                <Avatar name={p.full_name} />
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate">{p.full_name || 'Unnamed'}</p>
                                  <p className="text-xs text-[#4a5568] truncate">{p.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-sm font-semibold font-mono">{acct ? `$${fmt(acct.balance)}` : '—'}</td>
                            <td className="px-4 py-3.5 text-sm text-[#8892b0] font-mono whitespace-nowrap">{acct?.account_number ?? '—'}</td>
                            <td className="px-4 py-3.5">
                              {acct
                                ? <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${isFrozen ? 'text-[#f5c842] bg-[#f5c842]/10' : 'text-[#00c9b1] bg-[#00c9b1]/10'}`}>
                                    {acct.status ?? 'active'}
                                  </span>
                                : '—'}
                            </td>
                            <td className="px-4 py-3.5"><KYCBadge status={p.kyc_status} /></td>
                            <td className="px-4 py-3.5">
                              {p.is_admin
                                ? <span className="px-2 py-0.5 rounded-full text-xs font-medium text-[#4f7fff] bg-[#4f7fff]/10">Admin</span>
                                : <span className="px-2 py-0.5 rounded-full text-xs font-medium text-[#8892b0] bg-white/5">User</span>
                              }
                            </td>
                            <td className="px-4 py-3.5 text-sm text-[#4a5568] whitespace-nowrap">{fmtDate(p.created_at)}</td>
                            <td className="px-4 py-3.5">
                              {acct ? (
                                <div className="flex items-center gap-1.5">
                                  {isSuperAdmin && (
                                    <>
                                      <button
                                        onClick={() => openBalanceModal(p, acct)}
                                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#00c9b1]/10 text-[#00c9b1] hover:bg-[#00c9b1]/20 transition-colors"
                                      >
                                        Credit
                                      </button>
                                      <button
                                        onClick={() => openBalanceModal(p, acct)}
                                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                      >
                                        Debit
                                      </button>
                                    </>
                                  )}
                                  <button
                                    onClick={() => handleFreeze(acct)}
                                    disabled={isProcessing || actionLoading || (isFrozen && !isSuperAdmin)}
                                    title={isFrozen && !isSuperAdmin ? 'Only super_admin can unfreeze' : undefined}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 ${
                                      isFrozen
                                        ? 'bg-[#4f7fff]/10 text-[#4f7fff] hover:bg-[#4f7fff]/20'
                                        : 'bg-[#f5c842]/10 text-[#f5c842] hover:bg-[#f5c842]/20'
                                    }`}
                                  >
                                    {isProcessing ? '…' : isFrozen ? 'Unfreeze' : 'Freeze'}
                                  </button>
                                </div>
                              ) : '—'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
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
                      {t.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: 'rgba(17,20,34,0.8)' }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5">
                        {['Date', 'User', 'Type', 'Amount', 'Status', 'Description'].map(h => (
                          <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-[#4a5568] uppercase tracking-wider whitespace-nowrap">{h}</th>
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
                              {fmtDate(tx.created_at)}<br />
                              <span className="text-[10px]">{fmtTime(tx.created_at)}</span>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2">
                                <Avatar name={p?.full_name} />
                                <span className="text-sm font-medium">{p?.full_name || 'Unknown'}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5"><TxBadge type={tx.type} /></td>
                            <td className="px-5 py-3.5"><AmountCell type={tx.type} amount={tx.amount} /></td>
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
                </div>
                <div className="px-5 py-3 border-t border-white/5">
                  <p className="text-xs text-[#4a5568]">{filteredTxns.length} of {transactions.length} transactions</p>
                </div>
              </div>
            </div>
          )}

          {/* ── ANALYTICS ── */}
          {tab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Users"     value={stats.totalUsers}              sub="all time"            accent="#4f7fff" />
                <StatCard label="Total Balance"   value={`$${fmt(stats.totalBalance)}`} sub="platform total"      accent="#00c9b1" />
                <StatCard label="Avg Balance"     value={accounts.length ? `$${fmt(stats.totalBalance / accounts.length)}` : '—'} sub="per account" accent="#7c5cfc" />
                <StatCard label="30-Day Volume"   value={`$${fmt(analyticsData.txVolume.reduce((s, d) => s + d.value, 0))}`} sub="transaction value" accent="#f5c842" />
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* User growth */}
                <div className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: 'rgba(17,20,34,0.8)' }}>
                  <div className="px-5 pt-4 pb-2">
                    <p className="text-xs font-bold text-[#8892b0] uppercase tracking-widest">User Growth</p>
                    <p className="text-xl font-black text-white mt-1">{stats.totalUsers} total</p>
                  </div>
                  {analyticsData.userGrowth.length > 1 ? (
                    <AreaChart data={analyticsData.userGrowth} xDataKey="date" aspectRatio="2/1">
                      <Grid />
                      <Area dataKey="value" stroke="#4f7fff" fill="#4f7fff" fillOpacity={0.12} strokeWidth={2} />
                      <XAxis />
                      <YAxis />
                      <ChartTooltip rows={pt => [{ color: '#4f7fff', label: 'Users', value: pt.value }]} />
                    </AreaChart>
                  ) : (
                    <p className="text-sm text-[#4a5568] text-center py-10">Not enough data yet</p>
                  )}
                </div>

                {/* Transaction volume */}
                <div className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: 'rgba(17,20,34,0.8)' }}>
                  <div className="px-5 pt-4 pb-2">
                    <p className="text-xs font-bold text-[#8892b0] uppercase tracking-widest">30-Day Transaction Volume</p>
                    <p className="text-xl font-black text-white mt-1">
                      ${fmt(analyticsData.txVolume.reduce((s, d) => s + d.value, 0))}
                    </p>
                  </div>
                  {analyticsData.txVolume.length > 1 ? (
                    <AreaChart data={analyticsData.txVolume} xDataKey="date" aspectRatio="2/1">
                      <Grid />
                      <Area dataKey="value" stroke="#00c9b1" fill="#00c9b1" fillOpacity={0.12} strokeWidth={2} />
                      <XAxis />
                      <YAxis />
                      <ChartTooltip rows={pt => [{ color: '#00c9b1', label: 'Volume', value: `$${fmt(pt.value)}` }]} />
                    </AreaChart>
                  ) : (
                    <p className="text-sm text-[#4a5568] text-center py-10">Not enough data yet</p>
                  )}
                </div>
              </div>

              {/* Top users by balance */}
              <div className="rounded-2xl border border-white/5 p-5" style={{ background: 'rgba(17,20,34,0.8)' }}>
                <h3 className="text-xs font-bold text-[#8892b0] uppercase tracking-widest mb-4">Top Accounts by Balance</h3>
                <div className="space-y-2">
                  {[...accounts]
                    .sort((a, b) => b.balance - a.balance)
                    .slice(0, 8)
                    .map((acct, i) => {
                      const p = profileByAccountId[acct.id]
                      const pct = stats.totalBalance > 0 ? (acct.balance / stats.totalBalance) * 100 : 0
                      return (
                        <div key={acct.id} className="flex items-center gap-3">
                          <span className="text-xs text-[#4a5568] w-5 text-right font-mono">{i + 1}</span>
                          <Avatar name={p?.full_name} />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium truncate">{p?.full_name || 'Unknown'}</span>
                              <span className="font-semibold font-mono flex-shrink-0 ml-2">${fmt(acct.balance)}</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                              <div className="h-full rounded-full bg-[#4f7fff]" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            </div>
          )}

          {/* ── AUDIT LOG ── */}
          {tab === 'audit' && (
            <div className="space-y-4">
              {auditLog.length === 0 ? (
                <div className="rounded-2xl border border-white/5 p-10 text-center" style={{ background: 'rgba(17,20,34,0.8)' }}>
                  <p className="text-[#8892b0] text-sm mb-2">No audit entries yet.</p>
                  <p className="text-[#4a5568] text-xs">
                    Apply <code className="font-mono text-[#4f7fff]">scripts/schema-v3.sql</code> in the Supabase SQL editor,
                    then perform an admin action (credit, debit, freeze) to start the audit trail.
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: 'rgba(17,20,34,0.8)' }}>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/5">
                          {['Date / Time', 'Admin', 'Action', 'Target Account', 'Amount', 'Reason'].map(h => (
                            <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-[#4a5568] uppercase tracking-wider whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {auditLog.map(entry => {
                          const admin   = profileById[entry.admin_id]
                          const target  = profileByAccountId[entry.target_account_id]
                          return (
                            <tr key={entry.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                              <td className="px-5 py-3.5 text-xs text-[#4a5568] whitespace-nowrap">
                                {fmtDate(entry.created_at)}<br />
                                <span className="text-[10px]">{fmtTime(entry.created_at)}</span>
                              </td>
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-2">
                                  <Avatar name={admin?.full_name} />
                                  <span className="text-sm font-medium">{admin?.full_name || 'Unknown'}</span>
                                </div>
                              </td>
                              <td className="px-5 py-3.5"><AuditBadge action={entry.action} /></td>
                              <td className="px-5 py-3.5 text-sm text-[#8892b0]">{target?.full_name || '—'}</td>
                              <td className="px-5 py-3.5">
                                {entry.amount != null
                                  ? <AmountCell type={entry.action} amount={entry.amount} />
                                  : <span className="text-[#4a5568]">—</span>
                                }
                              </td>
                              <td className="px-5 py-3.5 text-sm text-[#8892b0] max-w-xs truncate">{entry.reason || '—'}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-5 py-3 border-t border-white/5">
                    <p className="text-xs text-[#4a5568]">{auditLog.length} entries (last 200)</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Balance modal */}
      {balanceModal && (
        <BalanceModal
          isOpen={true}
          onClose={() => setBalanceModal(null)}
          user={balanceModal.user}
          account={balanceModal.account}
          onSuccess={() => { setBalanceModal(null); refresh() }}
        />
      )}
    </DashboardLayout>
  )
}
