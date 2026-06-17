import { useState, useMemo } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { useBtcWallet } from '../hooks/useBtcWallet'
import { useAccount } from '../hooks/useAccount'
import { useTransactions } from '../hooks/useTransactions'
import { supabase } from '../lib/supabase'

const BTC_PRICE   = 67420
const PRICE_CHANGE = 3.24

// 30-day price data (demo)
const CHART_DATA = [58200,59100,60400,59800,61200,63500,62100,64800,65200,63900,
                    66100,67800,65400,68200,67100,69500,68000,70200,69100,71300,
                    70800,69400,68500,67200,68900,70100,69300,67800,68400,67420]

function fmt(n, d=2) { return Number(n).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d}) }

function PriceChart({ data }) {
  const min = Math.min(...data), max = Math.max(...data)
  const w = 400, h = 80
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / (max - min)) * (h - 8) - 4
    return `${x},${y}`
  }).join(' ')
  const area = `${pts} ${w},${h} 0,${h}`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-20" preserveAspectRatio="none">
      <defs>
        <linearGradient id="btcChartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5c842" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="#f5c842" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#btcChartGrad)"/>
      <polyline points={pts} fill="none" stroke="#f5c842" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={w} cy={data[data.length-1] ? h - ((data[data.length-1] - min)/(max - min))*(h-8)-4 : h/2} r="3.5" fill="#f5c842"/>
    </svg>
  )
}

function BuyModal({ wallet, account, onClose, onSuccess }) {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const usdAmt  = parseFloat(amount) || 0
  const btcAmt  = usdAmt / BTC_PRICE

  async function buy() {
    setError('')
    if (usdAmt > account.balance) { setError('Insufficient balance.'); return }
    if (usdAmt <= 0) { setError('Enter a valid amount.'); return }
    setLoading(true)
    await supabase.from('transactions').insert({
      account_id: account.id, type: 'btc_buy',
      amount: usdAmt, currency: 'USD',
      description: `Bought ${btcAmt.toFixed(6)} BTC`,
      status: 'completed',
    })
    await supabase.from('accounts').update({ balance: account.balance - usdAmt }).eq('id', account.id)
    await supabase.from('btc_wallets').update({ balance_btc: wallet.balance_btc + btcAmt }).eq('id', wallet.id)
    setLoading(false); onSuccess()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"/>
      <div className="relative z-10 w-full max-w-sm glass rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg">Buy Bitcoin</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/8"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8892b0" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        {error && <div className="mb-4 px-4 py-3 rounded-xl text-sm text-red-400 bg-red-500/10 border border-red-500/20">{error}</div>}
        <div className="mb-4">
          <label className="block text-sm text-[#8892b0] mb-1.5">Amount in USD</label>
          <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="100.00"
            className="w-full bg-[#0b0d14] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[#4a5568] focus:outline-none focus:border-[#4f7fff] transition-colors"/>
        </div>
        <div className="flex gap-2 mb-4">
          {[50,100,250,500].map(n=>(
            <button key={n} onClick={()=>setAmount(String(n))} className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium transition-colors">${n}</button>
          ))}
        </div>
        {usdAmt > 0 && (
          <div className="px-4 py-3 rounded-xl mb-4" style={{background:'rgba(245,200,66,0.08)',border:'1px solid rgba(245,200,66,0.2)'}}>
            <p className="text-sm font-semibold text-[#f5c842]">≈ {btcAmt.toFixed(6)} BTC</p>
            <p className="text-xs text-[#8892b0]">at ${fmt(BTC_PRICE)} / BTC</p>
          </div>
        )}
        <p className="text-xs text-[#4a5568] mb-4">Available: ${fmt(account?.balance ?? 0)}</p>
        <button onClick={buy} disabled={loading || !usdAmt}
          className="w-full py-3 bg-[#f5c842] hover:brightness-110 text-[#0b0d14] font-bold rounded-xl text-sm transition-all disabled:opacity-40">
          {loading ? 'Processing…' : `Buy ${usdAmt > 0 ? btcAmt.toFixed(6) + ' BTC' : 'Bitcoin'}`}
        </button>
      </div>
    </div>
  )
}

