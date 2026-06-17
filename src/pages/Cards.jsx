import { useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { useAccount } from '../hooks/useAccount'
import { useCards } from '../hooks/useCards'

function fmt(n) { return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }

function CardVisual({ card, flipped, onClick }) {
  const isVirtual = card.card_type === 'virtual'
  const expM = String(card.expiry_month).padStart(2, '0')
  const expY = String(card.expiry_year).slice(-2)

  return (
    <div
      className="relative w-full cursor-pointer select-none"
      style={{ perspective: '1000px', height: '200px' }}
      onClick={onClick}
    >
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-2xl p-6 flex flex-col justify-between overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            background: card.is_frozen
              ? 'linear-gradient(135deg, #1a1d2e 0%, #2a2d3e 100%)'
              : 'linear-gradient(135deg, #4f7fff 0%, #7c5cfc 100%)',
          }}
        >
          {/* Decorative circles */}
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full opacity-10 bg-white"/>
          <div className="absolute -right-4 top-10 w-24 h-24 rounded-full opacity-10 bg-white"/>

          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-xs text-white/60 font-medium uppercase tracking-widest">
                {isVirtual ? 'Virtual' : 'Physical'} · {card.network?.toUpperCase()}
              </p>
              {card.is_frozen && (
                <span className="mt-1 inline-flex items-center gap-1 text-xs text-white/50">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07"/></svg>
                  Frozen
                </span>
              )}
            </div>
            {/* Chip */}
            <div className="w-10 h-7 rounded-md bg-yellow-300/80 flex items-center justify-center">
              <div className="grid grid-cols-2 gap-0.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-sm bg-yellow-600/60"/>
                ))}
              </div>
            </div>
          </div>

          <div className="relative">
            <p className="text-lg font-mono tracking-[0.25em] text-white">
              •••• •••• •••• {card.card_number_last4}
            </p>
            <div className="flex items-end justify-between mt-3">
              <div>
                <p className="text-[10px] text-white/50 uppercase tracking-wider mb-0.5">Card holder</p>
                <p className="text-sm font-semibold text-white">Syntax Member</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/50 uppercase tracking-wider mb-0.5">Expires</p>
                <p className="text-sm font-semibold text-white">{expM}/{expY}</p>
              </div>
              <div className="flex gap-0.5">
                <div className="w-7 h-7 rounded-full bg-red-500/80"/>
                <div className="w-7 h-7 rounded-full bg-yellow-400/80 -ml-3"/>
              </div>
            </div>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(135deg, #1e2136 0%, #2a2d4a 100%)',
          }}
        >
          <div className="w-full h-10 bg-black/60 mt-10"/>
          <div className="px-6 mt-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-9 bg-white/10 rounded"/>
              <div className="bg-white/90 rounded px-3 py-2 text-black text-xs font-mono font-bold">
                {Math.floor(100 + Math.random() * 900)}
              </div>
            </div>
            <p className="text-[10px] text-white/30 mt-2">CVV · Tap to flip back</p>
          </div>
          <div className="absolute bottom-4 right-5 text-[10px] text-white/20">
            syntaxtrustbank.com
          </div>
        </div>
      </div>
    </div>
  )
}

