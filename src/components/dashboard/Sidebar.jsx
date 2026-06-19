import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const nav = [
  {
    label: 'Dashboard', href: '/dashboard',
    icon: <path d="M3 5C3 3.9 3.9 3 5 3H8C9.1 3 10 3.9 10 5V8C10 9.1 9.1 10 8 10H5C3.9 10 3 9.1 3 8V5ZM14 5C14 3.9 14.9 3 16 3H19C20.1 3 21 3.9 21 5V8C21 9.1 20.1 10 19 10H16C14.9 10 14 9.1 14 8V5ZM3 16C3 14.9 3.9 14 5 14H8C9.1 14 10 14.9 10 16V19C10 20.1 9.1 21 8 21H5C3.9 21 3 20.1 3 19V16ZM14 16C14 14.9 14.9 14 16 14H19C20.1 14 21 14.9 21 16V19C21 20.1 20.1 21 19 21H16C14.9 21 14 20.1 14 19V16Z" />,
  },
  {
    label: 'Transfers', href: '/transfers',
    icon: <><path d="M5 12H19"/><path d="M12 5L19 12L12 19"/></>,
  },
  {
    label: 'Cards', href: '/cards',
    icon: <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10H22"/></>,
  },
  {
    label: 'Bitcoin', href: '/bitcoin',
    icon: <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v.5h1a2 2 0 0 1 2 2v.5h.5a2 2 0 0 1 0 4H15v.5a2 2 0 0 1-2 2H12v.5A2.5 2.5 0 0 1 9.5 17h-1A2.5 2.5 0 0 1 6 14.5V14H5a2 2 0 0 1 0-4h1v-.5A2.5 2.5 0 0 1 8.5 7H9V6a2 2 0 0 1 2-2h.5V3A2.5 2.5 0 0 1 9.5 2z" />,
  },
  {
    label: 'Bills', href: '/bills',
    icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></>,
  },
  {
    label: 'History', href: '/history',
    icon: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
  },
]

const bottom = [
  {
    label: 'Settings', href: '/settings',
    icon: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
  },
]

function NavIcon({ d }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {d}
    </svg>
  )
}

export default function Sidebar() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const linkCls = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-[#4f7fff]/15 text-white'
        : 'text-[#8892b0] hover:text-white hover:bg-white/5'
    } ${collapsed ? 'justify-center' : ''}`

  return (
    <aside
      className={`${collapsed ? 'w-16' : 'w-60'} flex-shrink-0 flex flex-col h-screen sticky top-0 border-r border-white/5 bg-[#0d0f1a] transition-all duration-300 overflow-hidden`}
    >
      {/* Logo + collapse toggle */}
      <div className="px-3 py-5 border-b border-white/5 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#4f7fff] flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 5.5L9 2L15 5.5V12.5L9 16L3 12.5V5.5Z" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.5"/>
                <path d="M9 6L12 7.5V10.5L9 12L6 10.5V7.5L9 6Z" fill="white"/>
              </svg>
            </div>
            <span className="font-bold text-[15px] tracking-tight whitespace-nowrap">SYNTAX <span className="text-[#4f7fff]">TRUST</span></span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-[#4f7fff] flex items-center justify-center mx-auto">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 5.5L9 2L15 5.5V12.5L9 16L3 12.5V5.5Z" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.5"/>
              <path d="M9 6L12 7.5V10.5L9 12L6 10.5V7.5L9 6Z" fill="white"/>
            </svg>
          </div>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          className={`p-1.5 rounded-lg text-[#8892b0] hover:text-white hover:bg-white/5 transition-all flex-shrink-0 ${collapsed ? 'mx-auto mt-2' : ''}`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {collapsed
              ? <><path d="M9 18l6-6-6-6"/></>
              : <><path d="M15 18l-6-6 6-6"/></>
            }
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {nav.map(item => (
          <NavLink
            key={item.label}
            to={item.href}
            className={linkCls}
            title={collapsed ? item.label : undefined}
          >
            <NavIcon d={item.icon} />
            {!collapsed && item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 border-t border-white/5 pt-3 space-y-1">
        {profile?.is_admin && (
          <NavLink
            to="/admin"
            className={linkCls}
            title={collapsed ? 'Admin' : undefined}
          >
            <NavIcon d={<><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></>} />
            {!collapsed && 'Admin'}
          </NavLink>
        )}
        {bottom.map(item => (
          <NavLink
            key={item.label}
            to={item.href}
            className={linkCls}
            title={collapsed ? item.label : undefined}
          >
            <NavIcon d={item.icon} />
            {!collapsed && item.label}
          </NavLink>
        ))}

        {/* User / logout */}
        <button
          onClick={() => { signOut(); navigate('/') }}
          title={collapsed ? 'Log out' : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#8892b0] hover:text-white hover:bg-white/5 transition-all mt-2 ${collapsed ? 'justify-center' : ''}`}
        >
          <div className="w-7 h-7 rounded-full bg-[#4f7fff]/30 flex items-center justify-center text-xs font-bold text-[#4f7fff] flex-shrink-0">
            {profile?.full_name?.[0]?.toUpperCase() ?? '?'}
          </div>
          {!collapsed && (
            <div className="flex-1 text-left min-w-0">
              <p className="text-xs font-medium text-white truncate">{profile?.full_name ?? 'My Account'}</p>
              <p className="text-[10px] text-[#4a5568] truncate">Log out</p>
            </div>
          )}
        </button>
      </div>
    </aside>
  )
}
