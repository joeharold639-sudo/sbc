import { FinancialTable } from '../ui/financial-markets-table'

export default function Markets() {
  return (
    <section className="py-24 bg-[#0b0d14] overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="text-center mb-12">
          <div className="pill pill-blue mb-4 mx-auto w-fit">Global markets</div>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
            Track the <span className="blue-text">world's markets</span>
          </h2>
          <p className="text-[#8892b0] text-lg max-w-xl mx-auto">
            Real-time market data from major global indices, right inside your banking dashboard.
          </p>
        </div>
        <FinancialTable />
      </div>
    </section>
  )
}
