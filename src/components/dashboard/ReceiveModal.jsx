import { useState } from 'react'

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

// Simple deterministic QR-like SVG from account number
function QRCode({ value }) {
  const size = 160
  const cells = 12
  const cell = size / cells
  // seed a pseudo-random grid from the value string
  const seed = value.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const rand = (i) => ((seed * 9301 + i * 49297 + 233) % 233280) / 233280

  const blocks = []
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      const edge = r < 3 && c < 3
      const edgeTR = r < 3 && c > cells - 4
      const edgeBL = r > cells - 4 && c < 3
      const filled = edge || edgeTR || edgeBL || rand(r * cells + c) > 0.55
      if (filled) {
        blocks.push(<rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell - 1} height={cell - 1} rx="1" fill="white"/>)
      }
    }
  }

  // finder squares
  const finder = (x, y) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width={cell * 3} height={cell * 3} rx="3" fill="white"/>
      <rect x={x + cell * 0.7} y={y + cell * 0.7} width={cell * 1.6} height={cell * 1.6} rx="2" fill="#111422"/>
      <rect x={x + cell} y={y + cell} width={cell} height={cell} rx="1" fill="white"/>
    </g>
  )

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-40 h-40">
      <rect width={size} height={size} rx="8" fill="#111422"/>
      {blocks}
      {finder(0, 0)}
      {finder(size - cell * 3, 0)}
      {finder(0, size - cell * 3)}
    </svg>
  )
}

export default function ReceiveModal({ account, onClose }) {
  const [copied, setCopied] = useState(false)

  function copy(text) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-bold text-lg">Receive money</h2>
          <p className="text-xs text-[#8892b0]">Share your details to get paid</p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/8 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8892b0" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* QR */}
      <div className="flex justify-center mb-6">
        <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <QRCode value={account?.account_number ?? 'default'} />
        </div>
      </div>

      {/* Account number */}
      <div className="mb-4">
        <p className="text-xs text-[#8892b0] mb-1.5">Account number</p>
        <div className="flex items-center gap-2 bg-[#0b0d14] border border-white/10 rounded-xl px-4 py-3">
          <span className="flex-1 text-sm font-mono font-medium tracking-wider">
            {account?.account_number ?? '—'}
          </span>
          <button onClick={() => copy(account?.account_number ?? '')}
            className="flex items-center gap-1.5 text-xs text-[#4f7fff] hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/5">
            {copied
              ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg> Copied</>
              : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy</>
            }
          </button>
        </div>
      </div>

      {/* Currency + routing */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-[#0b0d14] border border-white/10 rounded-xl px-4 py-3">
          <p className="text-xs text-[#8892b0] mb-1">Currency</p>
          <p className="text-sm font-semibold">{account?.currency ?? 'USD'}</p>
        </div>
        <div className="bg-[#0b0d14] border border-white/10 rounded-xl px-4 py-3">
          <p className="text-xs text-[#8892b0] mb-1">Routing</p>
          <p className="text-sm font-semibold">026009593</p>
        </div>
      </div>

      {/* Share button */}
      <button
        onClick={() => copy(`Account: ${account?.account_number}\nCurrency: ${account?.currency ?? 'USD'}\nRouting: 026009593`)}
        className="w-full py-3 bg-[#4f7fff] hover:bg-blue-500 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
        Share details
      </button>
    </Modal>
  )
}
