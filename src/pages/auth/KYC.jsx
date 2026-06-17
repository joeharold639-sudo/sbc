import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const steps = ['Identity', 'Address', 'Review']

const idTypes = [
  { value: 'passport', label: 'Passport' },
  { value: 'drivers_license', label: "Driver's License" },
  { value: 'national_id', label: 'National ID Card' },
]

export default function KYC() {
  const { updateProfile } = useAuth()
  const navigate          = useNavigate()
  const [step, setStep]   = useState(0)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    dateOfBirth: '',
    idType: 'passport',
    idNumber: '',
    street: '',
    city: '',
    state: '',
    postcode: '',
    country: '',
  })

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const inputCls = "w-full bg-[#111422] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[#4a5568] focus:outline-none focus:border-[#4f7fff] transition-colors"

  async function handleSubmit() {
    setLoading(true)
    await updateProfile({
      date_of_birth: form.dateOfBirth,
      address: {
        street: form.street,
        city: form.city,
        state: form.state,
        postcode: form.postcode,
        country: form.country,
      },
      kyc_status: 'in_progress',
      kyc_submitted_at: new Date().toISOString(),
    })
    setLoading(false)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#0b0d14] flex items-center justify-center px-4 mesh-bg py-16">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-8 h-8 rounded-lg bg-[#4f7fff] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 5.5L9 2L15 5.5V12.5L9 16L3 12.5V5.5Z" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.5"/>
              <path d="M9 6L12 7.5V10.5L9 12L6 10.5V7.5L9 6Z" fill="white"/>
            </svg>
          </div>
          <span className="font-bold text-[15px] tracking-tight">SYNTAX <span className="text-[#4f7fff]">TRUST</span></span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1 last:flex-none">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                i <= step ? 'bg-[#4f7fff] text-white' : 'bg-white/10 text-[#4a5568]'
              }`}>
                {i < step ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : i + 1}
              </div>
              <span className={`text-xs ${i === step ? 'text-white font-medium' : 'text-[#4a5568]'}`}>{s}</span>
              {i < steps.length - 1 && <div className={`h-px flex-1 ${i < step ? 'bg-[#4f7fff]' : 'bg-white/10'}`}/>}
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-8">
          {step === 0 && (
            <>
              <h2 className="text-xl font-bold mb-1">Identity verification</h2>
              <p className="text-sm text-[#8892b0] mb-6">Provide your personal details as they appear on your ID.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#8892b0] mb-1.5">Date of birth</label>
                  <input type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')}
                    className={inputCls} style={{ colorScheme: 'dark' }}/>
                </div>
                <div>
                  <label className="block text-sm text-[#8892b0] mb-1.5">ID type</label>
                  <select value={form.idType} onChange={set('idType')}
                    className={inputCls + " cursor-pointer"} style={{ colorScheme: 'dark' }}>
                    {idTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#8892b0] mb-1.5">ID number</label>
                  <input type="text" value={form.idNumber} onChange={set('idNumber')}
                    placeholder="e.g. AB123456" className={inputCls}/>
                </div>

                {/* Upload placeholder */}
                <div>
                  <label className="block text-sm text-[#8892b0] mb-1.5">Upload ID document</label>
                  <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-[#4f7fff]/40 transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-[#4f7fff]/15 flex items-center justify-center mx-auto mb-3">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M10 13V7M10 7L7 10M10 7L13 10" stroke="#4f7fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3 16H17" stroke="#4f7fff" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <p className="text-sm text-[#8892b0]">Drag & drop or <span className="text-[#4f7fff]">browse</span></p>
                    <p className="text-xs text-[#4a5568] mt-1">PNG, JPG or PDF — max 10MB</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="text-xl font-bold mb-1">Your address</h2>
              <p className="text-sm text-[#8892b0] mb-6">Enter your current residential address.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#8892b0] mb-1.5">Street address</label>
                  <input type="text" value={form.street} onChange={set('street')}
                    placeholder="123 Main Street" className={inputCls}/>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-[#8892b0] mb-1.5">City</label>
                    <input type="text" value={form.city} onChange={set('city')}
                      placeholder="New York" className={inputCls}/>
                  </div>
                  <div>
                    <label className="block text-sm text-[#8892b0] mb-1.5">State / Region</label>
                    <input type="text" value={form.state} onChange={set('state')}
                      placeholder="NY" className={inputCls}/>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-[#8892b0] mb-1.5">Postcode</label>
                    <input type="text" value={form.postcode} onChange={set('postcode')}
                      placeholder="10001" className={inputCls}/>
                  </div>
                  <div>
                    <label className="block text-sm text-[#8892b0] mb-1.5">Country</label>
                    <input type="text" value={form.country} onChange={set('country')}
                      placeholder="United States" className={inputCls}/>
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-xl font-bold mb-1">Review & submit</h2>
              <p className="text-sm text-[#8892b0] mb-6">Please confirm your details are correct before submitting.</p>
              <div className="space-y-3 mb-6">
                {[
                  ['Date of birth', form.dateOfBirth || '—'],
                  ['ID type', idTypes.find(t => t.value === form.idType)?.label],
                  ['ID number', form.idNumber || '—'],
                  ['Address', [form.street, form.city, form.state, form.country].filter(Boolean).join(', ') || '—'],
                ].map(([label, val]) => (
                  <div key={label} className="flex items-start justify-between py-2.5 border-b border-white/5">
                    <span className="text-sm text-[#8892b0]">{label}</span>
                    <span className="text-sm font-medium text-right max-w-[60%]">{val}</span>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 rounded-xl bg-[#4f7fff]/8 border border-[#4f7fff]/15 mb-2">
                <p className="text-xs text-[#8892b0]">
                  Your details will be reviewed within 24 hours. You can use basic features while your KYC is being verified.
                </p>
              </div>
            </>
          )}

          <div className="mt-6 flex gap-3">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)}
                className="flex-1 py-3 border border-white/10 hover:border-white/20 text-[#8892b0] hover:text-white rounded-xl text-sm transition-colors">
                ← Back
              </button>
            )}
            <button
              onClick={step < 2 ? () => setStep(s => s + 1) : handleSubmit}
              disabled={loading}
              className="flex-1 py-3 bg-[#4f7fff] hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all"
            >
              {loading ? 'Submitting…' : step < 2 ? 'Continue →' : 'Submit for review'}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-[#4a5568] mt-6">
          Your data is encrypted and protected under our{' '}
          <a href="#" className="hover:text-[#8892b0] transition-colors">Privacy Policy</a>.
        </p>
      </div>
    </div>
  )
}
