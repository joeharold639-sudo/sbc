import AreaChart, { Area, XAxis, YAxis, ChartTooltip, Grid } from '../ui/area-chart'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/interfaces-card'

const chartData = [
  { date: new Date(2025, 6, 1),  value: 2400 },
  { date: new Date(2025, 7, 1),  value: 3800 },
  { date: new Date(2025, 8, 1),  value: 5200 },
  { date: new Date(2025, 9, 1),  value: 7600 },
  { date: new Date(2025, 10, 1), value: 9100 },
  { date: new Date(2025, 11, 1), value: 11800 },
  { date: new Date(2026, 0, 1),  value: 14200 },
  { date: new Date(2026, 1, 1),  value: 16500 },
  { date: new Date(2026, 2, 1),  value: 18900 },
  { date: new Date(2026, 3, 1),  value: 21300 },
  { date: new Date(2026, 4, 1),  value: 23700 },
  { date: new Date(2026, 5, 1),  value: 25400 },
]

const features = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4f7fff" strokeWidth="1.8" strokeLinecap="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
      </svg>
    ),
    title: 'Real-time balance tracking',
    desc: 'Your balance updates instantly with every transaction.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c5cfc" strokeWidth="1.8" strokeLinecap="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    title: 'Full transaction history',
    desc: 'Browse and search every transaction — no limits, no hidden fees.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00c9b1" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
      </svg>
    ),
    title: 'Spending insights',
    desc: 'Understand exactly where your money goes each month.',
  },
]

export default function GrowthChart() {
  return (
    <section className="py-24 bg-[#111422] overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-14 items-center">

          {/* Left: copy */}
          <div>
            <div className="pill pill-purple mb-5 w-fit">Portfolio growth</div>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-5 leading-[1.1]">
              Watch your money<br /><span className="blue-text">grow over time</span>
            </h2>
            <p className="text-[#8892b0] text-lg mb-8 leading-relaxed">
              Intuitive charts give you a clear picture of your balance history and spending patterns at a glance — no spreadsheets required.
            </p>
            <div className="space-y-5">
              {features.map(f => (
                <div key={f.title} className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {f.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-white mb-0.5">{f.title}</p>
                    <p className="text-sm text-[#8892b0] leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: chart card */}
          <div>
            <Card className="border-white/5 bg-[#161928] text-white overflow-hidden">
              <CardHeader className="border-white/5 py-4">
                <CardTitle className="text-sm font-semibold text-white">Account Balance</CardTitle>
                <CardDescription className="text-[#8892b0] text-xs">Jul 2025 – Jun 2026</CardDescription>
              </CardHeader>
              <CardContent className="p-0 pb-2">
                <AreaChart data={chartData} xDataKey="date" aspectRatio="2/1">
                  <Grid />
                  <Area
                    dataKey="value"
                    stroke="#4f7fff"
                    fill="#4f7fff"
                    fillOpacity={0.12}
                    strokeWidth={2}
                  />
                  <XAxis />
                  <YAxis />
                  <ChartTooltip
                    rows={(point) => [{
                      color: '#4f7fff',
                      label: 'Balance',
                      value: `$${Number(point.value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
                    }]}
                  />
                </AreaChart>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </section>
  )
}
