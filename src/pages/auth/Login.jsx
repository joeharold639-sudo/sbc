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

export default function Login() {
  const { signIn } = useAuth()
  const navigate   = useNavigate()

  const [form, setForm]       = useState({ email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await signIn(form)
    setLoading(false)
    if (err) { setError(err.message); return }
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#0b0d14] flex items-center justify-center px-4 mesh-bg">
      <div className="w-full max-w-md">
        <Logo />

        <h1 className="text-3xl font-black mb-2">Welcome back</h1>
        <p className="text-[#8892b0] mb-8">Log in to your Syntax Trust account.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-xl text-sm text-red-400 bg-red-500/10 border border-red-500/20">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-[#8892b0] mb-1.5">Email address</label>
            <input
              type="email" required value={form.email} onChange={set('email')}
              placeholder="you@example.com"
              className="w-full bg-[#111422] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[#4a5568] focus:outline-none focus:border-[#4f7fff] transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm text-[#8892b0]">Password</label>
              <a href="#" className="text-xs text-[#4f7fff] hover:text-white transition-colors">Forgot password?</a>
            </div>
            <input
              type="password" required value={form.password} onChange={set('password')}
              placeholder="••••••••"
              className="w-full bg-[#111422] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[#4a5568] focus:outline-none focus:border-[#4f7fff] transition-colors"
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full py-3.5 bg-[#4f7fff] hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all text-sm mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeOpacity="0.3" strokeWidth="3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                Signing in…
              </span>
            ) : 'Log in'}
          </button>
        </form>

        <p className="text-center text-sm text-[#8892b0] mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#4f7fff] hover:text-white transition-colors font-medium">Sign up free</Link>
        </p>

        <p className="text-center text-xs text-[#4a5568] mt-8 leading-relaxed">
          By continuing, you agree to our{' '}
          <a href="#" className="hover:text-[#8892b0] transition-colors">Terms of Service</a> and{' '}
          <a href="#" className="hover:text-[#8892b0] transition-colors">Privacy Policy</a>.
        </p>
      </div>
    </div>
  )
}
