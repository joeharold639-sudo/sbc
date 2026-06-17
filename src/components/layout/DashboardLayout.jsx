import Sidebar from '../dashboard/Sidebar'

export default function DashboardLayout({ children, title, subtitle, right }) {
  return (
    <div className="flex min-h-screen bg-[#0b0d14] text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {(title || right) && (
          <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-white/5 flex-shrink-0">
            <div>
              {title && <h1 className="text-xl font-black">{title}</h1>}
              {subtitle && <p className="text-sm text-[#8892b0] mt-0.5">{subtitle}</p>}
            </div>
            {right && <div>{right}</div>}
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6">
          {children}
        </div>
      </div>
    </div>
  )
}
