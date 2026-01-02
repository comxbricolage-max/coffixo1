'use client'

// 🧪 DEMO MODE – NO DATABASE
// Advanced Staff Performance Analytics
// TODO: Replace with real database queries when MongoDB is connected

import SectionHeader from '@/components/ui/SectionHeader'
import KPIStatCard from '@/components/ui/KPIStatCard'
import AppCard from '@/components/ui/AppCard'
import StatusBadge from '@/components/ui/StatusBadge'
import { useTranslation } from '@/hooks/useTranslation'
import { mockOrders, mockStaff, getStaffPerformance } from '@/lib/mock-data'
import { getDetailedStaffPerformance, detectBottlenecks } from '@/lib/advanced-analytics'
import { Users, TrendingUp, AlertCircle, Clock, Target, Zap, Activity } from 'lucide-react'

export default function PerformancePage() {
  let t: (key: string, params?: Record<string, string | number>) => string
  try {
    const translation = useTranslation()
    t = translation.t
  } catch {
    t = (key: string) => key
  }
  // Safe data access with fallbacks
  const safeOrders = mockOrders || []
  const safeStaff = mockStaff || []
  
  let staffPerformance: any[] = []
  let detailedPerformance: any[] = []
  let bottlenecks: ReturnType<typeof detectBottlenecks> | null = null
  
  try {
    const perf = getStaffPerformance(safeOrders, safeStaff)
    const detailed = getDetailedStaffPerformance()
    const bottle = detectBottlenecks()
    
    staffPerformance = Array.isArray(perf) ? perf : []
    detailedPerformance = Array.isArray(detailed) ? detailed : []
    bottlenecks = bottle || null
  } catch {
    // Use empty arrays/null as fallback
    staffPerformance = []
    detailedPerformance = []
    bottlenecks = null
  }
  
  const activeStaff = (staffPerformance || []).filter(s => s.ordersHandled > 0)
  
  // Calculate overall metrics with safe fallbacks
  const totalOrders = safeOrders.length
  const delayedOrders = (staffPerformance || []).reduce((sum, s) => sum + (s.delayedOrders || 0), 0)
  
  const avgPrepTime = activeStaff
    .filter(s => s.role === 'kitchen' && s.avgPrepTime)
    .reduce((sum, s) => sum + (s.avgPrepTime || 0), 0) / 
    (activeStaff.filter(s => s.role === 'kitchen' && s.avgPrepTime).length || 1)
  
  const avgServiceTime = activeStaff
    .filter(s => s.role === 'waiter' && s.avgServiceTime)
    .reduce((sum, s) => sum + (s.avgServiceTime || 0), 0) / 
    (activeStaff.filter(s => s.role === 'waiter' && s.avgServiceTime).length || 1)

  // Calculate average efficiency
  const avgEfficiency = detailedPerformance.length > 0
    ? detailedPerformance.reduce((sum, p) => sum + p.efficiencyScore, 0) / detailedPerformance.length
    : 0

  // Calculate average orders per hour
  const avgOrdersPerHour = detailedPerformance.length > 0
    ? detailedPerformance.reduce((sum, p) => sum + p.ordersPerHour, 0) / detailedPerformance.length
    : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <SectionHeader 
        title={t('dashboard.performance.title')} 
        subtitle={t('dashboard.performance.subtitle')}
        icon={Users}
      />

      {/* Overall Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPIStatCard
          label={t('dashboard.performance.totalOrders')}
          value={totalOrders}
          icon={Users}
          gradient="orange"
        />
        <KPIStatCard
          label={t('dashboard.performance.delayedOrders')}
          value={delayedOrders}
          icon={AlertCircle}
          gradient="red"
        />
        <KPIStatCard
          label={t('dashboard.performance.avgEfficiencyScore')}
          value={`${Math.round(avgEfficiency)}%`}
          icon={Target}
          gradient={avgEfficiency >= 80 ? 'green' : avgEfficiency >= 60 ? 'amber' : 'red'}
        />
        <KPIStatCard
          label={t('dashboard.performance.avgOrdersPerHour')}
          value={avgOrdersPerHour.toFixed(1)}
          icon={Zap}
          gradient="green"
        />
      </div>

      {/* Time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <KPIStatCard
          label={t('dashboard.performance.avgPrepTime')}
          value={avgPrepTime > 0 ? `${avgPrepTime.toFixed(1)} ${t('dashboard.performance.minutes')}` : t('dashboard.staff.notAvailable')}
          icon={Clock}
          gradient={avgPrepTime > 15 ? 'red' : avgPrepTime > 12 ? 'amber' : 'green'}
        />
        <KPIStatCard
          label={t('dashboard.performance.avgServiceTime')}
          value={avgServiceTime > 0 ? `${avgServiceTime.toFixed(1)} ${t('dashboard.performance.minutes')}` : t('dashboard.staff.notAvailable')}
          icon={Clock}
          gradient={avgServiceTime > 5 ? 'red' : avgServiceTime > 3 ? 'amber' : 'green'}
        />
      </div>

      {/* Bottleneck Detection */}
      <AppCard className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-amber-500/5">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="h-6 w-6 text-orange-400" />
          <h2 className="text-xl font-bold text-white">{t('dashboard.performance.bottleneckDetection')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-xl border-2 ${
            bottlenecks?.kitchenOverload?.detected 
              ? 'bg-red-500/10 border-red-500/30' 
              : 'bg-gray-800/50 border-gray-700'
          }`}>
            <p className="text-sm text-gray-400 mb-1">{t('dashboard.performance.kitchenLoad')}</p>
            <p className="text-2xl font-bold text-white">{bottlenecks?.kitchenOverload?.currentLoad || 0} {t('dashboard.performance.orders')}</p>
            {bottlenecks?.kitchenOverload?.detected && (
              <p className="text-xs text-red-400 mt-1">⚠️ {t('dashboard.performance.highLoadDetected')}</p>
            )}
          </div>
          <div className={`p-4 rounded-xl border-2 ${
            (bottlenecks?.slowServiceAlerts?.length || 0) > 0
              ? 'bg-orange-500/10 border-orange-500/30' 
              : 'bg-gray-800/50 border-gray-700'
          }`}>
            <p className="text-sm text-gray-400 mb-1">{t('dashboard.performance.slowServiceAlerts')}</p>
            <p className="text-2xl font-bold text-white">{bottlenecks?.slowServiceAlerts?.length || 0}</p>
            {(bottlenecks?.slowServiceAlerts?.length || 0) > 0 && (
              <p className="text-xs text-orange-400 mt-1">⚠️ {t('dashboard.performance.ordersWaiting')}</p>
            )}
          </div>
          <div className={`p-4 rounded-xl border-2 ${
            !bottlenecks?.kitchenOverload?.detected && (bottlenecks?.slowServiceAlerts?.length || 0) === 0
              ? 'bg-green-500/10 border-green-500/30' 
              : 'bg-gray-800/50 border-gray-700'
          }`}>
            <p className="text-sm text-gray-400 mb-1">{t('dashboard.performance.systemStatus')}</p>
            <p className="text-2xl font-bold text-white">
              {!bottlenecks?.kitchenOverload?.detected && (bottlenecks?.slowServiceAlerts?.length || 0) === 0 ? t('dashboard.performance.optimal') : t('dashboard.performance.stressed')}
            </p>
            {!bottlenecks?.kitchenOverload?.detected && (bottlenecks?.slowServiceAlerts?.length || 0) === 0 && (
              <p className="text-xs text-green-400 mt-1">✓ {t('dashboard.performance.runningSmoothly')}</p>
            )}
          </div>
        </div>
      </AppCard>

      {/* Staff Performance Cards */}
      <SectionHeader 
        title={t('dashboard.performance.individualPerformance')} 
        subtitle={t('dashboard.performance.individualPerformanceSubtitle')}
        icon={Users}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {detailedPerformance.map((perf) => (
          <AppCard 
            key={perf.staffId}
            className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-amber-500/5"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">{perf.staffName}</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge variant={perf.role === 'kitchen' ? 'warning' : perf.role === 'waiter' ? 'success' : 'info'} size="sm">
                    {t(`dashboard.staff.roles.${perf.role}`)}
                  </StatusBadge>
                  <StatusBadge 
                    variant={perf.efficiencyScore >= 80 ? 'success' : perf.efficiencyScore >= 60 ? 'warning' : 'error'} 
                    size="sm"
                  >
                    {perf.efficiencyScore}% {t('dashboard.performance.efficient')}
                  </StatusBadge>
                </div>
              </div>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between p-3 bg-[#0f0f0f] rounded-xl border border-gray-800">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-400">{t('dashboard.performance.ordersHandled')}</span>
                </div>
                <span className="text-lg font-bold text-white">{perf.ordersHandled}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-[#0f0f0f] rounded-xl border border-gray-800">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-400">{t('dashboard.performance.avgHandlingTime')}</span>
                </div>
                <span className="text-lg font-bold text-orange-400">{perf.avgHandlingTime} {t('dashboard.performance.minutes')}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-[#0f0f0f] rounded-xl border border-gray-800">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-400">{t('dashboard.performance.ordersPerHour')}</span>
                </div>
                <span className="text-lg font-bold text-green-400">{perf.ordersPerHour}</span>
              </div>
              
              {perf.delays > 0 && (
                <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-xl border border-red-500/30">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <span className="text-sm text-red-400">{t('dashboard.performance.delays')}</span>
                  </div>
                  <span className="text-lg font-bold text-red-400">{perf.delays}</span>
                </div>
              )}
            </div>
            
            {/* Efficiency Score Progress */}
            <div className="pt-4 border-t border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-300">{t('dashboard.performance.efficiencyScore')}</span>
                <span className={`text-lg font-bold ${
                  perf.efficiencyScore >= 80 ? 'text-green-400' : 
                  perf.efficiencyScore >= 60 ? 'text-amber-400' : 
                  'text-red-400'
                }`}>
                  {perf.efficiencyScore}%
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className={`h-full rounded-full ${
                    perf.efficiencyScore >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 
                    perf.efficiencyScore >= 60 ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 
                    'bg-gradient-to-r from-red-500 to-orange-500'
                  }`}
                  style={{ width: `${perf.efficiencyScore}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {perf.efficiencyScore >= 80 ? t('dashboard.performance.excellentPerformance') : 
                 perf.efficiencyScore >= 60 ? t('dashboard.performance.goodPerformance') : 
                 t('dashboard.performance.needsImprovement')}
              </p>
            </div>
          </AppCard>
        ))}
      </div>

      {detailedPerformance.length === 0 && (
        <AppCard className="bg-gradient-to-br from-orange-500/5 to-amber-500/5 border-orange-500/20">
          <p className="text-center text-gray-400 py-8">
            {t('dashboard.performance.noData')}
          </p>
        </AppCard>
      )}
    </div>
  )
}
