'use client'

// 🧪 DEMO MODE – NO DATABASE
// Kitchen Dashboard - Operations-focused view
// TODO: Replace with real database queries when MongoDB is connected

import { useState, useEffect } from 'react'
import AppCard from '@/components/ui/AppCard'
import KPIStatCard from '@/components/ui/KPIStatCard'
import StatusBadge from '@/components/ui/StatusBadge'
import SectionHeader from '@/components/ui/SectionHeader'
import GradientButton from '@/components/ui/GradientButton'
import { getKitchenAnalytics } from '@/lib/analytics'
import { getKitchenPerformanceMetrics } from '@/lib/advanced-analytics'
import { mockOrders, type Order } from '@/lib/mock-data'
import { 
  ChefHat, 
  Clock, 
  AlertTriangle, 
  Package, 
  Activity,
  CheckCircle,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import { safeFormatCurrency } from '@/lib/safe-currency'
import { useCurrency } from '@/hooks/useCurrency'
import { getSafeCurrency } from '@/lib/safe-currency'

export default function KitchenDashboardPage() {
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
  const [analytics, setAnalytics] = useState(getKitchenAnalytics())
  const [kitchenMetrics, setKitchenMetrics] = useState(getKitchenPerformanceMetrics())

  // Refresh analytics every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setAnalytics(getKitchenAnalytics())
      setKitchenMetrics(getKitchenPerformanceMetrics())
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const preparingOrders = orders.filter(o => o.status === 'preparing')
  const readyOrders = orders.filter(o => o.status === 'ready')

  const getTimeElapsed = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000)
    if (minutes < 1) return t('dashboard.kitchen.justNow')
    if (minutes < 60) return `${minutes}${t('dashboard.kitchen.minutes')}`
    return `${Math.floor(minutes / 60)}${t('dashboard.kitchen.hours')} ${minutes % 60}${t('dashboard.kitchen.minutes')}`
  }

  const getUrgencyColor = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000)
    if (minutes > 20) return 'text-red-400 font-semibold'
    if (minutes > 15) return 'text-orange-400'
    return 'text-gray-400'
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1a1a] via-[#252525] to-[#1a1a1a] border border-gray-800/50 p-8 md:p-12">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-orange-500/5 to-transparent" />
        <div className="relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 flex items-center justify-center shadow-lg shadow-red-500/10">
              <ChefHat className="h-8 w-8 text-red-400" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {t('dashboard.kitchen.title')}
              </h1>
              <p className="text-lg text-gray-400">
                {t('dashboard.kitchen.subtitle')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPIStatCard
          label={t('dashboard.kitchen.ordersInProgress')}
          value={analytics.ordersInProgress}
          icon={ChefHat}
          gradient="orange"
        />
        <KPIStatCard
          label={t('dashboard.kitchen.avgPrepTime')}
          value={`${analytics.avgPrepTime} ${t('dashboard.kitchen.minutes')}`}
          icon={Clock}
          gradient={analytics.avgPrepTime > 15 ? 'red' : 'green'}
        />
        <KPIStatCard
          label={t('dashboard.kitchen.delayedOrders')}
          value={analytics.delayedOrders}
          icon={AlertTriangle}
          gradient="red"
        />
        <KPIStatCard
          label={t('dashboard.kitchen.kitchenLoad')}
          value={`${analytics.kitchenLoad.percentage}%`}
          icon={Activity}
          gradient={analytics.kitchenLoad.percentage > 80 ? 'red' : analytics.kitchenLoad.percentage > 50 ? 'orange' : 'green'}
        />
      </div>

      {/* Kitchen Load Indicator */}
      <AppCard className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-red-500/5">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="h-6 w-6 text-orange-400" />
          <h2 className="text-xl font-bold text-white">Kitchen Load</h2>
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Current Capacity</span>
              <span className="text-sm font-bold text-white">
                {analytics.kitchenLoad.current} / {analytics.kitchenLoad.capacity} orders
              </span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  analytics.kitchenLoad.percentage > 80
                    ? 'bg-gradient-to-r from-red-500 to-orange-500'
                    : analytics.kitchenLoad.percentage > 50
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500'
                }`}
                style={{ width: `${analytics.kitchenLoad.percentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {analytics.kitchenLoad.percentage > 80 
                ? '⚠️ High load - Consider adding staff' 
                : analytics.kitchenLoad.percentage > 50
                ? '⚡ Moderate load'
                : '✓ Operating smoothly'}
            </p>
          </div>
        </div>
      </AppCard>

      {/* Orders In Progress */}
      <SectionHeader 
        title={t('dashboard.kitchen.ordersInProgress')} 
        subtitle={t('dashboard.kitchen.ordersInProgressSubtitle')}
        icon={ChefHat}
        action={
          <Link href="/app/dashboard/orders">
            <GradientButton variant="outline" size="sm">
              View All Orders
            </GradientButton>
          </Link>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {preparingOrders.length > 0 ? (
          preparingOrders.map((order) => (
            <AppCard 
              key={order.id}
              className="border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-red-500/5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Table {order.tableNumber}</h3>
                  <div className="flex items-center gap-2">
                    <Clock className={`h-4 w-4 ${getUrgencyColor(order.createdAt)}`} />
                    <span className={`text-sm ${getUrgencyColor(order.createdAt)}`}>
                      {getTimeElapsed(order.createdAt)} elapsed
                    </span>
                  </div>
                </div>
                <StatusBadge variant="preparing">Preparing</StatusBadge>
              </div>
              <div className="space-y-2 mb-3">
                {order.items.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm p-2 bg-[#0f0f0f] rounded-lg">
                    <span className="text-gray-300">
                      {item.quantity}x {item.productName}
                    </span>
                    <span className="text-gray-400">{safeFormatCurrency(item.price * item.quantity, currency)}</span>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <p className="text-xs text-gray-400 text-center">
                    +{order.items.length - 3} more items
                  </p>
                )}
              </div>
              {order.notes && (
                <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-300">
                  <strong>Note:</strong> {order.notes}
                </div>
              )}
            </AppCard>
          ))
        ) : (
          <AppCard className="border-gray-800 bg-[#0f0f0f]">
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
              <p className="text-gray-400">No orders in progress</p>
              <p className="text-sm text-gray-500 mt-1">All clear!</p>
            </div>
          </AppCard>
        )}
      </div>

      {/* Stock Impact & Alerts */}
      {(analytics.stockImpact.lowStockItems > 0 || analytics.wasteAlert > 0) && (
        <AppCard className="border-red-500/20 bg-gradient-to-br from-red-500/5 to-orange-500/5">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="h-6 w-6 text-red-400" />
            <h2 className="text-xl font-bold text-white">Stock Alerts</h2>
          </div>
          <div className="space-y-3">
            {analytics.stockImpact.lowStockItems > 0 && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-sm text-red-400 mb-2">
                  {analytics.stockImpact.lowStockItems} ingredients running low
                </p>
                {analytics.stockImpact.criticalItems.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {analytics.stockImpact.criticalItems.map((item, idx) => (
                      <StatusBadge key={idx} variant="error" size="sm">{item}</StatusBadge>
                    ))}
                  </div>
                )}
              </div>
            )}
            {analytics.wasteAlert > 0 && (
              <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                <p className="text-sm text-orange-400">
                  ⚠️ {analytics.wasteAlert} items expiring within 3 days
                </p>
              </div>
            )}
          </div>
        </AppCard>
      )}

      {/* Performance Summary */}
      <AppCard className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="h-6 w-6 text-green-400" />
          <h2 className="text-xl font-bold text-white">Today&apos;s Performance</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[#0f0f0f] rounded-xl border border-gray-800">
            <p className="text-sm text-gray-400 mb-1">Avg Prep Time</p>
            <p className="text-2xl font-bold text-white">{analytics.avgPrepTime} min</p>
            <p className="text-xs text-gray-400 mt-1">
              {analytics.avgPrepTime <= 12 ? '✓ On target' : '⚠️ Above target'}
            </p>
          </div>
          <div className="p-4 bg-[#0f0f0f] rounded-xl border border-gray-800">
            <p className="text-sm text-gray-400 mb-1">Orders Per Hour</p>
            <p className="text-2xl font-bold text-white">{kitchenMetrics.ordersPerHour.toFixed(1)}</p>
            <p className="text-xs text-gray-400 mt-1">Production rate</p>
          </div>
          <div className="p-4 bg-[#0f0f0f] rounded-xl border border-gray-800">
            <p className="text-sm text-gray-400 mb-1">Avg Prep Per Item</p>
            <p className="text-2xl font-bold text-white">{kitchenMetrics.avgPrepTimePerItem.toFixed(1)} min</p>
            <p className="text-xs text-gray-400 mt-1">Per item average</p>
          </div>
        </div>
      </AppCard>

      {/* Rush Hour Performance */}
      {kitchenMetrics.rushHourPerformance.length > 0 && (
        <AppCard className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-amber-500/5">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="h-6 w-6 text-orange-400" />
            <h2 className="text-xl font-bold text-white">Rush Hour Performance</h2>
          </div>
          <div className="space-y-3">
            {kitchenMetrics.rushHourPerformance.map((period) => (
              <div key={period.hour} className="p-4 bg-[#0f0f0f] rounded-xl border border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-white">{period.hourLabel}</p>
                    <p className="text-sm text-gray-400">{period.orders} orders</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-orange-400">{period.avgPrepTime} min</p>
                    <p className="text-xs text-gray-400">avg prep time</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className={`h-full rounded-full ${
                          period.efficiency >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                          period.efficiency >= 60 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                          'bg-gradient-to-r from-red-500 to-orange-500'
                        }`}
                        style={{ width: `${period.efficiency}%` }}
                      />
                    </div>
                  </div>
                  <StatusBadge 
                    variant={period.efficiency >= 80 ? 'success' : period.efficiency >= 60 ? 'warning' : 'error'} 
                    size="sm"
                  >
                    {period.efficiency}% efficient
                  </StatusBadge>
                </div>
              </div>
            ))}
          </div>
        </AppCard>
      )}

      {/* Slow Items Detection */}
      {kitchenMetrics.slowItems.length > 0 && (
        <AppCard className="border-red-500/20 bg-gradient-to-br from-red-500/5 to-orange-500/5">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="h-6 w-6 text-red-400" />
            <h2 className="text-xl font-bold text-white">{t('dashboard.kitchen.slowKitchenItems')}</h2>
            <StatusBadge variant="error" size="sm">{kitchenMetrics.slowItems.length} {t('dashboard.analytics.items')}</StatusBadge>
          </div>
          <div className="space-y-3">
            {kitchenMetrics.slowItems.map((item) => (
              <div key={item.productId} className="p-4 bg-[#0f0f0f] rounded-xl border border-red-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">{item.productName}</p>
                    <p className="text-sm text-gray-400">{item.orderCount} orders</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-400">{item.avgPrepTime} min</p>
                    <p className="text-xs text-gray-400">avg prep time</p>
                  </div>
                </div>
                <p className="text-xs text-red-400 mt-2">
                  ⚠️ This item takes longer than the 20-minute threshold
                </p>
              </div>
            ))}
          </div>
        </AppCard>
      )}
    </div>
  )
}

