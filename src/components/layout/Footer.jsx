const Logo = () => (
  <div className="flex items-center gap-2.5 mb-4">
    <div className="w-8 h-8 rounded-lg bg-[#4f7fff] flex items-center justify-center">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 5.5L9 2L15 5.5V12.5L9 16L3 12.5V5.5Z" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.5"/>
        <path d="M9 6L12 7.5V10.5L9 12L6 10.5V7.5L9 6Z" fill="white"/>
      </svg>
    </div>
    <span className="font-bold text-[15px] tracking-tight">
      SYNTAX <span className="text-[#4f7fff]">TRUST</span>
    </span>
  </div>
)

const columns = [
  {
    title: 'Products',
    links: ['Personal Banking', 'Business Banking', 'Bitcoin Wallet', 'Virtual Cards', 'International Transfers'],
  },
  {
    title: 'Company',
    links: ['About Us', 'Careers', 'Blog', 'Press', 'Contact'],
  },
  {
    title: 'Legal',
    links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Licenses', 'Security'],
  },
]

export default function Footer() {
  return (
    <footer className="bg-[#111422] border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          <div className="lg:col-span-2">
            <Logo />
            <p className="text-sm text-[#8892b0] leading-relaxed max-w-xs mb-5">
              Syntax Trust Bank is a financial technology company, not a bank. Banking services are provided through our partner institutions.
            </p>
            <div className="flex gap-3">
              {['X', 'IG', '+'].map(s => (
                <a key={s} href="#" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs text-[#8892b0] transition-colors">
                  {s}
                </a>
              ))}
            </div>
          </div>

          {columns.map(col => (
            <div key={col.title}>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#4a5568] mb-4">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map(link => (
                  <li key={link}>
                    <a href="#" className="text-sm text-[#8892b0] hover:text-white transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <hr className="section-divider mb-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#4a5568]">© 2026 Syntax Trust Bank. All rights reserved.</p>
          <p className="text-xs text-[#4a5568] text-center sm:text-right max-w-md">
            Banking services provided through partner financial institutions. FDIC insured up to $250,000. Crypto assets are not FDIC insured.
          </p>
        </div>
      </div>
    </footer>
  )
}
