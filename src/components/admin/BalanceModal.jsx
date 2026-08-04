import { useState } from 'react'
import { useAdminActions } from '../../hooks/useAdminActions'

function fmt(n) {
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function BalanceModal({ isOpen, onClose, user, account, onSuccess }) {
  const [type, setType]       = useState('credit')
  const [amount, setAmount]   = useState('')
  const [reason, setReason]   = useState('')
  const [step, setStep]       = useState('form')   // 'form' | 'confirm' | 'success' | 'error'
  const [resultMsg, setResultMsg] = useState('')

  const { creditAccount, debitAccount, loading } = useAdminActions()

  function reset() {
    setType('credit'); setAmount(''); setReason(''); setStep('form'); setResultMsg('')
  }

  function handleClose() { reset(); onClose() }

  const parsed      = parseFloat(amount) || 0
  const isValid     = parsed > 0 && reason.trim().length > 0
  const newBalance  = account
    ? type === 'credit' ? account.balance + parsed : account.balance - parsed
    : 0
  const belowZero   = type === 'debit' && newBalance < 0

  async function handleConfirm() {
    const action = type === 'credit' ? creditAccount : debitAccount
    const result = await action(account.id, parsed, reason.trim())
    if (result.success) {
      setResultMsg(`$${fmt(parsed)} ${type === 'credit' ? 'credited to' : 'debited from'} ${user?.full_name}.`)
      setStep('success')
      onSuccess?.()
    } else {
      setResultMsg(result.error || 'Action failed. Please try again.')
      setStep('error')
    }
  }

  if (!isOpen) return null

  const accentCls = type === 'credit'
    ? { bg: 'bg-[#00c9b1]/15', border: 'border-[#00c9b1]/30', text: 'text-[#00c9b1]', btn: 'bg-[#00c9b1]' }
    : { bg: 'bg-red-500/15',   border: 'border-red-500/30',   text: 'text-red-400',   btn: 'bg-red-500' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-md rounded-2xl border border-white/8 shadow-2xl" style={{ background: '#131627' }}>

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-white/5">
          <div>
            <h3 className="text-white font-bold text-base">Manage Balance</h3>
            <p className="text-xs text-[#8892b0] mt-0.5">{user?.full_name || 'Unknown'}</p>
          </div>
          <button onClick={handleClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#8892b0] hover:text-white hover:bg-white/5 transition-colors mt-0.5">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="1" y1="1" x2="13" y2="13"/><line x1="13" y1="1" x2="1" y2="13"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">

          {/* FORM STEP */}
          {step === 'form' && (
            <>
              {/* Current balance */}
              <div className="rounded-xl border border-white/5 p-4 mb-5" style={{ background: '#0c0e1a' }}>
                <p className="text-[10px] font-bold tracking-widest uppercase text-[#4a5568] mb-1">Current Balance</p>
                <p className="text-2xl font-black text-white">${fmt(account?.balance ?? 0)}</p>
                <p className="text-xs text-[#4a5568] mt-0.5 font-mono">{account?.account_number}</p>
              </div>

              {/* Credit / Debit toggle */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[['credit', '+ Credit'], ['debit', '− Debit']].map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setType(val)}
                    className={`py-2.5 rounded-xl text-sm font-bold border transition-all ${
                      type === val
                        ? val === 'credit'
                          ? 'bg-[#00c9b1]/15 text-[#00c9b1] border-[#00c9b1]/35'
                          : 'bg-red-500/15 text-red-400 border-red-500/30'
                        : 'text-[#8892b0] border-white/8 hover:bg-white/5'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Amount */}
              <div className="mb-3">
                <label className="block text-[10px] font-bold tracking-widest uppercase text-[#8892b0] mb-1.5">Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8892b0] font-semibold text-sm">$</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-white/10 pl-8 pr-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-[#4f7fff] transition-colors"
                    style={{ background: '#0c0e1a' }}
                  />
                </div>
              </div>

              {/* Reason */}
              <div className="mb-4">
                <label className="block text-[10px] font-bold tracking-widest uppercase text-[#8892b0] mb-1.5">Reason (required)</label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="e.g. Salary payment, Refund for order #1234…"
                  rows={2}
                  className="w-full rounded-xl border border-white/10 px-4 py-3 text-white text-sm focus:outline-none focus:border-[#4f7fff] transition-colors resize-none placeholder-[#4a5568]"
                  style={{ background: '#0c0e1a' }}
                />
              </div>

              {/* Preview */}
              {isValid && !belowZero && (
                <div className={`rounded-xl px-4 py-3 text-sm border mb-2 ${accentCls.bg} ${accentCls.border} ${accentCls.text}`}>
                  New balance: <span className="font-mono font-bold">${fmt(newBalance)}</span>
                </div>
              )}
              {belowZero && (
                <div className="rounded-xl px-4 py-3 text-sm border bg-red-500/8 border-red-500/25 text-red-400 mb-2">
                  Debit exceeds current balance — insufficient funds.
                </div>
              )}
            </>
          )}

          {/* CONFIRM STEP */}
          {step === 'confirm' && (
            <div>
              <div className="rounded-xl border border-white/5 p-4 mb-4 space-y-3" style={{ background: '#0c0e1a' }}>
                {[
                  ['Action',       <span className={`font-bold capitalize ${accentCls.text}`}>{type === 'credit' ? '+ Credit' : '− Debit'}</span>],
                  ['User',         <span className="text-white font-medium">{user?.full_name}</span>],
                  ['Amount',       <span className="text-white font-mono font-bold">${fmt(parsed)}</span>],
                  ['New Balance',  <span className="text-white font-mono">${fmt(newBalance)}</span>],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between items-center text-sm">
                    <span className="text-[#8892b0]">{label}</span>
                    {val}
                  </div>
                ))}
                <div className="pt-3 border-t border-white/5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#4a5568] mb-1">Reason</p>
                  <p className="text-white text-sm">{reason}</p>
                </div>
              </div>
              <p className="text-center text-xs text-[#4a5568]">This action will be permanently logged in the audit trail.</p>
            </div>
          )}

          {/* RESULT STEP */}
          {(step === 'success' || step === 'error') && (
            <div className={`rounded-xl border p-6 text-center ${
              step === 'success'
                ? 'bg-[#00c9b1]/8 border-[#00c9b1]/20'
                : 'bg-red-500/8 border-red-500/20'
            }`}>
              <div className={`w-11 h-11 rounded-full flex items-center justify-center mx-auto mb-3 ${
                step === 'success' ? 'bg-[#00c9b1]/15' : 'bg-red-500/15'
              }`}>
                {step === 'success'
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00c9b1" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff4757" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                }
              </div>
              <p className={`text-sm font-semibold leading-relaxed ${step === 'success' ? 'text-[#00c9b1]' : 'text-red-400'}`}>
                {resultMsg}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-5">
          {step === 'form' && (
            <>
              <button onClick={handleClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-[#8892b0] hover:text-white hover:bg-white/5 border border-white/8 transition-colors">
                Cancel
              </button>
              <button
                onClick={() => setStep('confirm')}
                disabled={!isValid || belowZero}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed ${accentCls.btn} hover:opacity-90`}
              >
                Review
              </button>
            </>
          )}
          {step === 'confirm' && (
            <>
              <button onClick={() => setStep('form')} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-[#8892b0] hover:text-white hover:bg-white/5 border border-white/8 transition-colors">
                Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 ${accentCls.btn} hover:opacity-90`}
              >
                {loading ? 'Processing…' : `Confirm ${type}`}
              </button>
            </>
          )}
          {(step === 'success' || step === 'error') && (
            <button
              onClick={step === 'success' ? handleClose : () => setStep('form')}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-[#4f7fff]/15 text-[#4f7fff] hover:bg-[#4f7fff]/25 transition-colors"
            >
              {step === 'success' ? 'Done' : 'Try Again'}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
