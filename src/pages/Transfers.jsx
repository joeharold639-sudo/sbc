import { useState, useMemo } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { useAccount } from '../hooks/useAccount'
import { useTransactions } from '../hooks/useTransactions'
import { supabase } from '../lib/supabase'

const RATES = { USD:1, EUR:0.9248, GBP:0.7892, CAD:1.3641, AUD:1.5312, JPY:154.23, NGN:1580, GHS:15.6 }
const FLAGS  = { USD:'🇺🇸', EUR:'🇪🇺', GBP:'🇬🇧', CAD:'🇨🇦', AUD:'🇦🇺', JPY:'🇯🇵', NGN:'🇳🇬', GHS:'🇬🇭' }

function fmt(n, d=2) { return Number(n).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d}) }

function CurrencySelect({ value, onChange }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="flex items-center gap-1 bg-white/8 border border-white/10 rounded-lg px-2.5 py-1.5 text-sm font-medium focus:outline-none cursor-pointer"
      style={{ colorScheme:'dark' }}>
      {Object.keys(RATES).map(c => <option key={c} value={c}>{FLAGS[c]} {c}</option>)}
    </select>
  )
}

export default function Transfers() {
  const { account, refresh: refreshAccount } = useAccount()
  const { transactions, refetch }            = useTransactions(account?.id)

  const [form, setForm] = useState({
    recipientName: '', recipientAccount: '', country: '',
    amount: '', fromCcy: 'USD', toCcy: 'EUR', note: '',
  })
  const [step, setStep]     = useState(0)  // 0=form 1=confirm 2=success
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const converted = useMemo(() => {
    const amt = parseFloat(form.amount)
    if (!amt) return 0
    return (amt / RATES[form.fromCcy]) * RATES[form.toCcy]
  }, [form.amount, form.fromCcy, form.toCcy])

  const rate = useMemo(() => RATES[form.toCcy] / RATES[form.fromCcy], [form.fromCcy, form.toCcy])

  async function submit() {
    setLoading(true); setError('')
    const amount = parseFloat(form.amount)
    if (amount > account.balance) { setError('Insufficient balance.'); setLoading(false); return }

    const { error: e } = await supabase.from('transactions').insert({
      account_id: account.id, type: 'transfer',
      amount, currency: form.fromCcy,
      description: form.note || `Transfer to ${form.recipientName}`,
      recipient_name: form.recipientName, recipient_account: form.recipientAccount,
      status: 'completed',
    })
    if (e) { setError(e.message); setLoading(false); return }
    await supabase.from('accounts').update({ balance: account.balance - amount }).eq('id', account.id)
    refreshAccount(); refetch()
    setLoading(false); setStep(2)
  }

  const transfers = useMemo(() =>
    transactions.filter(t => t.type === 'transfer').slice(0, 8), [transactions])

  const inputCls = "w-full bg-[#111422] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[#4a5568] focus:outline-none focus:border-[#4f7fff] transition-colors"

  return (
    <DashboardLayout title="International Transfers" subtitle="Send money to 180+ countries at the real exchange rate">
      <div className="grid lg:grid-cols-5 gap-6 max-w-5xl">

        {/* Left: form */}
        <div className="lg:col-span-3">
          {step === 2 ? (
            <div className="rounded-2xl border border-white/5 p-10 text-center" style={{background:'rgba(17,20,34,0.8)'}}>
              <div className="w-16 h-16 rounded-full bg-[#00c9b1]/15 flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00c9b1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h2 className="text-2xl font-black mb-2">Transfer sent!</h2>
              <p className="text-[#8892b0] mb-1">${fmt(parseFloat(form.amount))} {form.fromCcy} → {fmt(converted)} {form.toCcy}</p>
              <p className="text-sm text-[#8892b0] mb-6">to {form.recipientName}</p>
              <button onClick={() => { setStep(0); setForm({ recipientName:'',recipientAccount:'',country:'',amount:'',fromCcy:'USD',toCcy:'EUR',note:'' }) }}
                className="px-6 py-3 bg-[#4f7fff] hover:bg-blue-500 rounded-xl text-sm font-semibold transition-all">
                New transfer
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/5 p-6" style={{background:'rgba(17,20,34,0.8)'}}>
              <div className="flex gap-1 mb-6">
                {['Details','Confirm'].map((s,i) => (
                  <div key={s} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? 'bg-[#4f7fff]' : 'bg-white/10'}`}/>
                ))}
              </div>

              {error && <div className="mb-4 px-4 py-3 rounded-xl text-sm text-red-400 bg-red-500/10 border border-red-500/20">{error}</div>}

              {step === 0 && (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-[#8892b0] mb-1.5">Recipient name</label>
                      <input value={form.recipientName} onChange={set('recipientName')} placeholder="Jane Smith" className={inputCls}/>
                    </div>
                    <div>
                      <label className="block text-sm text-[#8892b0] mb-1.5">Country</label>
                      <input value={form.country} onChange={set('country')} placeholder="United Kingdom" className={inputCls}/>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-[#8892b0] mb-1.5">Account / IBAN</label>
                    <input value={form.recipientAccount} onChange={set('recipientAccount')} placeholder="GB82 WEST 1234 5698 7654 32" className={inputCls}/>
                  </div>

                  {/* Amount + conversion */}
                  <div>
                    <label className="block text-sm text-[#8892b0] mb-1.5">You send</label>
                    <div className="flex gap-2">
                      <input type="number" value={form.amount} onChange={set('amount')} placeholder="0.00" className={inputCls}/>
                      <CurrencySelect value={form.fromCcy} onChange={v => setForm(f=>({...f,fromCcy:v}))}/>
                    </div>
                  </div>

                  {form.amount && parseFloat(form.amount) > 0 && (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{background:'rgba(0,201,177,0.08)',border:'1px solid rgba(0,201,177,0.15)'}}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00c9b1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                        <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm text-[#00c9b1] font-medium">1 {form.fromCcy} = {fmt(rate,4)} {form.toCcy}</p>
                        <p className="text-xs text-[#8892b0]">Mid-market rate · No transfer fee</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm text-[#8892b0] mb-1.5">Recipient gets</label>
                    <div className="flex gap-2">
                      <div className={inputCls + " flex-1 flex items-center"}>
                        <span className={`font-bold ${converted > 0 ? 'text-[#00c9b1]' : 'text-[#4a5568]'}`}>
                          {converted > 0 ? fmt(converted) : '0.00'}
                        </span>
                      </div>
                      <CurrencySelect value={form.toCcy} onChange={v => setForm(f=>({...f,toCcy:v}))}/>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-[#8892b0] mb-1.5">Reference (optional)</label>
                    <input value={form.note} onChange={set('note')} placeholder="e.g. Invoice #1234" className={inputCls}/>
                  </div>

                  <button
                    onClick={() => { if(form.recipientName && form.recipientAccount && form.amount) setStep(1) }}
                    disabled={!form.recipientName || !form.recipientAccount || !form.amount}
                    className="w-full py-3.5 bg-[#4f7fff] hover:bg-blue-500 disabled:opacity-40 rounded-xl text-sm font-semibold transition-all">
                    Review transfer →
                  </button>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-3">
                  <h3 className="font-semibold mb-4">Confirm transfer</h3>
                  {[
                    ['To',        form.recipientName],
                    ['Account',   form.recipientAccount],
                    ['Country',   form.country || '—'],
                    ['You send',  `${fmt(parseFloat(form.amount))} ${form.fromCcy}`],
                    ['They get',  `${fmt(converted)} ${form.toCcy}`],
                    ['Rate',      `1 ${form.fromCcy} = ${fmt(rate,4)} ${form.toCcy}`],
                    ['Fee',       'Free'],
                    ['Reference', form.note || '—'],
                  ].map(([l,v]) => (
                    <div key={l} className="flex justify-between py-2.5 border-b border-white/5">
                      <span className="text-sm text-[#8892b0]">{l}</span>
                      <span className={`text-sm font-medium ${l==='You send'?'text-white font-bold':''}`}>{v}</span>
                    </div>
                  ))}
                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setStep(0)} className="flex-1 py-3 border border-white/10 hover:border-white/20 text-[#8892b0] rounded-xl text-sm transition-colors">← Back</button>
                    <button onClick={submit} disabled={loading} className="flex-1 py-3 bg-[#4f7fff] hover:bg-blue-500 disabled:opacity-40 rounded-xl text-sm font-semibold transition-all">
                      {loading ? 'Sending…' : 'Confirm & Send'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: recent transfers */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-white/5 p-5" style={{background:'rgba(17,20,34,0.8)'}}>
            <h3 className="text-sm font-semibold text-[#8892b0] uppercase tracking-widest mb-4">Recent transfers</h3>
            {transfers.length === 0 ? (
              <p className="text-sm text-[#4a5568] text-center py-8">No transfers yet</p>
            ) : (
              <div className="space-y-1">
                {transfers.map(tx => (
                  <div key={tx.id} className="flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-white/4 transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-[#4f7fff]/15 flex items-center justify-center text-sm flex-shrink-0">⇄</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{tx.recipient_name || tx.description}</p>
                      <p className="text-xs text-[#4a5568]">{new Date(tx.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className="text-sm font-semibold text-red-400 flex-shrink-0">-${fmt(tx.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Balance */}
          {account && (
            <div className="mt-4 rounded-2xl border border-white/5 p-5" style={{background:'rgba(17,20,34,0.8)'}}>
              <p className="text-xs text-[#8892b0] mb-1">Available balance</p>
              <p className="text-2xl font-black">${fmt(account.balance)}</p>
              <p className="text-xs text-[#4a5568] mt-1">{account.currency} · Personal account</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