function IssueCardModal({ accountId, onIssue, onClose }) {
  const [loading, setLoading] = useState(false)

  async function handleIssue() {
    setLoading(true)
    await onIssue(accountId)
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-sm rounded-2xl border border-white/10 p-6" style={{ background: '#111422' }}>
        <div className="w-12 h-12 rounded-xl bg-[#4f7fff]/15 flex items-center justify-center mb-4">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4f7fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
        </div>
        <h3 className="text-lg font-bold mb-1">Issue Virtual Card</h3>
        <p className="text-sm text-[#8892b0] mb-6">A new Visa virtual card will be issued instantly and linked to your account.</p>

        <div className="space-y-2 mb-6">
          {[['Card type', 'Virtual · Visa'], ['Network', 'Visa'], ['Validity', '4 years'], ['Fee', 'Free']].map(([l, v]) => (
            <div key={l} className="flex justify-between py-2 border-b border-white/5">
              <span className="text-sm text-[#8892b0]">{l}</span>
              <span className="text-sm font-medium">{v}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border border-white/10 hover:border-white/20 text-[#8892b0] rounded-xl text-sm transition-colors">Cancel</button>
          <button onClick={handleIssue} disabled={loading} className="flex-1 py-3 bg-[#4f7fff] hover:bg-blue-500 disabled:opacity-40 rounded-xl text-sm font-semibold transition-all">
            {loading ? 'Issuing…' : 'Issue Card'}
          </button>
        </div>
      </div>
    </div>
  )
}

function LimitModal({ card, onSave, onClose }) {
  const [limit, setLimit] = useState(card.spending_limit ? String(card.spending_limit) : '')
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    setLoading(true)
    await onSave(card.id, limit ? parseFloat(limit) : null)
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-sm rounded-2xl border border-white/10 p-6" style={{ background: '#111422' }}>
        <h3 className="text-lg font-bold mb-1">Spending Limit</h3>
        <p className="text-sm text-[#8892b0] mb-6">Set a daily spending limit for card •••• {card.card_number_last4}</p>
        <div className="relative mb-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8892b0] text-sm">$</span>
          <input
            type="number"
            value={limit}
            onChange={e => setLimit(e.target.value)}
            placeholder="No limit"
            className="w-full bg-[#111422] border border-white/10 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:border-[#4f7fff] transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap mb-6">
          {[100, 250, 500, 1000].map(v => (
            <button key={v} onClick={() => setLimit(String(v))} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${limit === String(v) ? 'bg-[#4f7fff] border-[#4f7fff] text-white' : 'border-white/10 text-[#8892b0] hover:border-white/20'}`}>
              ${v}
            </button>
          ))}
          <button onClick={() => setLimit('')} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10 text-[#8892b0] hover:border-white/20 transition-colors">
            No limit
          </button>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border border-white/10 hover:border-white/20 text-[#8892b0] rounded-xl text-sm transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={loading} className="flex-1 py-3 bg-[#4f7fff] hover:bg-blue-500 disabled:opacity-40 rounded-xl text-sm font-semibold transition-all">
            {loading ? 'Saving…' : 'Save Limit'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Cards() {
  const { account } = useAccount()
  const { cards, loading, issueCard, toggleFreeze, setLimit } = useCards(account?.id)

  const [selectedIdx, setSelectedIdx]   = useState(0)
  const [flipped, setFlipped]           = useState(false)
  const [showIssue, setShowIssue]       = useState(false)
  const [showLimit, setShowLimit]       = useState(false)
  const [freezeLoading, setFreezeLoading] = useState(false)

  const selected = cards[selectedIdx]

  async function handleFreeze() {
    if (!selected) return
    setFreezeLoading(true)
    await toggleFreeze(selected.id, !selected.is_frozen)
    setFreezeLoading(false)
  }

  return (
    <DashboardLayout title="Virtual Cards" subtitle="Issue, manage, and control your Visa virtual cards">
      <div className="grid lg:grid-cols-5 gap-6 max-w-5xl">

        {/* Left: card display */}
        <div className="lg:col-span-3 space-y-5">
          {loading ? (
            <div className="rounded-2xl border border-white/5 p-8 flex items-center justify-center" style={{ background: 'rgba(17,20,34,0.8)', height: '200px' }}>
              <div className="w-6 h-6 border-2 border-[#4f7fff] border-t-transparent rounded-full animate-spin"/>
            </div>
          ) : cards.length === 0 ? (
            <div className="rounded-2xl border border-white/5 p-10 text-center" style={{ background: 'rgba(17,20,34,0.8)' }}>
              <div className="w-16 h-16 rounded-2xl bg-[#4f7fff]/10 flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4f7fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
              </div>
              <h3 className="font-bold mb-1">No cards yet</h3>
              <p className="text-sm text-[#8892b0] mb-5">Issue your first virtual Visa card — it's free and instant.</p>
              <button onClick={() => setShowIssue(true)} className="px-5 py-2.5 bg-[#4f7fff] hover:bg-blue-500 rounded-xl text-sm font-semibold transition-all">
                + Issue card
              </button>
            </div>
          ) : (
            <>
              {/* Card visual */}
              <div className="rounded-2xl border border-white/5 p-6" style={{ background: 'rgba(17,20,34,0.8)' }}>
                <CardVisual card={selected} flipped={flipped} onClick={() => setFlipped(f => !f)} />
                <p className="text-center text-xs text-[#4a5568] mt-3">Tap card to reveal CVV</p>

                {/* Controls */}
                <div className="grid grid-cols-3 gap-3 mt-5">
                  <button
                    onClick={handleFreeze}
                    disabled={freezeLoading}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all ${selected?.is_frozen ? 'border-[#00c9b1]/30 bg-[#00c9b1]/8 text-[#00c9b1]' : 'border-white/10 hover:border-white/20 text-[#8892b0]'}`}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07"/>
                    </svg>
                    <span className="text-xs font-medium">{selected?.is_frozen ? 'Unfreeze' : 'Freeze'}</span>
                  </button>

                  <button
                    onClick={() => setShowLimit(true)}
                    className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-white/10 hover:border-white/20 text-[#8892b0] transition-all"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <span className="text-xs font-medium">Set Limit</span>
                  </button>

                  <button
                    onClick={() => setShowIssue(true)}
                    className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-white/10 hover:border-white/20 text-[#8892b0] transition-all"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    <span className="text-xs font-medium">New Card</span>
                  </button>
                </div>
              </div>

              {/* Card details */}
              <div className="rounded-2xl border border-white/5 p-5" style={{ background: 'rgba(17,20,34,0.8)' }}>
                <h3 className="text-sm font-semibold text-[#8892b0] uppercase tracking-widest mb-4">Card Details</h3>
                {[
                  ['Type',     `${selected?.card_type?.charAt(0).toUpperCase() + selected?.card_type?.slice(1)} · ${selected?.network?.toUpperCase()}`],
                  ['Number',   `•••• •••• •••• ${selected?.card_number_last4}`],
                  ['Expires',  `${String(selected?.expiry_month).padStart(2,'0')}/${String(selected?.expiry_year).slice(-2)}`],
                  ['Status',   selected?.is_frozen ? 'Frozen' : 'Active'],
                  ['Limit',    selected?.spending_limit ? `$${fmt(selected.spending_limit)}/day` : 'No limit'],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between py-2.5 border-b border-white/5 last:border-0">
                    <span className="text-sm text-[#8892b0]">{l}</span>
                    <span className={`text-sm font-medium ${l === 'Status' && selected?.is_frozen ? 'text-[#8892b0]' : l === 'Status' ? 'text-[#00c9b1]' : ''}`}>{v}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right: cards list + security */}
        <div className="lg:col-span-2 space-y-5">
          {/* Cards list */}
          <div className="rounded-2xl border border-white/5 p-5" style={{ background: 'rgba(17,20,34,0.8)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#8892b0] uppercase tracking-widest">My Cards</h3>
              <button onClick={() => setShowIssue(true)} className="text-xs text-[#4f7fff] hover:text-blue-400 transition-colors font-medium">
                + Add
              </button>
            </div>

            {cards.length === 0 ? (
              <p className="text-sm text-[#4a5568] text-center py-6">No cards issued</p>
            ) : (
              <div className="space-y-2">
                {cards.map((card, i) => (
                  <button
                    key={card.id}
                    onClick={() => { setSelectedIdx(i); setFlipped(false) }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left ${i === selectedIdx ? 'bg-[#4f7fff]/10 border border-[#4f7fff]/20' : 'hover:bg-white/4 border border-transparent'}`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${card.is_frozen ? 'bg-white/5' : 'bg-[#4f7fff]/15'}`}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={card.is_frozen ? '#4a5568' : '#4f7fff'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Visa •••• {card.card_number_last4}</p>
                      <p className="text-xs text-[#4a5568]">{card.is_frozen ? 'Frozen' : 'Active'} · Virtual</p>
                    </div>
                    {card.is_frozen && (
                      <span className="text-xs text-[#4a5568] bg-white/5 px-2 py-0.5 rounded-full">Frozen</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Security tips */}
          <div className="rounded-2xl border border-white/5 p-5" style={{ background: 'rgba(17,20,34,0.8)' }}>
            <h3 className="text-sm font-semibold text-[#8892b0] uppercase tracking-widest mb-4">Security</h3>
            <div className="space-y-3">
              {[
                { icon: '🔒', title: 'Freeze instantly', desc: 'Freeze any card in seconds if you spot unusual activity.' },
                { icon: '💳', title: 'Separate cards', desc: 'Use different cards for subscriptions and online shopping.' },
                { icon: '🛡️', title: 'Spending limits', desc: 'Cap daily spend to minimise exposure.' },
              ].map(tip => (
                <div key={tip.title} className="flex gap-3">
                  <span className="text-lg flex-shrink-0 mt-0.5">{tip.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{tip.title}</p>
                    <p className="text-xs text-[#4a5568] mt-0.5">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Account balance */}
          {account && (
            <div className="rounded-2xl border border-white/5 p-5" style={{ background: 'rgba(17,20,34,0.8)' }}>
              <p className="text-xs text-[#8892b0] mb-1">Linked account balance</p>
              <p className="text-2xl font-black">${fmt(account.balance)}</p>
              <p className="text-xs text-[#4a5568] mt-1">{account.account_number} · Personal</p>
            </div>
          )}
        </div>
      </div>

      {showIssue && (
        <IssueCardModal
          accountId={account?.id}
          onIssue={issueCard}
          onClose={() => setShowIssue(false)}
        />
      )}
      {showLimit && selected && (
        <LimitModal
          card={selected}
          onSave={setLimit}
          onClose={() => setShowLimit(false)}
        />
      )}
    </DashboardLayout>
  )
}
