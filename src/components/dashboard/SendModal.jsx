import { useState } from 'react'
import { supabase } from '../../lib/supabase'

const CURRENCIES = ['USD','EUR','GBP','CAD','AUD','JPY','NGN','GHS']

function Modal({ onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"/>
      <div className="relative z-10 w-full max-w-md glass rounded-2xl p-6 shadow-2xl">
        {children}
      </div>
    </div>
  )
}

const steps = ['Recipient', 'Amount', 'Confirm']

export default function SendModal({ account, onClose, onSuccess }) {
  const [step, setStep]   = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    recipientName:    '',
    recipientAccount: '',
    amount:           '',
    currency:         'USD',
    note:             '',
  })

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const inputCls = "w-full bg-[#0b0d14] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[#4a5568] focus:outline-none focus:border-[#4f7fff] transition-colors"

  async function send() {
    setLoading(true)
    setError('')
    const amount = parseFloat(form.amount)

    if (amount > account.balance) {
      setError('Insufficient balance.')
      setLoading(false)
      return
    }

    const { error: txErr } = await supabase.from('transactions').insert({
      account_id:       account.id,
      type:             'transfer',
      amount,
      currency:         form.currency,
      description:      form.note || `Transfer to ${form.recipientName}`,
      recipient_name:   form.recipientName,
      recipient_account: form.recipientAccount,
      status:           'completed',
    })

    if (txErr) { setError(txErr.message); setLoading(false); return }

    // Update balance
    await supabase.from('accounts')
      .update({ balance: account.balance - amount })
      .eq('id', account.id)

    setLoading(false)
    onSuccess?.()
    onClose()
  }

  const canNext = step === 0
    ? form.recipientName && form.recipientAccount
    : step === 1
      ? form.amount && parseFloat(form.amount) > 0
      : true

  return (
    <Modal onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-bold text-lg">Send money</h2>
          <p className="text-xs text-[#8892b0]">Step {step + 1} of 3 — {steps[step]}</p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/8 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8892b0" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Step dots */}
      <div className="flex gap-1.5 mb-6">
        {steps.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? 'bg-[#4f7fff]' : 'bg-white/10'}`}/>
        ))}
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm text-red-400 bg-red-500/10 border border-red-500/20">
          {error}
        </div>
      )}

      {/* Step 0 — Recipient */}
      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[#8892b0] mb-1.5">Recipient name</label>
            <input type="text" value={form.recipientName} onChange={set('recipientName')}
              placeholder="Jane Smith" className={inputCls}/>
          </div>
          <div>
            <label className="block text-sm text-[#8892b0] mb-1.5">Account number / email</label>
            <input type="text" value={form.recipientAccount} onChange={set('recipientAccount')}
              placeholder="1234 5678 9012 3456" className={inputCls}/>
          </div>
        </div>
      )}

      {/* Step 1 — Amount */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="text-center py-4">
            <p className="text-xs text-[#8892b0] mb-2">You send</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-5xl font-black">
                {form.amount ? `$${form.amount}` : <span className="text-[#4a5568]">$0</span>}
              </span>
            </div>
            <p className="text-xs text-[#8892b0] mt-2">
              Balance: <span className="text-white">${account.balance.toFixed(2)}</span>
            </p>
          </div>

          <input type="number" value={form.amount} onChange={set('amount')} min="0.01"
            placeholder="0.00" className={inputCls + " text-center text-lg"}/>

          <div>
            <label className="block text-sm text-[#8892b0] mb-1.5">Currency</label>
            <select value={form.currency} onChange={set('currency')}
              className={inputCls + " cursor-pointer"} style={{ colorScheme: 'dark' }}>
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Quick amounts */}
          <div className="flex gap-2">
            {[50, 100, 250, 500].map(n => (
              <button key={n} onClick={() => setForm(f => ({ ...f, amount: String(n) }))}
                className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium transition-colors">
                ${n}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm text-[#8892b0] mb-1.5">Note (optional)</label>
            <input type="text" value={form.note} onChange={set('note')}
              placeholder="e.g. Rent payment" className={inputCls}/>
          </div>
        </div>
      )}

      {/* Step 2 — Confirm */}
      {step === 2 && (
        <div className="space-y-3">
          {[
            ['To',       form.recipientName],
            ['Account',  form.recipientAccount],
            ['Amount',   `$${parseFloat(form.amount).toFixed(2)} ${form.currency}`],
            ['Note',     form.note || '—'],
            ['Fee',      'Free'],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between items-center py-2.5 border-b border-white/5">
              <span className="text-sm text-[#8892b0]">{label}</span>
              <span className={`text-sm font-medium ${label === 'Amount' ? 'text-white text-base font-bold' : ''}`}>{val}</span>
            </div>
          ))}
          <div className="px-4 py-3 rounded-xl mt-2" style={{ background: 'rgba(79,127,255,0.08)', border: '1px solid rgba(79,127,255,0.15)' }}>
            <p className="text-xs text-[#8892b0]">Transfers are instant and cannot be reversed. Please confirm the details above.</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        {step > 0 && (
          <button onClick={() => { setError(''); setStep(s => s - 1) }}
            className="flex-1 py-3 border border-white/10 hover:border-white/20 text-[#8892b0] hover:text-white rounded-xl text-sm transition-colors">
            ← Back
          </button>
        )}
        <button
          onClick={step < 2 ? () => { if (canNext) setStep(s => s + 1) } : send}
          disabled={!canNext || loading}
          className="flex-1 py-3 bg-[#4f7fff] hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-all"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="white" strokeOpacity="0.3" strokeWidth="3"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              Sending…
            </span>
          ) : step < 2 ? 'Continue →' : 'Confirm & Send'}
        </button>
      </div>
    </Modal>
  )
}
