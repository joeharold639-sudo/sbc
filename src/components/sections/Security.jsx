const items = [
  {
    bg: 'bg-[#4f7fff]/20',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 2L4 5V11C4 15.42 7.01 19.56 11 20.93C14.99 19.56 18 15.42 18 11V5L11 2Z" stroke="#4f7fff" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M8 11L10.5 13.5L14 9" stroke="#4f7fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: '256-bit AES Encryption',
    desc: 'Every piece of data is encrypted at rest and in transit using military-grade encryption.',
  },
  {
    bg: 'bg-[#7c5cfc]/20',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="4" y="10" width="14" height="10" rx="2" stroke="#7c5cfc" strokeWidth="1.5"/>
        <path d="M8 10V7C8 4.79 9.79 3 12 3V3C14.21 3 16 4.79 16 7V10" stroke="#7c5cfc" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="12" cy="15" r="1.5" fill="#7c5cfc"/>
      </svg>
    ),
    title: 'Two-Factor Authentication',
    desc: 'Protect your account with biometrics, authenticator apps, or hardware security keys.',
  },
  {
    bg: 'bg-[#00c9b1]/20',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="8" stroke="#00c9b1" strokeWidth="1.5"/>
        <path d="M11 7V11L14 14" stroke="#00c9b1" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: '24/7 Fraud Monitoring',
    desc: 'AI-powered fraud detection monitors every transaction in real time with instant alerts.',
  },
  {
    bg: 'bg-red-500/15',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 3L3 7V13C3 17 6.58 20.74 11 22C15.42 20.74 19 17 19 13V7L11 3Z" stroke="#f56565" strokeWidth="1.5"/>
        <path d="M8 11.5L10 13.5L14 9.5" stroke="#f56565" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Instant Card Freeze',
    desc: 'Freeze your card in one tap if it\'s lost or stolen. Unfreeze just as easily when you find it.',
  },
  {
    bg: 'bg-yellow-500/15',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M4 4H18V15C18 16.1 17.1 17 16 17H6C4.9 17 4 16.1 4 15V4Z" stroke="#f5c842" strokeWidth="1.5"/>
        <path d="M9 21H13M11 17V21" stroke="#f5c842" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M8 9L10.5 11.5L14 8" stroke="#f5c842" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Device Management',
    desc: 'See every device logged into your account. Revoke access to any device instantly.',
  },
  {
    bg: 'bg-green-500/15',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 2C6.03 2 2 6.03 2 11C2 15.97 6.03 20 11 20C15.97 20 20 15.97 20 11" stroke="#48bb78" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="11" cy="11" r="3" stroke="#48bb78" strokeWidth="1.5"/>
      </svg>
    ),
    title: 'FDIC Insured',
    desc: 'Your deposits are insured up to $250,000 through our banking partner network.',
  },
]

export default function Security() {
  return (
    <section id="security" className="py-24 bg-[#111422] overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="text-center mb-16">
          <div className="pill pill-teal mb-4 mx-auto w-fit">End-to-end security</div>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
            Your money is<br /><span className="blue-text">safe with us</span>
          </h2>
          <p className="text-[#8892b0] text-lg max-w-xl mx-auto">
            Bank-grade encryption, biometric authentication, and 24/7 fraud monitoring protect every transaction.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map(item => (
            <div key={item.title} className="feature-card card-3d">
              <div className={`w-11 h-11 rounded-xl ${item.bg} flex items-center justify-center mb-4`}>
                {item.icon}
              </div>
              <h3 className="font-semibold text-base mb-2">{item.title}</h3>
              <p className="text-sm text-[#8892b0] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
