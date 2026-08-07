import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

function Spinner() {
  return <div className="w-5 h-5 border-2 border-[#4f7fff] border-t-transparent rounded-full animate-spin mx-auto" />
}

export default function AdminMFA() {
  const navigate = useNavigate()
  const [mode, setMode]           = useState(null) // 'setup' | 'verify'
  const [qr, setQr]               = useState(null)
  const [secret, setSecret]       = useState(null)
  const [factorId, setFactorId]   = useState(null)
  const [challengeId, setChallengeId] = useState(null)
  const [code, setCode]           = useState('')
  const [error, setError]         = useState(null)
  const [loading, setLoading]     = useState(true)

  useEffect(() => { init() }, [])

  async function init() {
    const { data: { totp } } = await supabase.auth.mfa.listFactors()
    if (totp?.length) {
      // Factor exists — start a challenge to verify
      setFactorId(totp[0].id)
      const { data, error } = await supabase.auth.mfa.challenge({ factorId: totp[0].id })
      if (error) { setError(error.message); setLoading(false); return }
      setChallengeId(data.id)
      setMode('verify')
    } else {
      // No factor — enroll a new one
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', issuer: 'Syntax Trust Bank' })
      if (error) { setError(error.message); setLoading(false); return }
      setFactorId(data.id)
      setQr(data.totp.qr_code)
      setSecret(data.totp.secret)
      // Get a challenge for the verify step
      const { data: ch } = await supabase.auth.mfa.challenge({ factorId: data.id })
      setChallengeId(ch?.id)
      setMode('setup')
    }
    setLoading(false)
  }

  async function handleVerify(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.mfa.verify({ factorId, challengeId, code: code.replace(/\s/g, '') })
    setLoading(false)
    if (error) { setError(error.message); return }
    navigate('/admin', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#0b0d14] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl bg-[#4f7fff] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
              <path d="M3 5.5L9 2L15 5.5V12.5L9 16L3 12.5V5.5Z" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.5"/>
              <path d="M9 6L12 7.5V10.5L9 12L6 10.5V7.5L9 6Z" fill="white"/>
            </svg>
          </div>
          <span className="font-bold text-lg text-white tracking-tight">SYNTAX <span className="text-[#4f7fff]">TRUST</span></span>
        </div>

        <div className="rounded-2xl border border-white/8 bg-[#111422] p-7 space-y-6">
          {loading ? (
            <div className="py-8"><Spinner /></div>
          ) : mode === 'setup' ? (
            <>
              <div>
                <h1 className="text-lg font-bold text-white">Set up two-factor authentication</h1>
                <p className="text-sm text-[#8892b0] mt-1">Required for all admin accounts. Scan with Google Authenticator or Authy.</p>
              </div>

              {qr && (
                <div className="flex flex-col items-center gap-3">
                  <div className="bg-white p-3 rounded-xl">
                    <img src={qr} alt="TOTP QR Code" className="w-40 h-40" />
                  </div>
                  <div className="w-full">
                    <p className="text-[11px] text-[#8892b0] text-center mb-1">Or enter manually:</p>
                    <p className="text-xs font-mono text-center text-[#4f7fff] bg-[#4f7fff]/10 px-3 py-2 rounded-lg break-all">{secret}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="block text-xs text-[#8892b0] mb-1.5">Enter the 6-digit code from your app</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center text-xl font-mono text-white tracking-[0.3em] focus:outline-none focus:border-[#4f7fff] placeholder:text-white/20"
                    autoFocus
                  />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button
                  type="submit"
                  disabled={code.length !== 6 || loading}
                  className="w-full bg-[#4f7fff] hover:bg-blue-500 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-all"
                >
                  {loading ? <Spinner /> : 'Activate 2FA'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div>
                <h1 className="text-lg font-bold text-white">Two-factor verification</h1>
                <p className="text-sm text-[#8892b0] mt-1">Enter the code from your authenticator app to access the admin panel.</p>
              </div>

              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="block text-xs text-[#8892b0] mb-1.5">6-digit code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center text-xl font-mono text-white tracking-[0.3em] focus:outline-none focus:border-[#4f7fff] placeholder:text-white/20"
                    autoFocus
                  />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button
                  type="submit"
                  disabled={code.length !== 6 || loading}
                  className="w-full bg-[#4f7fff] hover:bg-blue-500 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-all"
                >
                  {loading ? <Spinner /> : 'Verify & continue'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
