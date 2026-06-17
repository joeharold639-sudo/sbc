import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const Logo = () => (
  <Link to="/" className="flex items-center gap-2.5 mb-10">
    <div className="w-8 h-8 rounded-lg bg-[#4f7fff] flex items-center justify-center">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 5.5L9 2L15 5.5V12.5L9 16L3 12.5V5.5Z" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.5"/>
        <path d="M9 6L12 7.5V10.5L9 12L6 10.5V7.5L9 6Z" fill="white"/>
      </svg>
    </div>
    <span className="font-bold text-[15px] tracking-tight">SYNTAX <span className="text-[#4f7fff]">TRUST</span></span>
  </Link>
)

const steps = ['Account', 'Personal', 'Security']

export default function SignUp() {
  const { signUp }   = useAuth()
  const navigate     = useNavigate()
  const [step, setStep] = useState(0)

  const [form, setForm] = useState({
    fullName: '', email: '', phone: '',
    password: '', confirm: '',
    agree: false,
  })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(f => ({ ...f, [k]: val }))
  }

  function nextStep(e) {
    e.preventDefault()
    setError('')
    if (step === 1 && form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    if (step < 2) { setStep(s => s + 1); return }
    handleSubmit()
  }

  async function handleSubmit() {
    if (!form.agree) { setError('Please accept the terms to continue.'); return }
    setLoading(true)
    const { error: err } = await signUp({
      email: form.email,
      password: form.password,
      fullName: form.fullName,
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    navigate('/kyc')
  }

  const inputCls = "w-full bg-[#111422] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[#4a5568] focus:outline-none focus:border-[#4f7fff] transition-colors"

  return (
    <div className="min-h-screen bg-[#0b0d14] flex items-center justify-center px-4 mesh-bg py-16">
      <div className="w-full max-w-md">
        <Logo />

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                i < step ? 'bg-[#4f7fff] text-white' :
                i === step ? 'bg-[#4f7fff] text-white' :
                'bg-white/10 text-[#4a5568]'
              }`}>
                {i < step ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : i + 1}
              </div>
              <span className={`text-xs flex-1 ${i === step ? 'text-white font-medium' : 'text-[#4a5568]'}`}>{s}</span>
              {i < steps.length - 1 && <div className={`h-px flex-1 ${i < step ? 'bg-[#4f7fff]' : 'bg-white/10'}`}/>}
            </div>
          ))}
        </div>

        <h1 className="text-3xl font-black mb-2">
          {step === 0 ? 'Create your account' : step === 1 ? 'Personal details' : 'Set your password'}
        </h1>
        <p className="text-[#8892b0] mb-8">
          {step === 0 ? 'Start banking differently — it only takes a few minutes.' :
           step === 1 ? "We'll use this to verify your identity." :
           'Choose a strong password to keep your account secure.'}
        </p>

        <form onSubmit={nextStep} className="space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-xl text-sm text-red-400 bg-red-500/10 border border-red-500/20">
              {error}
            </div>
          )}

          {step === 0 && (
            <>
              <div>
                <label className="block text-sm text-[#8892b0] mb-1.5">Full name</label>
                <input type="text" required value={form.fullName} onChange={set('fullName')}
                  placeholder="Jane Smith" className={inputCls}/>
              </div>
              <div>
                <label className="block text-sm text-[#8892b0] mb-1.5">Email address</label>
                <input type="email" required value={form.email} onChange={set('email')}
                  placeholder="jane@example.com" className={inputCls}/>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div>
                <label className="block text-sm text-[#8892b0] mb-1.5">Phone number</label>
                <input type="tel" value={form.phone} onChange={set('phone')}
                  placeholder="+1 555 000 0000" className={inputCls}/>
              </div>
              <div className="px-4 py-4 rounded-xl bg-[#4f7fff]/8 border border-[#4f7fff]/15">
                <p className="text-xs text-[#8892b0] leading-relaxed">
                  After signup you'll complete a quick identity check (KYC) to activate your account. This takes under 5 minutes.
                </p>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="block text-sm text-[#8892b0] mb-1.5">Password</label>
                <input type="password" required value={form.password} onChange={set('password')}
                  placeholder="At least 8 characters" className={inputCls}/>
              </div>
              <div>
                <label className="block text-sm text-[#8892b0] mb-1.5">Confirm password</label>
                <input type="password" required value={form.confirm} onChange={set('confirm')}
                  placeholder="••••••••" className={inputCls}/>
              </div>
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors border ${
                  form.agree ? 'bg-[#4f7fff] border-[#4f7fff]' : 'border-white/20 bg-transparent'
                }`}>
                  <input type="checkbox" checked={form.agree} onChange={set('agree')} className="sr-only"/>
                  {form.agree && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5L4.5 7.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span className="text-xs text-[#8892b0] leading-relaxed">
                  I agree to the{' '}
                  <a href="#" className="text-[#4f7fff] hover:text-white transition-colors">Terms of Service</a>{' '}
                  and{' '}
                  <a href="#" className="text-[#4f7fff] hover:text-white transition-colors">Privacy Policy</a>
                </span>
              </label>
            </>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-[#4f7fff] hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all text-sm mt-2">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeOpacity="0.3" strokeWidth="3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                Creating account…
              </span>
            ) : step < 2 ? 'Continue →' : 'Create account'}
          </button>

          {step > 0 && (
            <button type="button" onClick={() => { setError(''); setStep(s => s - 1) }}
              className="w-full py-3 border border-white/10 hover:border-white/20 text-[#8892b0] hover:text-white rounded-xl text-sm transition-colors">
              ← Back
            </button>
          )}
        </form>

        <p className="text-center text-sm text-[#8892b0] mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[#4f7fff] hover:text-white transition-colors font-medium">Log in</Link>
        </p>
      </div>
    </div>
  )
}
