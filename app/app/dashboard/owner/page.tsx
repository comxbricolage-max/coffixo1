'use client'

// 🧪 DEMO MODE – NO DATABASE
// Owner Dashboard - Business Intelligence & Financial Overview
// TODO: Replace with real database queries when MongoDB is connected

import { useState, useEffect } from 'react'
import AppCard from '@/components/ui/AppCard'
import KPIStatCard from '@/components/ui/KPIStatCard'
import StatusBadge from '@/components/ui/StatusBadge'
import SectionHeader from '@/components/ui/SectionHeader'
import { useTranslation } from '@/hooks/useTranslation'
import { safeFormatCurrency } from '@/lib/safe-currency'
import { useCurrency } from '@/hooks/useCurrency'
import { getSafeCurrency } from '@/lib/safe-currency'
import { getOwnerAnalytics } from '@/lib/analytics'
import { 
  mockOrders,
  getOrdersByStatus,
  mockTables,
} from '@/lib/mock-data'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  ChefHat,
  Package,
  Users,
  Clock,
  BarChart3,
  Activity,
} from 'lucide-react'
import Link from 'next/link'

export default function OwnerDashboardPage() {
  let t: (key: string, params?: Record<string, string | number>) => string
  try {
    const translation = useTranslation()
    t = translation.t
  } catch {
    t = (key: string, params?: Record<string, string | number>) => {
      if (params) {
        return Object.entries(params).reduce((str, [k, v]) => str.replace(`{${k}}`, String(v)), key)
      }
      return key
    }
  }
  // Safe currency access with fallback
  let currency = 'USD'
  try {
    const currencyHook = useCurrency()
    currency = getSafeCurrency(currencyHook?.currency) || 'USD'
  } catch {
    currency = 'USD'
  }

  const [analytics, setAnalytics] = useState(getOwnerAnalytics())
  const activeTables = mockTables.filter(t => t.status === 'occupied').length
  const displayName = 'Demo Restaurant'

  useEffect(() => {
    const interval = setInterval(() => {
      setAnalytics(getOwnerAnalytics())
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1a1a] via-[#252525] to-[#1a1a1a] border border-gray-800/50 p-8 md:p-12">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-amber-500/5 to-transparent" />
        <div className="relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 flex items-center justify-center shadow-lg shadow-orange-500/10">
              <ChefHat className="h-8 w-8 text-orange-400" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {t('dashboard.overview.title')}
              </h1>
              <p className="text-lg text-gray-400">
                {t('dashboard.overview.subtitle', { name: displayName })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial KPIs */}
      <SectionHeader 
        title={t('dashboard.owner.financialPerformance')} 
        subtitle={t('dashboard.owner.financialPerformanceSubtitle')}
        icon={DollarSign}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPIStatCard
          label={t('dashboard.overview.todayRevenue')}
          value={safeFormatCurrency(analytics.todayRevenue, currency)}
          icon={DollarSign}
          trend={{ value: analytics.revenueTrend === 'up' ? '+12%' : analytics.revenueTrend === 'down' ? '-5%' : '0%', positive: analytics.revenueTrend === 'up' }}
          gradient="orange"
        />
        <KPIStatCard
          label={t('dashboard.overview.todayCost')}
          value={safeFormatCurrency(analytics.todayCost, currency)}
          icon={TrendingDown}
          gradient="red"
        />
        <KPIStatCard
          label={t('dashboard.overview.grossProfit')}
          value={safeFormatCurrency(analytics.todayGrossProfit, currency)}
          icon={TrendingUp}
          trend={{ value: `${analytics.grossMargin.toFixed(1)}%`, positive: analytics.grossMargin > 30 }}
          gradient="green"
        />
        <KPIStatCard
          label={t('dashboard.overview.grossMargin')}
          value={`${analytics.grossMargin.toFixed(1)}%`}
          icon={BarChart3}
          gradient={analytics.grossMargin > 50 ? 'green' : analytics.grossMargin > 30 ? 'amber' : 'red'}
        />
      </div>

      {/* Product Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Products */}
        <AppCard className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="h-6 w-6 text-green-400" />
            <h2 className="text-xl font-bold text-white">{t('dashboard.owner.bestProducts')}</h2>
          </div>
          <div className="space-y-3">
            {analytics.bestProducts.map((product, index) => (
              <div 
                key={product.productId}
                className="flex items-center justify-between p-4 bg-[#0f0f0f] rounded-xl border border-gray-800"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-bold text-white">{product.name}</p>
                    <p className="text-xs text-gray-400">{product.sales} {t('dashboard.owner.sales')}</p>
                    {product.costConfidence < 80 && (
                      <p className="text-xs text-amber-400 mt-1">
                        ⚠️ {t('dashboard.owner.costConfidence')}: {product.costConfidence}%
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-end">
                  <p className="font-bold text-green-400">{safeFormatCurrency(product.profit, currency)}</p>
                  <p className="text-xs text-gray-400">{product.margin.toFixed(1)}% {t('dashboard.owner.margin')}</p>
                </div>
              </div>
            ))}
          </div>
        </AppCard>

        {/* Worst Products */}
        <AppCard className="border-red-500/20 bg-gradient-to-br from-red-500/5 to-orange-500/5">
          <div className="flex items-center gap-3 mb-6">
            <TrendingDown className="h-6 w-6 text-red-400" />
            <h2 className="text-xl font-bold text-white">{t('dashboard.owner.worstProducts')}</h2>
          </div>
          <div className="space-y-3">
            {analytics.worstProducts.map((product, index) => (
              <div 
                key={product.productId}
                className="flex items-center justify-between p-4 bg-[#0f0f0f] rounded-xl border border-gray-800"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-bold text-white">{product.name}</p>
                    <p className="text-xs text-gray-400">{product.sales} {t('dashboard.owner.sales')}</p>
                    {product.costConfidence < 80 && (
                      <p className="text-xs text-amber-400 mt-1">
                        ⚠️ {t('dashboard.owner.costConfidence')}: {product.costConfidence}%
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-end">
                  <p className="font-bold text-red-400">{safeFormatCurrency(product.profit, currency)}</p>
                  <p className="text-xs text-gray-400">{product.margin.toFixed(1)}% {t('dashboard.owner.margin')}</p>
                </div>
              </div>
            ))}
          </div>
        </AppCard>
      </div>

      {/* Inventory & Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Status */}
        <AppCard className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
          <div className="flex items-center gap-3 mb-6">
            <Package className="h-6 w-6 text-amber-400" />
            <h2 className="text-xl font-bold text-white">{t('dashboard.inventory.title')}</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#0f0f0f] rounded-xl border border-gray-800">
            <div>
              <p className="text-sm text-gray-400 mb-1">{t('dashboard.inventory.totalValuation')}</p>
              <p className="text-2xl font-bold text-white">{safeFormatCurrency(analytics.inventoryValue, currency)}</p>
            </div>
            <Package className="h-8 w-8 text-amber-400" />
          </div>
            {analytics.lowStockCount > 0 && (
              <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <div>
                  <p className="text-sm text-red-400 mb-1">{t('dashboard.inventory.lowStockAlerts')}</p>
                  <p className="text-xl font-bold text-red-400">{analytics.lowStockCount} {t('common.items', { count: analytics.lowStockCount })}</p>
                </div>
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>
            )}
            {analytics.wasteEstimate > 0 && (
              <div className="flex items-center justify-between p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                <div>
                  <p className="text-sm text-orange-400 mb-1">{t('dashboard.owner.wasteRisk')}</p>
                  <p className="text-xl font-bold text-orange-400">{safeFormatCurrency(analytics.wasteEstimate, currency)}</p>
                  <p className="text-xs text-gray-400 mt-1">{t('dashboard.owner.itemsExpiringSoon')}</p>
                </div>
                <AlertTriangle className="h-6 w-6 text-orange-400" />
              </div>
            )}
          </div>
        </AppCard>

        {/* Staff Performance Summary */}
        <AppCard className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-indigo-500/5">
          <div className="flex items-center gap-3 mb-6">
            <Users className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">{t('dashboard.performance.title')}</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-[#0f0f0f] rounded-xl border border-gray-800">
              <span className="text-sm text-gray-400">{t('dashboard.staff.onShift')}</span>
              <span className="font-bold text-white">{analytics.staffSummary.onShift} / {analytics.staffSummary.totalStaff}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#0f0f0f] rounded-xl border border-gray-800">
              <span className="text-sm text-gray-400">{t('dashboard.performance.avgPrepTime')}</span>
              <span className="font-bold text-white">{analytics.staffSummary.avgPrepTime} {t('common.min')}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#0f0f0f] rounded-xl border border-gray-800">
              <span className="text-sm text-gray-400">{t('dashboard.performance.avgServiceTime')}</span>
              <span className="font-bold text-white">{analytics.staffSummary.avgServiceTime} {t('common.min')}</span>
            </div>
            {analytics.staffSummary.delayedOrders > 0 && (
              <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                <span className="text-sm text-red-400">{t('dashboard.performance.delayedOrders')}</span>
                <span className="font-bold text-red-400">{analytics.staffSummary.delayedOrders}</span>
              </div>
            )}
          </div>
        </AppCard>
      </div>

      {/* Order Bottlenecks */}
      <AppCard className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-amber-500/5">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="h-6 w-6 text-orange-400" />
          <h2 className="text-xl font-bold text-white">{t('dashboard.analytics.bottleneckDetection')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-xl border-2 ${
            analytics.orderBottlenecks.kitchenLoad > 5
              ? 'bg-red-500/10 border-red-500/30'
              : 'bg-[#0f0f0f] border-gray-800'
          }`}>
            <p className="text-sm text-gray-400 mb-2">{t('dashboard.analytics.kitchenLoad')}</p>
            <p className="text-3xl font-bold text-white">{analytics.orderBottlenecks.kitchenLoad}</p>
            <p className="text-xs text-gray-400 mt-1">{t('dashboard.owner.ordersInProgress')}</p>
            {analytics.orderBottlenecks.kitchenLoad > 5 && (
              <div className="mt-2"><StatusBadge variant="error" size="sm">{t('dashboard.analytics.overloaded')}</StatusBadge></div>
            )}
          </div>
          <div className={`p-4 rounded-xl border-2 ${
            analytics.orderBottlenecks.readyOrdersWaiting > 3
              ? 'bg-orange-500/10 border-orange-500/30'
              : 'bg-[#0f0f0f] border-gray-800'
          }`}>
            <p className="text-sm text-gray-400 mb-2">{t('dashboard.owner.readyOrdersWaiting')}</p>
            <p className="text-3xl font-bold text-white">{analytics.orderBottlenecks.readyOrdersWaiting}</p>
            <p className="text-xs text-gray-400 mt-1">{t('dashboard.owner.avgWait')} {analytics.orderBottlenecks.avgWaitTime} {t('common.min')}</p>
            {analytics.orderBottlenecks.readyOrdersWaiting > 3 && (
              <div className="mt-2"><StatusBadge variant="warning" size="sm">{t('dashboard.owner.needsAttention')}</StatusBadge></div>
            )}
          </div>
          <div className="p-4 rounded-xl border-2 bg-[#0f0f0f] border-gray-800">
            <p className="text-sm text-gray-400 mb-2">{t('dashboard.overview.activeTables')}</p>
            <p className="text-3xl font-bold text-white">{activeTables}</p>
            <p className="text-xs text-gray-400 mt-1">{t('dashboard.main.ofTotal', { total: mockTables.length })}</p>
          </div>
        </div>
      </AppCard>

      {/* Peak Hours */}
      <AppCard className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="h-6 w-6 text-green-400" />
          <h2 className="text-xl font-bold text-white">{t('dashboard.analytics.peakHours')}</h2>
        </div>
        <div className="space-y-3">
          {analytics.peakHours.slice(0, 6).map((hour) => {
            const maxOrders = Math.max(...analytics.peakHours.map(h => h.orders))
            return (
              <div key={hour.hour}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-white">{hour.hour}</span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-white">{hour.orders} {t('dashboard.analytics.orders')}</span>
                    <span className="text-xs text-gray-400 ms-2">{safeFormatCurrency(hour.revenue, currency)}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${(hour.orders / maxOrders) * 100}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </AppCard>

      {/* Intelligence Metrics */}
      <AppCard className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-indigo-500/5">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="h-6 w-6 text-purple-400" />
          <h2 className="text-xl font-bold text-white">{t('dashboard.owner.intelligenceMetrics')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-[#0f0f0f] rounded-xl border border-gray-800">
            <p className="text-sm text-gray-400 mb-1">{t('dashboard.owner.costAccuracy')}</p>
            <p className="text-3xl font-bold text-white">{analytics.intelligenceMetrics.avgCostConfidence}%</p>
            <p className="text-xs text-gray-400 mt-1">
              {analytics.intelligenceMetrics.avgCostConfidence >= 80 
                ? `✓ ${t('dashboard.owner.highConfidence')}` 
                : analytics.intelligenceMetrics.avgCostConfidence >= 60
                ? `⚠️ ${t('dashboard.owner.mediumConfidence')}`
                : `⚠️ ${t('dashboard.owner.lowConfidence')}`}
            </p>
          </div>
          <div className="p-4 bg-[#0f0f0f] rounded-xl border border-gray-800">
            <p className="text-sm text-gray-400 mb-1">{t('dashboard.owner.mostWasteful')}</p>
            <p className="text-3xl font-bold text-white">{analytics.intelligenceMetrics.mostWastefulProducts.length}</p>
            <p className="text-xs text-gray-400 mt-1">{t('dashboard.owner.needOptimization')}</p>
          </div>
          <div className="p-4 bg-[#0f0f0f] rounded-xl border border-gray-800">
            <p className="text-sm text-gray-400 mb-1">{t('dashboard.owner.ingredientEfficiency')}</p>
            <p className="text-3xl font-bold text-white">
              {analytics.intelligenceMetrics.ingredientEfficiency.length > 0
                ? Math.round(
                    analytics.intelligenceMetrics.ingredientEfficiency.reduce((sum, i) => sum + i.efficiencyScore, 0) /
                    analytics.intelligenceMetrics.ingredientEfficiency.length
                  )
                : 0}%
            </p>
            <p className="text-xs text-gray-400 mt-1">{t('dashboard.owner.avgEfficiencyScore')}</p>
          </div>
        </div>
        
        {/* Most Wasteful Products */}
        {analytics.intelligenceMetrics.mostWastefulProducts.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">{t('dashboard.owner.mostWasteful')}</h3>
            <div className="space-y-2">
              {analytics.intelligenceMetrics.mostWastefulProducts.map((product) => (
                <div key={product.productId} className="flex items-center justify-between p-3 bg-[#0f0f0f] rounded-lg border border-gray-800">
                  <div>
                    <p className="text-sm font-semibold text-white">{product.name}</p>
                    <p className="text-xs text-gray-400">{t('dashboard.owner.efficiency')}: {product.efficiencyScore}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-400">{product.wastePercentage}% {t('dashboard.owner.waste')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </AppCard>

      {/* Quick Actions */}
      <SectionHeader 
        title={t('dashboard.owner.quickActions')} 
        subtitle={t('dashboard.owner.quickActionsSubtitle')}
        icon={Activity}
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/app/dashboard/orders">
          <AppCard className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-amber-500/5 hover:scale-105 transition-all cursor-pointer text-center p-6">
            <Activity className="h-8 w-8 text-orange-400 mx-auto mb-2" />
            <p className="font-bold text-white">{t('dashboard.owner.viewOrders')}</p>
          </AppCard>
        </Link>
        <Link href="/app/dashboard/inventory/analytics">
          <AppCard className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5 hover:scale-105 transition-all cursor-pointer text-center p-6">
            <Package className="h-8 w-8 text-amber-400 mx-auto mb-2" />
            <p className="font-bold text-white">{t('dashboard.inventory.analytics')}</p>
          </AppCard>
        </Link>
        <Link href="/app/dashboard/performance">
          <AppCard className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5 hover:scale-105 transition-all cursor-pointer text-center p-6">
            <Users className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <p className="font-bold text-white">{t('dashboard.performance.title')}</p>
          </AppCard>
        </Link>
        <Link href="/app/dashboard/analytics">
          <AppCard className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 hover:scale-105 transition-all cursor-pointer text-center p-6">
            <BarChart3 className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <p className="font-bold text-white">{t('dashboard.owner.fullAnalytics')}</p>
          </AppCard>
        </Link>
      </div>
    </div>
  )
}
