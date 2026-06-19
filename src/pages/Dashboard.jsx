import { useState, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useAccount } from '../hooks/useAccount'
import { useTransactions } from '../hooks/useTransactions'
import Sidebar from '../components/dashboard/Sidebar'
import BalanceCard from '../components/dashboard/BalanceCard'
import QuickActions from '../components/dashboard/QuickActions'
import TransactionFeed from '../components/dashboard/TransactionFeed'
import SpendingStats from '../components/dashboard/SpendingStats'
import SendModal from '../components/dashboard/SendModal'
import ReceiveModal from '../components/dashboard/ReceiveModal'
import AreaChart, { Area, XAxis, YAxis, ChartTooltip, Grid } from '../components/ui/area-chart'
import { FinancialTable } from '../components/ui/financial-markets-table'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/interfaces-card'

function buildBalanceHistory(transactions, currentBalance) {
  if (!transactions?.length || currentBalance == null) return []
  let balance = currentBalance
  const points = [{ date: new Date(), value: Math.max(0, balance) }]
  for (const tx of transactions) {
    if (tx.type === 'credit' || tx.type === 'btc_sell') {
      balance -= tx.amount
    } else {
      balance += tx.amount
    }
    points.push({ date: new Date(tx.created_at), value: Math.max(0, balance) })
  }
  return points.reverse()
}

export default function Dashboard() {
  const { profile } = useAuth()
  const { account, loading: acctLoading, refresh: refreshAccount } = useAccount()
  const { transactions, loading: txLoading, refetch: refetchTx } = useTransactions(account?.id)

  const [modal, setModal] = useState(null)

  const chartData = useMemo(
    () => buildBalanceHistory(transactions, account?.balance),
    [transactions, account?.balance]
  )

  function handleSendSuccess() {
    refreshAccount()
    refetchTx()
  }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="flex min-h-screen bg-[#0b0d14] text-white">
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-white/5">
          <div>
            <p className="text-xs text-[#8892b0]">{greeting()},</p>
            <h1 className="text-lg font-bold leading-tight">
              {profile?.full_name ?? 'Welcome back'} 👋
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {profile?.kyc_status && profile.kyc_status !== 'approved' && (
              <a href="/kyc" className="pill pill-blue text-[11px]">
                {profile.kyc_status === 'pending' ? '⚠ Complete KYC' : '🕐 KYC in review'}
              </a>
            )}
            <button className="relative p-2 rounded-xl hover:bg-white/5 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8892b0" strokeWidth="1.8" strokeLinecap="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#4f7fff] rounded-full"/>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex gap-0 overflow-hidden">
          {/* Center */}
          <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-6 min-w-0">
            <BalanceCard
              account={account}
              onSend={() => setModal('send')}
              onReceive={() => setModal('receive')}
            />

            <QuickActions
              onSend={() => setModal('send')}
              onReceive={() => setModal('receive')}
            />

            {/* Balance History Chart */}
            {chartData.length > 1 && (
              <Card className="border-white/5 bg-[#111422] text-white overflow-hidden">
                <CardHeader className="border-white/5 py-3">
                  <CardTitle className="text-sm font-semibold text-white">Balance History</CardTitle>
                </CardHeader>
                <CardContent className="p-0 pt-2 pb-2">
                  <AreaChart data={chartData} xDataKey="date" aspectRatio="4/1">
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
                        value: `$${Number(point.value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                      }]}
                    />
                  </AreaChart>
                </CardContent>
              </Card>
            )}

            <TransactionFeed transactions={transactions} loading={txLoading || acctLoading} />

            {/* Market Overview */}
            <Card className="border-white/5 bg-[#111422] text-white overflow-hidden">
              <CardHeader className="border-white/5 py-3">
                <CardTitle className="text-sm font-semibold text-white">Market Overview</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <FinancialTable />
              </CardContent>
            </Card>
          </div>

          {/* Right panel */}
          <div className="hidden xl:block w-80 flex-shrink-0 border-l border-white/5 overflow-y-auto px-5 py-6">
            <SpendingStats transactions={transactions} account={account} />
          </div>
        </div>
      </div>

      {modal === 'send' && (
        <SendModal
          account={account}
          onClose={() => setModal(null)}
          onSuccess={handleSendSuccess}
        />
      )}
      {modal === 'receive' && (
        <ReceiveModal
          account={account}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
