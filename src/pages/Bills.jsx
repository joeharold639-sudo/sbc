import { useState, useMemo } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { useAccount } from '../hooks/useAccount'
import { useTransactions } from '../hooks/useTransactions'
import { supabase } from '../lib/supabase'

function fmt(n, d = 2) { return Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) }

const BILLERS = [
  { id: 'electricity', name: 'Electricity', icon: '⚡', color: '#f5c842', bg: 'rgba(245,200,66,0.1)' },
  { id: 'water',       name: 'Water',       icon: '💧', color: '#4f7fff', bg: 'rgba(79,127,255,0.1)' },
  { id: 'internet',    name: 'Internet',    icon: '📡', color: '#7c5cfc', bg: 'rgba(124,92,252,0.1)' },
  { id: 'gas',         name: 'Gas',         icon: '🔥', color: '#ff6b6b', bg: 'rgba(255,107,107,0.1)' },
  { id: 'phone',       name: 'Phone',       icon: '📱', color: '#00c9b1', bg: 'rgba(0,201,177,0.1)' },
  { id: 'tv',          name: 'Cable/TV',    icon: '📺', color: '#8892b0', bg: 'rgba(136,146,176,0.1)' },
  { id: 'rent',        name: 'Rent',        icon: '🏠', color: '#4f7fff', bg: 'rgba(79,127,255,0.1)' },
  { id: 'insurance',   name: 'Insurance',   icon: '🛡️', color: '#00c9b1', bg: 'rgba(0,201,177,0.1)' },
]

const inputCls = "w-full bg-[#111422] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[#4a5568] focus:outline-none focus:border-[#4f7fff] transition-colors"

