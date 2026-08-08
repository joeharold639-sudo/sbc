import { useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { useAuth } from '../context/AuthContext'
import { useAccount } from '../hooks/useAccount'
import { supabase } from '../lib/supabase'

function fmt(n) { return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }

const KYC_MAP = {
  pending:     { label: 'Pending',     cls: 'text-[#8892b0] bg-white/5' },
  in_progress: { label: 'In Progress', cls: 'text-[#f5c842] bg-[#f5c842]/10' },
  approved:    { label: 'Verified',    cls: 'text-[#00c9b1] bg-[#00c9b1]/10' },
  rejected:    { label: 'Rejected',    cls: 'text-red-400 bg-red-500/10' },
}

export default function Settings() {
  const { profile, updateProfile } = useAuth()
  const { account }                = useAccount()

  const [fullName,  setFullName]  = useState(profile?.full_name ?? '')
  const [saving,    setSaving]    = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [error,     setError]     = useState('')

  const [pwForm,    setPwForm]    = useState({ current: '', next: '', confirm: '' })
  const [pwSaving,  setPwSaving]  = useState(false)
  const [pwMsg,     setPwMsg]     = useState('')

  const kyc = KYC_MAP[profile?.kyc_status] ?? KYC_MAP.pending
  const initials = (profile?.full_name ?? '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  async function saveProfile(e) {
    e.preventDefault()
    if (!fullName.trim()) return
    setSaving(true); setSaved(false); setError('')
    const { error: err } = await updateProfile({ full_name: fullName.trim() })
    setSaving(false)
    if (err) { setError(err.message); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  async function changePassword(e) {
    e.preventDefault()
    setPwMsg('')
    if (pwForm.next !== pwForm.confirm) { setPwMsg('Passwords do not match.'); return }
    if (pwForm.next.length < 8)         { setPwMsg('Password must be at least 8 characters.'); return }
    setPwSaving(true)
    const { error } = await supabase.auth.updateUser({ password: pwForm.next })
    setPwSaving(false)
    if (error) { setPwMsg(error.message); return }
    setPwForm({ current: '', next: '', confirm: '' })
    setPwMsg('Password updated successfully.')
  }

  const inputCls = "w-full bg-[#111422] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[#4a5568] focus:outline-none focus:border-[#4f7fff] transition-colors"
  const card     = "rounded-2xl border border-white/5 p-6 space-y-5"
  const bg       = { background: 'rgba(17,20,34,0.8)' }

  return (
    <DashboardLayout title="Settings" subtitle="Manage your profile and account preferences">
      <div className="max-w-2xl space-y-6">

        {/* Avatar + account snapshot */}
        <div className={card} style={bg}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#4f7fff]/20 flex items-center justify-center text-2xl font-black text-[#4f7fff] flex-shrink-0">
              {initials}
            </div>
            <div>
              <p className="font-bold text-lg text-white">{profile?.full_name ?? '—'}</p>
              <p className="text-sm text-[#8892b0]">{profile?.email ?? '—'}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${kyc.cls}`}>{kyc.label}</span>
            </div>
            {account && (
              <div className="ml-auto text-right">
                <p className="text-xs text-[#8892b0]">Account</p>
                <p className="text-sm font-mono text-white">••••{account.account_number?.slice(-4)}</p>
                <p className="text-lg font-black text-[#4f7fff]">${fmt(account.balance)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Edit profile */}
        <form onSubmit={saveProfile} className={card} style={bg}>
          <h3 className="font-bold text-white">Profile information</h3>
          <div>
            <label className="block text-sm text-[#8892b0] mb-1.5">Full name</label>
            <input
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Your full name"
              className={inputCls}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-[#8892b0] mb-1.5">Email address</label>
            <input value={profile?.email ?? ''} disabled className={inputCls + " opacity-40 cursor-not-allowed"} />
            <p className="text-xs text-[#4a5568] mt-1">Email cannot be changed here. Contact support.</p>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={saving || !fullName.trim()}
            className="px-6 py-2.5 bg-[#4f7fff] hover:bg-blue-500 disabled:opacity-40 rounded-xl text-sm font-semibold transition-all">
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save changes'}
          </button>
        </form>

        {/* Change password */}
        <form onSubmit={changePassword} className={card} style={bg}>
          <h3 className="font-bold text-white">Change password</h3>
          {[
            { label: 'New password',     key: 'next',    placeholder: 'At least 8 characters' },
            { label: 'Confirm password', key: 'confirm', placeholder: 'Repeat new password' },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="block text-sm text-[#8892b0] mb-1.5">{label}</label>
              <input
                type="password"
                value={pwForm[key]}
                onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className={inputCls}
              />
            </div>
          ))}
          {pwMsg && (
            <p className={`text-sm ${pwMsg.includes('success') ? 'text-[#00c9b1]' : 'text-red-400'}`}>{pwMsg}</p>
          )}
          <button type="submit" disabled={pwSaving || !pwForm.next || !pwForm.confirm}
            className="px-6 py-2.5 bg-white/8 hover:bg-white/12 border border-white/10 disabled:opacity-40 rounded-xl text-sm font-semibold transition-all">
            {pwSaving ? 'Updating…' : 'Update password'}
          </button>
        </form>

        {/* Account details */}
        {account && (
          <div className={card} style={bg}>
            <h3 className="font-bold text-white">Account details</h3>
            {[
              ['Account number', account.account_number],
              ['Account type',   account.type ?? 'Personal'],
              ['Currency',       account.currency ?? 'USD'],
              ['Status',         account.status ?? 'Active'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-2.5 border-b border-white/5 last:border-0">
                <span className="text-sm text-[#8892b0]">{label}</span>
                <span className="text-sm font-medium text-white capitalize">{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* KYC */}
        {profile?.kyc_status !== 'approved' && (
          <div className="rounded-2xl border border-[#f5c842]/20 p-5" style={{ background: 'rgba(245,200,66,0.05)' }}>
            <div className="flex items-start gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f5c842" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0 mt-0.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <div>
                <p className="text-sm font-semibold text-[#f5c842] mb-1">KYC verification incomplete</p>
                <p className="text-xs text-[#8892b0] mb-3">Complete identity verification to unlock higher transfer limits.</p>
                <a href="/kyc" className="px-4 py-2 bg-[#f5c842]/15 hover:bg-[#f5c842]/25 border border-[#f5c842]/20 text-[#f5c842] rounded-lg text-xs font-semibold transition-all inline-block">
                  Complete KYC →
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