function SendBtcModal({ wallet, onClose }) {
  const [address, setAddress] = useState('')
  const [amount, setAmount]   = useState('')
  const [done, setDone]       = useState(false)
  const [loading, setLoading] = useState(false)

  async function send() {
    if (!address || !amount || parseFloat(amount) > wallet.balance_btc) return
    setLoading(true)
    await supabase.from('btc_wallets').update({ balance_btc: wallet.balance_btc - parseFloat(amount) }).eq('id', wallet.id)
    setLoading(false); setDone(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"/>
      <div className="relative z-10 w-full max-w-sm glass rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg">Send Bitcoin</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/8"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8892b0" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        {done ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-[#00c9b1]/15 flex items-center justify-center mx-auto mb-3"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00c9b1" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg></div>
            <p className="font-bold mb-1">Sent!</p>
            <p className="text-sm text-[#8892b0]">{amount} BTC sent</p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm text-[#8892b0] mb-1.5">Recipient address</label>
                <input value={address} onChange={e=>setAddress(e.target.value)} placeholder="bc1q..."
                  className="w-full bg-[#0b0d14] border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white placeholder-[#4a5568] focus:outline-none focus:border-[#4f7fff] transition-colors"/>
              </div>
              <div>
                <label className="block text-sm text-[#8892b0] mb-1.5">Amount (BTC)</label>
                <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.001" step="0.00001"
                  className="w-full bg-[#0b0d14] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[#4a5568] focus:outline-none focus:border-[#4f7fff] transition-colors"/>
              </div>
            </div>
            <p className="text-xs text-[#4a5568] mb-4">Balance: {wallet.balance_btc.toFixed(8)} BTC</p>
            <button onClick={send} disabled={loading || !address || !amount}
              className="w-full py-3 bg-[#f5c842] hover:brightness-110 text-[#0b0d14] font-bold rounded-xl text-sm transition-all disabled:opacity-40">
              {loading ? 'Sending…' : 'Send BTC'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

const PERIODS = ['1D','1W','1M','3M','1Y']

export default function Bitcoin() {
  const { wallet, loading, refresh } = useBtcWallet()
  const { account, refresh: refreshAcc } = useAccount()
  const { transactions, refetch } = useTransactions(account?.id)
  const [modal, setModal]   = useState(null)
  const [period, setPeriod] = useState('1M')

  const btcTxns = useMemo(() =>
    transactions.filter(t => t.type === 'btc_buy' || t.type === 'btc_sell').slice(0, 6), [transactions])

  const usdValue = wallet ? wallet.balance_btc * BTC_PRICE : 0

  function handleBuySuccess() { refresh(); refreshAcc(); refetch(); setModal(null) }

  return (
    <DashboardLayout title="Bitcoin Wallet" subtitle="Buy, hold, and send Bitcoin — all in one place">
      <div className="grid lg:grid-cols-3 gap-6 max-w-5xl">

        {/* Left col */}
        <div className="lg:col-span-2 space-y-5">
          {/* Price card */}
          <div className="rounded-2xl p-6 border border-white/5" style={{background:'linear-gradient(135deg,#1a1508,#111008)'}}>
            <div className="flex items-start justify-between mb-1">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">₿</span>
                  <span className="font-semibold">Bitcoin</span>
                  <span className="text-[#8892b0] text-sm">BTC</span>
                </div>
                <p className="text-4xl font-black">${fmt(BTC_PRICE)}</p>
              </div>
              <div className="pill pill-teal">+{PRICE_CHANGE}% ↑</div>
            </div>
            <p className="text-xs text-[#8892b0] mb-4">Updated just now</p>

            {/* Period selector */}
            <div className="flex gap-1 mb-3">
              {PERIODS.map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${period===p ? 'bg-[#f5c842] text-[#0b0d14]' : 'text-[#8892b0] hover:text-white'}`}>
                  {p}
                </button>
              ))}
            </div>
            <PriceChart data={CHART_DATA} />
          </div>

          {/* BTC Transaction history */}
          <div className="rounded-2xl border border-white/5 p-5" style={{background:'rgba(17,20,34,0.8)'}}>
            <h3 className="text-sm font-semibold text-[#8892b0] uppercase tracking-widest mb-4">BTC Activity</h3>
            {btcTxns.length === 0 ? (
              <div className="text-center py-8 text-[#4a5568]">
                <span className="text-3xl block mb-2">₿</span>
                <p className="text-sm">No Bitcoin transactions yet</p>
              </div>
            ) : btcTxns.map(tx => (
              <div key={tx.id} className="flex items-center gap-3 px-2 py-3 border-b border-white/5 last:border-0">
                <div className="w-9 h-9 rounded-xl bg-[#f5c842]/15 flex items-center justify-center text-base flex-shrink-0">₿</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{tx.description}</p>
                  <p className="text-xs text-[#4a5568]">{new Date(tx.created_at).toLocaleDateString()}</p>
                </div>
                <span className="text-sm font-semibold text-red-400 flex-shrink-0">-${fmt(tx.amount)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: wallet card */}
        <div className="space-y-4">
          <div className="rounded-2xl p-5 border border-[#f5c842]/20" style={{background:'linear-gradient(135deg,#1a1508,#0e0b04)'}}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-[#f5c842]/20 flex items-center justify-center text-lg">₿</div>
              <div>
                <p className="font-semibold text-sm">My BTC Wallet</p>
                <p className="text-xs text-[#8892b0]">Bitcoin</p>
              </div>
            </div>
            {loading ? (
              <div className="animate-pulse h-8 bg-white/5 rounded mb-2"/>
            ) : (
              <>
                <p className="text-3xl font-black mb-0.5">{wallet?.balance_btc.toFixed(6) ?? '0.000000'}</p>
                <p className="text-sm text-[#8892b0] mb-4">≈ ${fmt(usdValue)} USD</p>
              </>
            )}
            {/* Wallet address */}
            <div className="bg-black/30 rounded-xl p-3 mb-5">
              <p className="text-[10px] text-[#8892b0] mb-1 uppercase tracking-wider">Wallet address</p>
              <p className="text-[11px] font-mono text-[#8892b0] break-all leading-relaxed">{wallet?.address ?? '—'}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setModal('buy')}
                className="py-2.5 rounded-xl text-sm font-semibold bg-[#f5c842] hover:brightness-110 text-[#0b0d14] transition-all">
                Buy BTC
              </button>
              <button onClick={() => setModal('send')}
                className="py-2.5 rounded-xl text-sm font-semibold bg-white/8 hover:bg-white/12 border border-white/10 transition-all">
                Send BTC
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="rounded-2xl border border-white/5 p-5 space-y-4" style={{background:'rgba(17,20,34,0.8)'}}>
            <h3 className="text-sm font-semibold text-[#8892b0] uppercase tracking-widest">Market info</h3>
            {[
              ['Market cap', '$1.33T'],
              ['24h volume', '$28.4B'],
              ['All-time high', '$73,737'],
              ['Circulating supply', '19.7M BTC'],
            ].map(([l,v]) => (
              <div key={l} className="flex justify-between">
                <span className="text-xs text-[#8892b0]">{l}</span>
                <span className="text-xs font-medium">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {modal === 'buy'  && <BuyModal wallet={wallet} account={account} onClose={() => setModal(null)} onSuccess={handleBuySuccess}/>}
      {modal === 'send' && <SendBtcModal wallet={wallet} onClose={() => setModal(null)}/>}
    </DashboardLayout>
  )
}
