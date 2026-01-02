'use client'

// 🧪 DEMO MODE – NO DATABASE
// Waiter Dashboard - Service-focused view
// TODO: Replace with real database queries when MongoDB is connected

import { useState, useEffect } from 'react'
import AppCard from '@/components/ui/AppCard'
import KPIStatCard from '@/components/ui/KPIStatCard'
import StatusBadge from '@/components/ui/StatusBadge'
import SectionHeader from '@/components/ui/SectionHeader'
import GradientButton from '@/components/ui/GradientButton'
import { getWaiterAnalytics } from '@/lib/analytics'
import { mockOrders, mockTables, type Order } from '@/lib/mock-data'
import { 
  Users, 
  Clock, 
  Package,
  Activity,
  CheckCircle,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import { safeFormatCurrency } from '@/lib/safe-currency'
import { useCurrency } from '@/hooks/useCurrency'
import { getSafeCurrency } from '@/lib/safe-currency'

export default function WaiterDashboardPage() {
  let t: (key: string, params?: Record<string, string | number>) => string
  try {
    const translation = useTranslation()
    t = translation.t
  } catch {
    t = (key: string) => key
  }

  // Safe currency access with fallback
  let currency = 'USD'
  try {
    const currencyHook = useCurrency()
    currency = getSafeCurrency(currencyHook?.currency) || 'USD'
  } catch {
    currency = 'USD'
  }

  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [analytics, setAnalytics] = useState(getWaiterAnalytics())

  // Refresh analytics every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setAnalytics(getWaiterAnalytics())
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const readyOrders = orders.filter(o => o.status === 'ready')
  const activeTables = mockTables.filter(t => t.status === 'occupied')

  // Group ready orders by table
  const ordersByTable = readyOrders.reduce((acc, order) => {
    if (!acc[order.tableNumber]) {
      acc[order.tableNumber] = []
    }
    acc[order.tableNumber].push(order)
    return acc
  }, {} as Record<string, Order[]>)

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1a1a] via-[#252525] to-[#1a1a1a] border border-gray-800/50 p-8 md:p-12">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-transparent" />
        <div className="relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center shadow-lg shadow-green-500/10">
              <Users className="h-8 w-8 text-green-400" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {t('dashboard.waiter.title')}
              </h1>
              <p className="text-lg text-gray-400">
                {t('dashboard.waiter.subtitle')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPIStatCard
          label={t('dashboard.waiter.tablesServed')}
          value={analytics.tablesServed}
          icon={Users}
          gradient="green"
        />
        <KPIStatCard
          label={t('dashboard.waiter.avgServiceTime')}
          value={`${analytics.avgServiceTime} ${t('dashboard.kitchen.minutes')}`}
          icon={Clock}
          gradient={analytics.avgServiceTime > 5 ? 'orange' : 'green'}
        />
        <KPIStatCard
          label={t('dashboard.waiter.ordersDelivered')}
          value={analytics.ordersDelivered}
          icon={Package}
          gradient="green"
        />
        <KPIStatCard
          label={t('dashboard.waiter.activeTables')}
          value={analytics.activeTables}
          icon={Activity}
          gradient="blue"
        />
      </div>

      {/* Current Load */}
      <AppCard className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="h-6 w-6 text-green-400" />
          <h2 className="text-xl font-bold text-white">{t('service.currentServiceLoad')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[#0f0f0f] rounded-xl border border-gray-800">
            <p className="text-sm text-gray-400 mb-1">{t('service.readyOrders')}</p>
            <p className="text-3xl font-bold text-white">{analytics.currentLoad.readyOrders}</p>
            <p className="text-xs text-gray-400 mt-1">{t('service.waitingForDelivery')}</p>
          </div>
          <div className="p-4 bg-[#0f0f0f] rounded-xl border border-gray-800">
            <p className="text-sm text-gray-400 mb-1">{t('service.tablesWaiting')}</p>
            <p className="text-3xl font-bold text-white">{analytics.currentLoad.tablesWaiting}</p>
            <p className="text-xs text-gray-400 mt-1">{t('service.needService')}</p>
          </div>
        </div>
      </AppCard>

      {/* Ready Orders by Table */}
      <SectionHeader 
        title={t('dashboard.waiter.readyOrders')} 
        subtitle={t('dashboard.waiter.readyOrdersSubtitle')}
        icon={Package}
        action={
          <Link href="/app/dashboard/orders">
            <GradientButton variant="outline" size="sm">
              {t('service.viewAllOrders')}
            </GradientButton>
          </Link>
        }
      />
      {Object.keys(ordersByTable).length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(ordersByTable).map(([tableNumber, tableOrders]) => {
            const totalAmount = tableOrders.reduce((sum, o) => sum + o.total, 0)
            return (
              <AppCard 
                key={tableNumber}
                className="border-green-500/30 bg-gradient-to-br from-green-500/5 to-emerald-500/5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{t('service.table')} {tableNumber}</h3>
                    <StatusBadge variant="info" size="sm">
                      {tableOrders.length} {tableOrders.length > 1 ? t('service.orders') : t('service.order')}
                    </StatusBadge>
                  </div>
                  <StatusBadge variant="ready">{t('service.ready')}</StatusBadge>
                </div>
                <div className="space-y-2 mb-3">
                  {tableOrders.map((order) => (
                    <div key={order.id} className="p-2 bg-[#0f0f0f] rounded-lg border border-gray-800">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">{t('service.orderNumber')}{order.id.slice(-4)}</span>
                        <span className="text-sm font-bold text-white">{safeFormatCurrency(order.total, currency)}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {order.items.length} {t('service.items')}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-800 mb-3">
                  <span className="text-sm text-gray-400">{t('service.total')}</span>
                  <span className="text-xl font-bold text-green-400">{safeFormatCurrency(totalAmount, currency)}</span>
                </div>
                <GradientButton variant="green" fullWidth>
                  <CheckCircle className="h-4 w-4" />
                  {t('service.markAsServed')}
                </GradientButton>
              </AppCard>
            )
          })}
        </div>
      ) : (
        <AppCard className="border-gray-800 bg-[#0f0f0f]">
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
            <p className="text-gray-400">{t('service.noOrdersReadyForService')}</p>
            <p className="text-sm text-gray-500 mt-1">{t('service.allClear')}</p>
          </div>
        </AppCard>
      )}

      {/* Performance Summary */}
      <AppCard className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-indigo-500/5">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="h-6 w-6 text-blue-400" />
          <h2 className="text-xl font-bold text-white">{t('service.todayPerformance')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[#0f0f0f] rounded-xl border border-gray-800">
            <p className="text-sm text-gray-400 mb-1">{t('service.ordersServed')}</p>
            <p className="text-2xl font-bold text-white">{analytics.performance.ordersToday}</p>
            <p className="text-xs text-gray-400 mt-1">{t('service.today')}</p>
          </div>
          <div className="p-4 bg-[#0f0f0f] rounded-xl border border-gray-800">
            <p className="text-sm text-gray-400 mb-1">{t('service.avgTimePerOrder')}</p>
            <p className="text-2xl font-bold text-white">{analytics.performance.avgTimePerOrder} min</p>
            <p className="text-xs text-gray-400 mt-1">
              {analytics.performance.avgTimePerOrder <= 3 ? t('service.excellent') : t('service.good')}
            </p>
          </div>
          <div className="p-4 bg-[#0f0f0f] rounded-xl border border-gray-800">
            <p className="text-sm text-gray-400 mb-1">{t('service.tablesServed')}</p>
            <p className="text-2xl font-bold text-white">{analytics.tablesServed}</p>
            <p className="text-xs text-gray-400 mt-1">{t('service.uniqueTables')}</p>
          </div>
        </div>
      </AppCard>

      {/* Active Tables Overview */}
      {activeTables.length > 0 && (
        <SectionHeader 
          title={t('dashboard.waiter.activeTablesTitle')} 
          subtitle={t('dashboard.waiter.activeTablesSubtitle')}
          icon={Users}
        />
      )}
      {activeTables.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {activeTables.map((table) => {
            const tableOrders = orders.filter(o => o.tableNumber === table.number && o.status !== 'served')
            return (
              <AppCard 
                key={table.id}
                className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 text-center p-4 hover:scale-105 transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-2">
                  <span className="text-xl font-bold text-blue-400">{table.number}</span>
                </div>
                <p className="text-sm font-semibold text-white">{t('service.table')} {table.number}</p>
                {tableOrders.length > 0 && (
                  <div className="mt-2">
                    <StatusBadge variant="info" size="sm">
                      {tableOrders.length} {t('service.active')}
                    </StatusBadge>
                  </div>
                )}
              </AppCard>
            )
          })}
        </div>
      )}
    </div>
  )
}

