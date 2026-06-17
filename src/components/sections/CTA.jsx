export default function CTA() {
  return (
    <section className="py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #0f1a50, #0b1230, #0b0d14)' }} />
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(79,127,255,0.15)' }} />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(124,92,252,0.1)' }} />
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />

          <div className="relative z-10 text-center py-20 px-5 sm:px-8">
            <div className="pill pill-blue mb-6 mx-auto w-fit">Join our global community</div>

            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6">
              Get the only<br />financial super app
            </h2>

            <p className="text-[#8892b0] text-lg max-w-xl mx-auto mb-10">
              Join 1.8 million+ people who manage their entire financial life with Syntax Trust Bank. Open your account in under 5 minutes.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <a href="/signup"
                 className="w-full sm:w-auto px-8 py-4 bg-white text-[#0b0d14] font-bold rounded-xl text-[15px] hover:bg-gray-100 transition-colors">
                Open free account
              </a>
              <a href="#"
                 className="w-full sm:w-auto px-8 py-4 border border-white/20 hover:border-white/40 text-white rounded-xl text-[15px] transition-colors">
                View demo
              </a>
            </div>

            <div className="flex items-center justify-center gap-4">
              {[
                { store: 'App Store', sub: 'Download on the' },
                { store: 'Google Play', sub: 'Get it on' },
              ].map(({ store, sub }) => (
                <div key={store} className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl hover:bg-white/8 transition-colors cursor-pointer">
                  <div className="text-left">
                    <p className="text-xs text-[#8892b0]">{sub}</p>
                    <p className="text-sm font-semibold">{store}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
