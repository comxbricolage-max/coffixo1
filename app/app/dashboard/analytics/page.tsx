'use client'

// 🧪 DEMO MODE – NO DATABASE
// Advanced Restaurant Analytics & Performance Intelligence
// TODO: Replace with real database queries when MongoDB is connected

import AppCard from '@/components/ui/AppCard'
import StatusBadge from '@/components/ui/StatusBadge'
import SectionHeader from '@/components/ui/SectionHeader'
import KPIStatCard from '@/components/ui/KPIStatCard'
import { mockAnalytics } from '@/lib/mock-data'
import {
  calculateRevenueGrowth,
  calculateOrderLifecycleMetrics,
  detectBottlenecks,
  analyzePeakHours,
  calculateTableTurnover,
  getKitchenPerformanceMetrics,
  getServiceFlowMetrics,
} from '@/lib/advanced-analytics'
import { TrendingUp, DollarSign, ShoppingCart, Clock, BarChart3, AlertTriangle, ChefHat, Users, Activity, Zap, Target } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { safeFormatCurrency } from '@/lib/safe-currency'
import { useCurrency } from '@/hooks/useCurrency'
import { getSafeCurrency } from '@/lib/safe-currency'

export default function AnalyticsPage() {
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

  // Safe array operations with fallbacks
  const safePeakHours = mockAnalytics?.peakHours || []
  const safeSalesByDay = mockAnalytics?.salesByDay || []
  const maxOrders = safePeakHours.length > 0 ? Math.max(...safePeakHours.map(h => h.orders || 0)) : 0
  const maxRevenue = safeSalesByDay.length > 0 ? Math.max(...safeSalesByDay.map(d => d.revenue || 0)) : 0
  
  // Advanced Analytics with safe error handling
  let revenueGrowth, lifecycleMetrics, bottlenecks, peakHours, tableTurnover, kitchenMetrics, serviceFlow
  try {
    revenueGrowth = calculateRevenueGrowth()
    lifecycleMetrics = calculateOrderLifecycleMetrics()
    bottlenecks = detectBottlenecks()
    peakHours = analyzePeakHours()
    tableTurnover = calculateTableTurnover()
    kitchenMetrics = getKitchenPerformanceMetrics()
    serviceFlow = getServiceFlowMetrics()
  } catch {
    // Safe fallbacks - use empty/default values
    revenueGrowth = { growth: 0, trend: 'stable' as const, monthGrowth: 0, dayGrowth: 0, today: 0, yesterday: 0, thisWeek: 0, lastWeek: 0, thisMonth: 0, lastMonth: 0, weekGrowth: 0 }
    lifecycleMetrics = { 
      avgPreparationTime: 0, 
      avgServiceTime: 0, 
      avgTotalDuration: 0,
      preparationTimeDistribution: { fast: 0, normal: 0, slow: 0 },
      serviceTimeDistribution: { fast: 0, normal: 0, slow: 0 }
    }
    bottlenecks = { 
      kitchenOverload: { detected: false, currentLoad: 0, capacity: 0, overloadPeriods: [] }, 
      slowServiceAlerts: [], 
      slowPrepAlerts: [] 
    }
    peakHours = { peakHours: [], deadHours: [], busiestHour: null, quietestHour: null }
    tableTurnover = { avgTurnoverTime: 0, todayTurnover: 0, weeklyAvgTurnover: 0, efficiencyScore: 0 }
    kitchenMetrics = { ordersPerHour: 0, avgPrepTimePerItem: 0, kitchenLoadIndicator: 'low' as const, slowItems: [] }
    serviceFlow = { 
      avgServiceTime: 0, 
      efficiency: 0, 
      pendingTooLong: [],
      tableWaitingTime: { avg: 0, max: 0, tablesWaiting: 0 },
      serviceSpeedRanking: []
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <SectionHeader 
        title={t('dashboard.analytics.title')} 
        subtitle={t('dashboard.analytics.subtitle')}
        icon={BarChart3}
      />

      {/* Revenue Growth Overview */}
      <SectionHeader 
        title={t('dashboard.analytics.revenueGrowth')} 
        subtitle={t('dashboard.analytics.revenueGrowthSubtitle')}
        icon={TrendingUp}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPIStatCard
          label={t('dashboard.analytics.todayRevenue')}
          value={safeFormatCurrency(revenueGrowth?.today || 0, currency)}
          icon={DollarSign}
          trend={{ 
            value: `${(revenueGrowth?.dayGrowth || 0) > 0 ? '+' : ''}${(revenueGrowth?.dayGrowth || 0).toFixed(1)}%`, 
            positive: (revenueGrowth?.dayGrowth || 0) > 0 
          }}
          gradient="orange"
        />
        <KPIStatCard
          label={t('dashboard.analytics.weekGrowth')}
          value={`${(revenueGrowth?.weekGrowth || 0) > 0 ? '+' : ''}${(revenueGrowth?.weekGrowth || 0).toFixed(1)}%`}
          icon={TrendingUp}
          trend={{ 
            value: safeFormatCurrency(revenueGrowth?.thisWeek || 0, currency), 
            positive: (revenueGrowth?.weekGrowth || 0) > 0 
          }}
          gradient={(revenueGrowth?.weekGrowth || 0) > 0 ? 'green' : 'red'}
        />
        <KPIStatCard
          label={t('dashboard.analytics.monthGrowth')}
          value={`${(revenueGrowth?.monthGrowth || 0) > 0 ? '+' : ''}${(revenueGrowth?.monthGrowth || 0).toFixed(1)}%`}
          icon={BarChart3}
          trend={{ 
            value: safeFormatCurrency(revenueGrowth?.thisMonth || 0, currency), 
            positive: (revenueGrowth?.monthGrowth || 0) > 0 
          }}
          gradient={(revenueGrowth?.monthGrowth || 0) > 0 ? 'green' : 'red'}
        />
        <KPIStatCard
          label={t('dashboard.analytics.trend')}
          value={revenueGrowth?.trend === 'up' ? t('dashboard.analytics.growing') : revenueGrowth?.trend === 'down' ? t('dashboard.analytics.declining') : t('dashboard.analytics.stable')}
          icon={Activity}
          gradient={revenueGrowth?.trend === 'up' ? 'green' : revenueGrowth?.trend === 'down' ? 'red' : 'amber'}
        />
      </div>

      {/* Order Lifecycle Metrics */}
      <SectionHeader 
        title={t('dashboard.analytics.orderLifecycle')} 
        subtitle={t('dashboard.analytics.orderLifecycleSubtitle')}
        icon={Clock}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPIStatCard
          label={t('dashboard.analytics.avgPreparationTime')}
          value={`${lifecycleMetrics.avgPreparationTime.toFixed(1)} min`}
          icon={ChefHat}
          gradient="orange"
        />
        <KPIStatCard
          label={t('dashboard.analytics.avgServiceTime')}
          value={`${(lifecycleMetrics?.avgServiceTime || 0).toFixed(1)} min`}
          icon={Users}
          gradient="green"
        />
        <KPIStatCard
          label={t('dashboard.analytics.avgTotalDuration')}
          value={`${(lifecycleMetrics?.avgTotalDuration || 0).toFixed(1)} min`}
          icon={Activity}
          gradient="amber"
        />
      </div>

      {/* Lifecycle Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AppCard className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-amber-500/5">
          <div className="flex items-center gap-3 mb-6">
            <ChefHat className="h-6 w-6 text-orange-400" />
            <h2 className="text-xl font-bold text-white">Preparation Time Distribution</h2>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white">Fast (&lt; 10 min)</span>
                <span className="text-sm font-bold text-green-400">{lifecycleMetrics?.preparationTimeDistribution?.fast || 0}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full"
                  style={{ width: `${(() => {
                    const fast = lifecycleMetrics?.preparationTimeDistribution?.fast || 0
                    const normal = lifecycleMetrics?.preparationTimeDistribution?.normal || 0
                    const slow = lifecycleMetrics?.preparationTimeDistribution?.slow || 0
                    const total = fast + normal + slow
                    return total > 0 ? (fast / total) * 100 : 0
                  })()}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white">Normal (10-20 min)</span>
                <span className="text-sm font-bold text-amber-400">{lifecycleMetrics?.preparationTimeDistribution?.normal || 0}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full"
                  style={{ width: `${(() => {
                    const fast = lifecycleMetrics?.preparationTimeDistribution?.fast || 0
                    const normal = lifecycleMetrics?.preparationTimeDistribution?.normal || 0
                    const slow = lifecycleMetrics?.preparationTimeDistribution?.slow || 0
                    const total = fast + normal + slow
                    return total > 0 ? (normal / total) * 100 : 0
                  })()}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white">Slow (&gt; 20 min)</span>
                <span className="text-sm font-bold text-red-400">{lifecycleMetrics?.preparationTimeDistribution?.slow || 0}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-red-500 to-orange-500 h-full rounded-full"
                  style={{ width: `${(() => {
                    const fast = lifecycleMetrics?.preparationTimeDistribution?.fast || 0
                    const normal = lifecycleMetrics?.preparationTimeDistribution?.normal || 0
                    const slow = lifecycleMetrics?.preparationTimeDistribution?.slow || 0
                    const total = fast + normal + slow
                    return total > 0 ? (slow / total) * 100 : 0
                  })()}%` }}
                />
              </div>
            </div>
          </div>
        </AppCard>

        <AppCard className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
          <div className="flex items-center gap-3 mb-6">
            <Users className="h-6 w-6 text-green-400" />
            <h2 className="text-xl font-bold text-white">Service Time Distribution</h2>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white">Fast (&lt; 2 min)</span>
                <span className="text-sm font-bold text-green-400">{lifecycleMetrics?.serviceTimeDistribution?.fast || 0}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full"
                  style={{ width: `${(() => {
                    const fast = lifecycleMetrics?.serviceTimeDistribution?.fast || 0
                    const normal = lifecycleMetrics?.serviceTimeDistribution?.normal || 0
                    const slow = lifecycleMetrics?.serviceTimeDistribution?.slow || 0
                    const total = fast + normal + slow
                    return total > 0 ? (fast / total) * 100 : 0
                  })()}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white">Normal (2-5 min)</span>
                <span className="text-sm font-bold text-amber-400">{lifecycleMetrics?.serviceTimeDistribution?.normal || 0}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full"
                  style={{ width: `${(() => {
                    const fast = lifecycleMetrics?.serviceTimeDistribution?.fast || 0
                    const normal = lifecycleMetrics?.serviceTimeDistribution?.normal || 0
                    const slow = lifecycleMetrics?.serviceTimeDistribution?.slow || 0
                    const total = fast + normal + slow
                    return total > 0 ? (normal / total) * 100 : 0
                  })()}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white">Slow (&gt; 5 min)</span>
                <span className="text-sm font-bold text-red-400">{lifecycleMetrics?.serviceTimeDistribution?.slow || 0}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-red-500 to-orange-500 h-full rounded-full"
                  style={{ width: `${(() => {
                    const fast = lifecycleMetrics?.serviceTimeDistribution?.fast || 0
                    const normal = lifecycleMetrics?.serviceTimeDistribution?.normal || 0
                    const slow = lifecycleMetrics?.serviceTimeDistribution?.slow || 0
                    const total = fast + normal + slow
                    return total > 0 ? (slow / total) * 100 : 0
                  })()}%` }}
                />
              </div>
            </div>
          </div>
        </AppCard>
      </div>

      {/* Bottleneck Detection */}
      <SectionHeader 
        title={t('dashboard.analytics.bottleneckDetection')} 
        subtitle={t('dashboard.analytics.bottleneckSubtitle')}
        icon={AlertTriangle}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AppCard className="border-red-500/20 bg-gradient-to-br from-red-500/5 to-orange-500/5">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="h-6 w-6 text-red-400" />
            <h2 className="text-xl font-bold text-white">Kitchen Load</h2>
            {bottlenecks?.kitchenOverload?.detected && (
              <StatusBadge variant="error">Overloaded</StatusBadge>
            )}
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#0f0f0f] rounded-xl border border-gray-800">
              <span className="text-sm font-semibold text-gray-300">Current Load</span>
              <span className="text-2xl font-bold text-white">
                {bottlenecks?.kitchenOverload?.currentLoad || 0} / {bottlenecks?.kitchenOverload?.capacity || 0}
              </span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-4">
              <div
                className={`h-full rounded-full ${
                  bottlenecks?.kitchenOverload?.detected 
                    ? 'bg-gradient-to-r from-red-500 to-orange-500' 
                    : 'bg-gradient-to-r from-green-500 to-emerald-500'
                }`}
                style={{ width: `${(() => {
                  const load = bottlenecks?.kitchenOverload?.currentLoad || 0
                  const capacity = bottlenecks?.kitchenOverload?.capacity || 1
                  return capacity > 0 ? (load / capacity) * 100 : 0
                })()}%` }}
              />
            </div>
            {(bottlenecks?.kitchenOverload?.overloadPeriods?.length || 0) > 0 && (
              <div className="pt-4 border-t border-gray-800">
                <p className="text-xs text-gray-400 mb-2">Overload Periods:</p>
                <div className="space-y-1">
                  {(bottlenecks?.kitchenOverload?.overloadPeriods || []).map((period, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">{period.hour}:00</span>
                      <span className="text-red-400 font-semibold">{period.load} orders</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </AppCard>

        <AppCard className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="h-6 w-6 text-amber-400" />
            <h2 className="text-xl font-bold text-white">Slow Service Alerts</h2>
            {(serviceFlow?.pendingTooLong?.length || 0) > 0 && (
              <StatusBadge variant="warning">{(serviceFlow?.pendingTooLong?.length || 0)} alerts</StatusBadge>
            )}
          </div>
          <div className="space-y-3">
            {(serviceFlow?.pendingTooLong?.length || 0) > 0 ? (
              (serviceFlow?.pendingTooLong || []).slice(0, 5).map((alert) => (
                <div key={alert.orderId} className="p-3 bg-[#0f0f0f] rounded-xl border border-amber-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">Table {alert.tableNumber}</p>
                      <p className="text-xs text-gray-400">{alert.status}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-amber-400">{alert.waitingTime.toFixed(1)} min</p>
                      <p className="text-xs text-gray-400">waiting</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 py-4">No slow service alerts</p>
            )}
          </div>
        </AppCard>
      </div>

      {/* Peak Hours & Dead Hours */}
      <SectionHeader 
        title={t('dashboard.analytics.peakHours')} 
        subtitle={t('dashboard.analytics.peakHoursSubtitle')}
        icon={Clock}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AppCard className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-amber-500/5">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="h-6 w-6 text-orange-400" />
            <h2 className="text-xl font-bold text-white">Peak Hours</h2>
          </div>
          <div className="space-y-3">
            {(peakHours?.peakHours?.length || 0) > 0 ? (
              (peakHours?.peakHours || []).map((hour, idx) => (
                <div key={idx} className="p-4 bg-[#0f0f0f] rounded-xl border border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-white">{hour.hourLabel}</span>
                      {idx === 0 && peakHours?.busiestHour && hour.hour === peakHours.busiestHour.hour && (
                        <StatusBadge variant="success" size="sm">Busiest</StatusBadge>
                      )}
                    </div>
                    <span className="text-lg font-bold text-orange-400">{safeFormatCurrency(hour.revenue, currency)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{hour.orders} orders</span>
                    <span>Avg: {safeFormatCurrency(hour.avgOrderValue, currency)}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full"
                      style={{ width: `${(hour.orders / (peakHours.busiestHour?.orders || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 py-4">No peak hours data</p>
            )}
          </div>
        </AppCard>

        <AppCard className="border-gray-500/20 bg-gradient-to-br from-gray-500/5 to-gray-600/5">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="h-6 w-6 text-gray-400" />
            <h2 className="text-xl font-bold text-white">Dead Hours</h2>
          </div>
          <div className="space-y-3">
            {(peakHours?.deadHours?.length || 0) > 0 ? (
              (peakHours?.deadHours || []).map((hour, idx) => (
                <div key={idx} className="p-4 bg-[#0f0f0f] rounded-xl border border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-white">{hour.hourLabel}</span>
                      {idx === 0 && peakHours?.quietestHour && hour.hour === peakHours.quietestHour.hour && (
                        <StatusBadge variant="info" size="sm">Quietest</StatusBadge>
                      )}
                    </div>
                    <span className="text-lg font-bold text-gray-400">{safeFormatCurrency(hour.revenue, currency)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{hour.orders} orders</span>
                    <span>Low activity</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 py-4">No dead hours data</p>
            )}
          </div>
        </AppCard>
      </div>

      {/* Table Turnover Efficiency */}
      <SectionHeader 
        title={t('dashboard.analytics.tableTurnover')} 
        subtitle={t('dashboard.analytics.tableTurnoverSubtitle')}
        icon={Target}
      />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPIStatCard
          label={t('dashboard.analytics.avgTurnoverTime')}
          value={`${(tableTurnover?.avgTurnoverTime || 0).toFixed(1)} ${t('common.min')}`}
          icon={Clock}
          gradient="orange"
        />
        <KPIStatCard
          label={t('dashboard.analytics.todayTurnover')}
          value={`${tableTurnover?.todayTurnover || 0}x`}
          icon={Activity}
          gradient="amber"
        />
        <KPIStatCard
          label={t('dashboard.analytics.weeklyAvg')}
          value={`${tableTurnover?.weeklyAvgTurnover || 0}x`}
          icon={BarChart3}
          gradient="green"
        />
        <KPIStatCard
          label={t('dashboard.analytics.efficiencyScore')}
          value={`${tableTurnover?.efficiencyScore || 0}%`}
          icon={Target}
          gradient={(tableTurnover?.efficiencyScore || 0) > 70 ? 'green' : (tableTurnover?.efficiencyScore || 0) > 50 ? 'amber' : 'red'}
        />
      </div>

      {/* Kitchen Performance */}
      <SectionHeader 
        title={t('dashboard.analytics.kitchenPerformance')} 
        subtitle={t('dashboard.analytics.kitchenPerformanceSubtitle')}
        icon={ChefHat}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPIStatCard
          label={t('dashboard.analytics.ordersPerHour')}
          value={(kitchenMetrics?.ordersPerHour || 0).toFixed(1)}
          icon={Activity}
          gradient="orange"
        />
        <KPIStatCard
          label={t('dashboard.analytics.avgPrepTimePerItem')}
          value={`${(kitchenMetrics?.avgPrepTimePerItem || 0).toFixed(1)} ${t('common.min')}`}
          icon={Clock}
          gradient="amber"
        />
        <KPIStatCard
          label={t('dashboard.analytics.kitchenLoadIndicator')}
          value={kitchenMetrics?.kitchenLoadIndicator || 'low'}
          icon={ChefHat}
          gradient={kitchenMetrics?.kitchenLoadIndicator === 'high' ? 'red' : kitchenMetrics?.kitchenLoadIndicator === 'medium' ? 'amber' : 'green'}
        />
      </div>

      {(kitchenMetrics?.slowItems?.length || 0) > 0 && (
        <AppCard className="border-red-500/20 bg-gradient-to-br from-red-500/5 to-orange-500/5">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="h-6 w-6 text-red-400" />
            <h2 className="text-xl font-bold text-white">{t('dashboard.analytics.slowKitchenItems')}</h2>
          </div>
          <div className="space-y-3">
            {(kitchenMetrics?.slowItems || []).map((item) => (
              <div key={item.productId} className="p-4 bg-[#0f0f0f] rounded-xl border border-red-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">{item.productName}</p>
                    <p className="text-sm text-gray-400">{item.orderCount} {t('dashboard.analytics.orders')}</p>
                  </div>
                  <div className="text-end">
                    <p className="text-lg font-bold text-red-400">{item.avgPrepTime} {t('common.min')}</p>
                    <p className="text-xs text-gray-400">{t('dashboard.analytics.avgTime')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AppCard>
      )}

      {/* Service Flow Metrics */}
      <SectionHeader 
        title={t('dashboard.analytics.serviceFlow')} 
        subtitle={t('dashboard.analytics.serviceFlowSubtitle')}
        icon={Users}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AppCard className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-indigo-500/5">
          <div className="flex items-center gap-3 mb-6">
            <Users className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">{t('dashboard.analytics.tableWaitingTime')}</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#0f0f0f] rounded-xl border border-gray-800">
              <span className="text-sm font-semibold text-gray-300">{t('dashboard.analytics.average')}</span>
              <span className="text-2xl font-bold text-white">{(serviceFlow?.tableWaitingTime?.avg || 0).toFixed(1)} {t('common.min')}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#0f0f0f] rounded-xl border border-gray-800">
              <span className="text-sm font-semibold text-gray-300">{t('dashboard.analytics.maximum')}</span>
              <span className="text-2xl font-bold text-orange-400">{(serviceFlow?.tableWaitingTime?.max || 0).toFixed(0)} {t('common.min')}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#0f0f0f] rounded-xl border border-gray-800">
              <span className="text-sm font-semibold text-gray-300">{t('dashboard.analytics.tablesWaiting')}</span>
              <span className="text-2xl font-bold text-amber-400">{serviceFlow?.tableWaitingTime?.tablesWaiting || 0}</span>
            </div>
          </div>
        </AppCard>

        <AppCard className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
          <div className="flex items-center gap-3 mb-6">
            <Target className="h-6 w-6 text-green-400" />
            <h2 className="text-xl font-bold text-white">{t('dashboard.analytics.serviceSpeedRanking')}</h2>
          </div>
          <div className="space-y-3">
            {(serviceFlow?.serviceSpeedRanking?.length || 0) > 0 ? (
              (serviceFlow?.serviceSpeedRanking || []).map((waiter) => (
                <div key={waiter.staffId} className="p-4 bg-[#0f0f0f] rounded-xl border border-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center">
                        <span className="text-lg font-bold text-green-400">#{waiter.rank}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-white">{waiter.staffName}</p>
                        <p className="text-xs text-gray-400">{waiter.ordersServed} {t('dashboard.orders.served')}</p>
                      </div>
                    </div>
                    <div className="text-end">
                      <p className="text-lg font-bold text-green-400">{waiter.avgServiceTime.toFixed(1)} {t('common.min')}</p>
                      <p className="text-xs text-gray-400">{t('dashboard.analytics.avgTime')}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 py-4">{t('dashboard.analytics.noServiceSpeedData')}</p>
            )}
          </div>
        </AppCard>
      </div>
    </div>
  )
}
