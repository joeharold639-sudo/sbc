import { useState } from 'react'

const Logo = () => (
  <a href="/" className="flex items-center gap-2.5 flex-shrink-0">
    <div className="w-8 h-8 rounded-lg bg-[#4f7fff] flex items-center justify-center">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 5.5L9 2L15 5.5V12.5L9 16L3 12.5V5.5Z" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.5"/>
        <path d="M9 6L12 7.5V10.5L9 12L6 10.5V7.5L9 6Z" fill="white"/>
      </svg>
    </div>
    <span className="font-bold text-[15px] tracking-tight">
      SYNTAX <span className="text-[#4f7fff]">TRUST</span>
    </span>
  </a>
)

const navLinks = [
  { label: 'Products', href: '#features' },
  { label: 'Solutions', href: '#transfers' },
  { label: 'Security', href: '#security' },
  { label: 'About', href: '#' },
  { label: 'Pricing', href: '#' },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <Logo />

        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map(l => (
            <a key={l.label} href={l.href} className="nav-link">{l.label}</a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <a href="/login" className="text-sm text-[#8892b0] hover:text-white transition-colors px-3 py-1.5">Log in</a>
          <a href="/signup" className="text-sm font-semibold bg-[#4f7fff] hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-all">
            Open account
          </a>
        </div>

        <button
          onClick={() => setOpen(o => !o)}
          className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 5H17M3 10H17M3 15H17" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-white/5 px-5 py-4 space-y-1">
          {navLinks.map(l => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)}
               className="block text-sm text-[#8892b0] hover:text-white py-2 transition-colors">
              {l.label}
            </a>
          ))}
          <div className="pt-3 flex flex-col gap-2">
            <a href="/login" className="text-sm text-center text-[#8892b0] border border-white/10 px-4 py-2.5 rounded-lg hover:border-white/20 transition-colors">
              Log in
            </a>
            <a href="/signup" className="text-sm text-center font-semibold bg-[#4f7fff] text-white px-4 py-2.5 rounded-lg">
              Open account
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