export default function Bills() {
  const { account, refresh: refreshAccount } = useAccount()
  const { transactions, refetch }            = useTransactions(account?.id)

  const [selected, setSelected] = useState(null)
  const [form, setForm]         = useState({ accountNumber: '', amount: '', note: '' })
  const [step, setStep]         = useState(0)  // 0=select 1=form 2=confirm 3=success
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const recentBills = useMemo(() =>
    transactions.filter(t => t.type === 'bill').slice(0, 6), [transactions])

  function selectBiller(b) {
    setSelected(b)
    setForm({ accountNumber: '', amount: '', note: '' })
    setError('')
    setStep(1)
  }

  function goConfirm() {
    if (!form.accountNumber || !form.amount) return
    setError('')
    setStep(2)
  }

  async function submit() {
    setLoading(true); setError('')
    const amount = parseFloat(form.amount)
    if (amount > account.balance) { setError('Insufficient balance.'); setLoading(false); return }

    const { error: e } = await supabase.from('transactions').insert({
      account_id:  account.id,
      type:        'bill',
      amount,
      currency:    account.currency || 'USD',
      description: `${selected.name} Bill`,
      recipient_name:    selected.name,
      recipient_account: form.accountNumber,
      status:      'completed',
    })
    if (e) { setError(e.message); setLoading(false); return }
    await supabase.from('accounts').update({ balance: account.balance - amount }).eq('id', account.id)
    refreshAccount(); refetch()
    setLoading(false); setStep(3)
  }

  function reset() {
    setSelected(null)
    setForm({ accountNumber: '', amount: '', note: '' })
    setStep(0)
    setError('')
  }

  return (
    <DashboardLayout title="Pay Bills" subtitle="Pay utilities, rent, and more — instantly">
      <div className="grid lg:grid-cols-5 gap-6 max-w-5xl">

        {/* Left: main flow */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-white/5 p-6" style={{ background: 'rgba(17,20,34,0.8)' }}>

            {step === 3 ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-[#00c9b1]/15 flex items-center justify-center mx-auto mb-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00c9b1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-black mb-2">Bill paid!</h2>
                <p className="text-[#8892b0] mb-1">{selected?.name} · ${fmt(parseFloat(form.amount))}</p>
                <p className="text-sm text-[#4a5568] mb-6">Account: {form.accountNumber}</p>
                <button onClick={reset} className="px-6 py-3 bg-[#4f7fff] hover:bg-blue-500 rounded-xl text-sm font-semibold transition-all">
                  Pay another bill
                </button>
              </div>
            ) : (
              <>
                {/* Step indicator */}
                <div className="flex gap-1 mb-6">
                  {['Select', 'Details', 'Confirm'].map((s, i) => (
                    <div key={s} className={`h-1 flex-1 rounded-full transition-all ${i < step ? 'bg-[#4f7fff]' : i === step ? 'bg-[#4f7fff]/60' : 'bg-white/10'}`}/>
                  ))}
                </div>

                {error && (
                  <div className="mb-4 px-4 py-3 rounded-xl text-sm text-red-400 bg-red-500/10 border border-red-500/20">{error}</div>
                )}

                {step === 0 && (
                  <div>
                    <h3 className="font-semibold mb-4">Select a biller</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {BILLERS.map(b => (
                        <button
                          key={b.id}
                          onClick={() => selectBiller(b)}
                          className="flex flex-col items-center gap-2 p-4 rounded-xl border border-white/5 hover:border-white/15 transition-all group"
                          style={{ background: 'rgba(255,255,255,0.02)' }}
                        >
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: b.bg }}>
                            {b.icon}
                          </div>
                          <span className="text-xs font-medium text-[#8892b0] group-hover:text-white transition-colors text-center">{b.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 1 && selected && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                      <button onClick={reset} className="text-[#4a5568] hover:text-white transition-colors">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                      </button>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ background: selected.bg }}>{selected.icon}</div>
                        <h3 className="font-semibold">{selected.name}</h3>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-[#8892b0] mb-1.5">Account / Reference number</label>
                      <input value={form.accountNumber} onChange={set('accountNumber')} placeholder="e.g. 9876543210" className={inputCls}/>
                    </div>

                    <div>
                      <label className="block text-sm text-[#8892b0] mb-1.5">Amount</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8892b0] text-sm">$</span>
                        <input type="number" value={form.amount} onChange={set('amount')} placeholder="0.00" className={inputCls + " pl-8"}/>
                      </div>
                    </div>

                    {/* Quick amounts */}
                    <div className="flex gap-2 flex-wrap">
                      {[25, 50, 100, 200].map(v => (
                        <button key={v} onClick={() => setForm(f => ({ ...f, amount: String(v) }))}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${form.amount === String(v) ? 'bg-[#4f7fff] border-[#4f7fff] text-white' : 'border-white/10 text-[#8892b0] hover:border-white/20'}`}>
                          ${v}
                        </button>
                      ))}
                    </div>

                    <div>
                      <label className="block text-sm text-[#8892b0] mb-1.5">Note (optional)</label>
                      <input value={form.note} onChange={set('note')} placeholder="e.g. March bill" className={inputCls}/>
                    </div>

                    <button
                      onClick={goConfirm}
                      disabled={!form.accountNumber || !form.amount}
                      className="w-full py-3.5 bg-[#4f7fff] hover:bg-blue-500 disabled:opacity-40 rounded-xl text-sm font-semibold transition-all"
                    >
                      Review payment →
                    </button>
                  </div>
                )}

                {step === 2 && selected && (
                  <div className="space-y-3">
                    <h3 className="font-semibold mb-4">Confirm payment</h3>
                    {[
                      ['Biller',     selected.name],
                      ['Account',    form.accountNumber],
                      ['Amount',     `$${fmt(parseFloat(form.amount))}`],
                      ['Fee',        'Free'],
                      ['Reference',  form.note || '—'],
                    ].map(([l, v]) => (
                      <div key={l} className="flex justify-between py-2.5 border-b border-white/5">
                        <span className="text-sm text-[#8892b0]">{l}</span>
                        <span className={`text-sm font-medium ${l === 'Amount' ? 'text-white font-bold' : ''}`}>{v}</span>
                      </div>
                    ))}
                    <div className="flex gap-3 mt-6">
                      <button onClick={() => setStep(1)} className="flex-1 py-3 border border-white/10 hover:border-white/20 text-[#8892b0] rounded-xl text-sm transition-colors">← Back</button>
                      <button onClick={submit} disabled={loading} className="flex-1 py-3 bg-[#4f7fff] hover:bg-blue-500 disabled:opacity-40 rounded-xl text-sm font-semibold transition-all">
                        {loading ? 'Processing…' : 'Pay Now'}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right: history + balance */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-white/5 p-5" style={{ background: 'rgba(17,20,34,0.8)' }}>
            <h3 className="text-sm font-semibold text-[#8892b0] uppercase tracking-widest mb-4">Recent Payments</h3>
            {recentBills.length === 0 ? (
              <p className="text-sm text-[#4a5568] text-center py-8">No bill payments yet</p>
            ) : (
              <div className="space-y-1">
                {recentBills.map(tx => {
                  const biller = BILLERS.find(b => tx.description?.toLowerCase().includes(b.id)) || BILLERS[0]
                  return (
                    <div key={tx.id} className="flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-white/4 transition-colors">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0" style={{ background: biller.bg }}>
                        {biller.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{tx.description}</p>
                        <p className="text-xs text-[#4a5568]">{new Date(tx.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className="text-sm font-semibold text-red-400 flex-shrink-0">-${fmt(tx.amount)}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {account && (
            <div className="rounded-2xl border border-white/5 p-5" style={{ background: 'rgba(17,20,34,0.8)' }}>
              <p className="text-xs text-[#8892b0] mb-1">Available balance</p>
              <p className="text-2xl font-black">${fmt(account.balance)}</p>
              <p className="text-xs text-[#4a5568] mt-1">{account.currency} · Personal account</p>
            </div>
          )}

          {/* Upcoming */}
          <div className="rounded-2xl border border-white/5 p-5" style={{ background: 'rgba(17,20,34,0.8)' }}>
            <h3 className="text-sm font-semibold text-[#8892b0] uppercase tracking-widest mb-4">Quick Pay</h3>
            <div className="space-y-2">
              {BILLERS.slice(0, 4).map(b => (
                <button
                  key={b.id}
                  onClick={() => selectBiller(b)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/4 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: b.bg }}>
                    {b.icon}
                  </div>
                  <span className="text-sm font-medium">{b.name}</span>
                  <svg className="ml-auto" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4a5568" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
