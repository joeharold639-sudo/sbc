import { useState, useEffect } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { useAccount } from '../hooks/useAccount'
import { supabase } from '../lib/supabase'

function fmt(n) { return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }

const STATUS_MAP = {
  pending:  { label: 'Under Review', cls: 'text-[#f5c842] bg-[#f5c842]/10', dot: 'bg-[#f5c842]' },
  approved: { label: 'Approved',     cls: 'text-[#00c9b1] bg-[#00c9b1]/10', dot: 'bg-[#00c9b1]' },
  rejected: { label: 'Rejected',     cls: 'text-red-400 bg-red-500/10',      dot: 'bg-red-400' },
}

function StatusBadge({ status }) {
  const { label, cls, dot } = STATUS_MAP[status] ?? STATUS_MAP.pending
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`}/>
      {label}
    </span>
  )
}

const PURPOSES = {
  loan:  ['Business expansion', 'Debt consolidation', 'Home improvement', 'Medical expenses', 'Education', 'Vehicle purchase', 'Other'],
  grant: ['Small business startup', 'Community project', 'Education & training', 'Healthcare', 'Agricultural development', 'Technology', 'Other'],
}

export default function Apply() {
  const { account } = useAccount()
  const [applications, setApplications] = useState([])
  const [loadingApps, setLoadingApps]   = useState(true)

  const [type,    setType]    = useState('loan')
  const [amount,  setAmount]  = useState('')
  const [purpose, setPurpose] = useState('')
  const [details, setDetails] = useState('')
  const [step,    setStep]    = useState(0) // 0=form 1=success
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  useEffect(() => { fetchApplications() }, [account?.id])

  async function fetchApplications() {
    if (!account?.id) return
    setLoadingApps(true)
    const { data } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false })
    setApplications(data ?? [])
    setLoadingApps(false)
  }

  async function submit(e) {
    e.preventDefault()
    if (!account) return
    setLoading(true); setError('')
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) { setError('Enter a valid amount.'); setLoading(false); return }
    if (amt > 500000)     { setError('Maximum application amount is $500,000.'); setLoading(false); return }
    if (!purpose)         { setError('Select a purpose.'); setLoading(false); return }

    const { error: err } = await supabase.from('applications').insert({
      user_id:    (await supabase.auth.getUser()).data.user.id,
      account_id: account.id,
      type,
      amount:     amt,
      purpose,
      details:    details.trim() || null,
    })

    setLoading(false)
    if (err) { setError(err.message); return }
    await fetchApplications()
    setStep(1)
  }

  function startNew() {
    setStep(0); setAmount(''); setPurpose(''); setDetails(''); setError('')
  }

  const inputCls = "w-full bg-[#111422] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[#4a5568] focus:outline-none focus:border-[#4f7fff] transition-colors"

  return (
    <DashboardLayout title="Apply for Funding" subtitle="Loans and grants reviewed within 24–48 hours">
      <div className="grid lg:grid-cols-5 gap-6 max-w-5xl">

        {/* Left: form */}
        <div className="lg:col-span-3">
          {step === 1 ? (
            <div className="rounded-2xl border border-white/5 p-10 text-center" style={{ background: 'rgba(17,20,34,0.8)' }}>
              <div className="w-16 h-16 rounded-full bg-[#00c9b1]/15 flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00c9b1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h2 className="text-xl font-black mb-2">Application submitted</h2>
              <p className="text-[#8892b0] text-sm mb-6">We'll review your application and credit your account if approved. You'll be notified within 24–48 hours.</p>
              <button onClick={startNew} className="px-6 py-3 bg-[#4f7fff] hover:bg-blue-500 rounded-xl text-sm font-semibold transition-all">
                New application
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="rounded-2xl border border-white/5 p-6 space-y-5" style={{ background: 'rgba(17,20,34,0.8)' }}>
              <h3 className="font-bold text-white">Application details</h3>

              {/* Type toggle */}
              <div>
                <label className="block text-sm text-[#8892b0] mb-2">Funding type</label>
                <div className="grid grid-cols-2 gap-2">
                  {['loan', 'grant'].map(t => (
                    <button key={t} type="button" onClick={() => { setType(t); setPurpose('') }}
                      className={`py-3 rounded-xl text-sm font-semibold border transition-all capitalize ${
                        type === t
                          ? 'bg-[#4f7fff]/15 border-[#4f7fff]/40 text-white'
                          : 'border-white/10 text-[#8892b0] hover:border-white/20 hover:text-white'
                      }`}>
                      {t === 'loan' ? '🏦 ' : '🎁 '}{t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-[#4a5568] mt-2">
                  {type === 'loan'
                    ? 'Loans are credited to your account and must be repaid per agreed terms.'
                    : 'Grants are non-repayable funds awarded based on eligibility.'}
                </p>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm text-[#8892b0] mb-1.5">Amount requested (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a5568] text-sm font-medium">$</span>
                  <input
                    type="number" min="1" max="500000" step="0.01"
                    value={amount} onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    className={inputCls + " pl-7"}
                    required
                  />
                </div>
                {amount && parseFloat(amount) > 0 && (
                  <p className="text-xs text-[#4f7fff] mt-1">Requesting ${fmt(parseFloat(amount))}</p>
                )}
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-sm text-[#8892b0] mb-1.5">Purpose</label>
                <select value={purpose} onChange={e => setPurpose(e.target.value)}
                  className={inputCls} style={{ colorScheme: 'dark' }} required>
                  <option value="">Select a purpose…</option>
                  {PURPOSES[type].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              {/* Details */}
              <div>
                <label className="block text-sm text-[#8892b0] mb-1.5">Additional details <span className="text-[#4a5568]">(optional)</span></label>
                <textarea
                  value={details} onChange={e => setDetails(e.target.value)}
                  placeholder="Describe how you plan to use the funds…"
                  rows={4}
                  className={inputCls + " resize-none"}
                />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button type="submit" disabled={loading || !amount || !purpose}
                className="w-full py-3.5 bg-[#4f7fff] hover:bg-blue-500 disabled:opacity-40 rounded-xl text-sm font-semibold transition-all">
                {loading ? 'Submitting…' : `Submit ${type} application`}
              </button>
            </form>
          )}
        </div>

        {/* Right: my applications */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-white/5 p-5" style={{ background: 'rgba(17,20,34,0.8)' }}>
            <h3 className="text-sm font-semibold text-[#8892b0] uppercase tracking-widest mb-4">My Applications</h3>
            {loadingApps ? (
              <div className="flex justify-center py-8">
                <div className="w-5 h-5 border-2 border-[#4f7fff] border-t-transparent rounded-full animate-spin"/>
              </div>
            ) : applications.length === 0 ? (
              <p className="text-sm text-[#4a5568] text-center py-8">No applications yet</p>
            ) : (
              <div className="space-y-3">
                {applications.map(app => (
                  <div key={app.id} className="p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-xs text-[#8892b0] capitalize">{app.type}</span>
                        <p className="text-sm font-bold text-white">${fmt(app.amount)}</p>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>
                    <p className="text-xs text-[#4a5568]">{app.purpose}</p>
                    {app.review_note && (
                      <p className="text-xs text-[#8892b0] mt-1.5 italic">"{app.review_note}"</p>
                    )}
                    <p className="text-xs text-[#4a5568] mt-1.5">{new Date(app.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
