'use client'

// 🧪 DEMO MODE – NO DATABASE
// Operations Intelligence Dashboard
// Data-first view: Process insights, not people monitoring
// TODO: Replace with real database queries when MongoDB is connected

import { getCurrentUser } from '@/lib/auth'
import AppCard from '@/components/ui/AppCard'
import KPIStatCard from '@/components/ui/KPIStatCard'
import StatusBadge from '@/components/ui/StatusBadge'
import SectionHeader from '@/components/ui/SectionHeader'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import { safeFormatCurrency } from '@/lib/safe-currency'
import { useCurrency } from '@/hooks/useCurrency'
import { getSafeCurrency } from '@/lib/safe-currency'
import {
  getAllStaffPerformance,
  analyzeServiceCombinations,
  recommendInventoryFrequency,
  analyzeProcessErrors,
  getStaffServices,
  type StaffPerformanceMetrics,
  type ServiceCombinationAnalysis,
  type InventoryFrequencyRecommendation,
  type ProcessErrorAnalysis,
} from '@/lib/flexible-staff-system'
import { mockStaff } from '@/lib/mock-data'
import {
  Users,
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Clock,
  Target,
  Zap,
} from 'lucide-react'

export default function OperationsIntelligencePage() {
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

  // Safe data access with error handling
  let staffPerformance: StaffPerformanceMetrics[] = []
  let serviceCombinations: ServiceCombinationAnalysis[] = []
  let inventoryRecommendation: InventoryFrequencyRecommendation | null = null
  let processErrors: ProcessErrorAnalysis[] = []
  
  try {
    const perf = getAllStaffPerformance()
    const combos = analyzeServiceCombinations()
    const invRec = recommendInventoryFrequency()
    const errors = analyzeProcessErrors()
    
    staffPerformance = Array.isArray(perf) ? perf : []
    serviceCombinations = Array.isArray(combos) ? combos : []
    inventoryRecommendation = invRec || null
    processErrors = Array.isArray(errors) ? errors : []
  } catch {
    // Use empty arrays/null as fallback
    staffPerformance = []
    serviceCombinations = []
    inventoryRecommendation = null
    processErrors = []
  }

  // Calculate aggregate metrics with safe fallbacks
  const safeStaffPerformance = staffPerformance || []
  const avgReliability = safeStaffPerformance.length > 0
    ? safeStaffPerformance.reduce((sum, s) => sum + (s.reliabilityScore || 0), 0) / safeStaffPerformance.length
    : 0

  const avgEfficiency = safeStaffPerformance.length > 0
    ? safeStaffPerformance.reduce((sum, s) => sum + (s.efficiencyScore || 0), 0) / safeStaffPerformance.length
    : 0

  const totalProfitImpact = staffPerformance.length > 0
    ? staffPerformance.reduce((sum, s) => sum + (s.profitImpact || 0), 0)
    : 0

  const getEfficiencyColor = (score: number) => {
    if (score >= 80) return 'green'
    if (score >= 60) return 'amber'
    return 'red'
  }

  const getReliabilityColor = (score: number) => {
    if (score >= 80) return 'green'
    if (score >= 60) return 'amber'
    return 'red'
  }

  return (
      <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1a1a] via-[#252525] to-[#1a1a1a] border border-gray-800/50 p-8 md:p-12">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-indigo-500/5 to-transparent" />
        <div className="relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 flex items-center justify-center shadow-lg shadow-purple-500/10">
              <BarChart3 className="h-8 w-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {t('dashboard.operations.title')}
              </h1>
              <p className="text-lg text-gray-400">
                {t('dashboard.operations.subtitle')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPIStatCard
          label={t('dashboard.operations.avgReliability')}
          value={`${Math.round(avgReliability)}%`}
          icon={Target}
          gradient={getReliabilityColor(avgReliability)}
        />
        <KPIStatCard
          label={t('dashboard.operations.avgEfficiency')}
          value={`${Math.round(avgEfficiency)}%`}
          icon={Zap}
          gradient={getEfficiencyColor(avgEfficiency)}
        />
        <KPIStatCard
          label={t('dashboard.operations.totalProfitImpact')}
          value={safeFormatCurrency(totalProfitImpact, currency)}
          icon={TrendingUp}
          gradient="green"
        />
        <KPIStatCard
          label={t('dashboard.operations.recommendedInventory')}
          value={inventoryRecommendation?.recommendedFrequency?.replace('_', ' ') || 'N/A'}
          icon={Clock}
          gradient="blue"
        />
      </div>

      {/* Staff Performance (Data-Focused) */}
      <SectionHeader
        title={t('dashboard.operations.teamPerformance')}
        subtitle={t('dashboard.operations.teamPerformanceSubtitle')}
        icon={Users}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {staffPerformance.map((staff) => {
          const services = getStaffServices(staff.staffId)
          return (
            <AppCard
              key={staff.staffId}
              className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-indigo-500/5"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{staff.staffName}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {services.map((service) => (
                      <StatusBadge key={service} variant="info" size="sm">
                        {service.charAt(0).toUpperCase() + service.slice(1)}
                      </StatusBadge>
                    ))}
                  </div>
                </div>
                <div className="text-end">
                  <p className="text-sm text-gray-400">{t('dashboard.operations.activities')}</p>
                  <p className="text-2xl font-bold text-white">{staff.totalActivities}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-[#0f0f0f] rounded-xl border border-gray-800">
                  <p className="text-xs text-gray-400 mb-1">{t('dashboard.operations.reliability')}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${
                          staff.reliabilityScore >= 80
                            ? 'from-green-500 to-emerald-500'
                            : staff.reliabilityScore >= 60
                            ? 'from-amber-500 to-orange-500'
                            : 'from-red-500 to-orange-500'
                        }`}
                        style={{ width: `${staff.reliabilityScore}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-white">{staff.reliabilityScore}%</span>
                  </div>
                </div>
                <div className="p-3 bg-[#0f0f0f] rounded-xl border border-gray-800">
                  <p className="text-xs text-gray-400 mb-1">{t('dashboard.operations.efficiency')}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${
                          staff.efficiencyScore >= 80
                            ? 'from-green-500 to-emerald-500'
                            : staff.efficiencyScore >= 60
                            ? 'from-amber-500 to-orange-500'
                            : 'from-red-500 to-orange-500'
                        }`}
                        style={{ width: `${staff.efficiencyScore}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-white">{staff.efficiencyScore}%</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{t('dashboard.operations.estimatedProfitImpact')}</span>
                  <span className="text-lg font-bold text-green-400">${staff.profitImpact}</span>
                </div>
              </div>
            </AppCard>
          )
        })}
      </div>

      {/* Service Combinations Analysis */}
      <SectionHeader
        title={t('dashboard.operations.serviceCombinations')}
        subtitle={t('dashboard.operations.serviceCombinationsSubtitle')}
        icon={Activity}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {serviceCombinations.map((combo, index) => (
          <AppCard
            key={index}
            className={`border-${
              combo.recommendation === 'optimal'
                ? 'green'
                : combo.recommendation === 'good'
                ? 'amber'
                : 'red'
            }-500/20 bg-gradient-to-br from-${
              combo.recommendation === 'optimal'
                ? 'green'
                : combo.recommendation === 'good'
                ? 'amber'
                : 'red'
            }-500/5 to-${
              combo.recommendation === 'optimal'
                ? 'emerald'
                : combo.recommendation === 'good'
                ? 'orange'
                : 'orange'
            }-500/5`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex flex-wrap gap-1">
                {combo.combination.map((service) => (
                  <StatusBadge key={service} variant="info" size="sm">
                    {service.charAt(0).toUpperCase() + service.slice(1)}
                  </StatusBadge>
                ))}
              </div>
              <StatusBadge
                variant={
                  combo.recommendation === 'optimal'
                    ? 'success'
                    : combo.recommendation === 'good'
                    ? 'warning'
                    : 'error'
                }
                size="sm"
              >
                {combo.recommendation.replace('_', ' ')}
              </StatusBadge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">{t('dashboard.operations.staffCount')}</span>
                <span className="font-bold text-white">{combo.staffCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">{t('dashboard.operations.avgEfficiency')}</span>
                <span className="font-bold text-white">{combo.avgEfficiency}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">{t('dashboard.operations.avgReliability')}</span>
                <span className="font-bold text-white">{combo.avgReliability}%</span>
              </div>
            </div>
          </AppCard>
        ))}
      </div>

      {/* Inventory Frequency Recommendation */}
      {inventoryRecommendation && (
        <AppCard className="border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="h-6 w-6 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">{t('dashboard.operations.inventoryFrequency')}</h2>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-[#0f0f0f] rounded-xl border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">{t('dashboard.operations.recommendedFrequency')}</span>
                <StatusBadge variant="info">
                  {inventoryRecommendation.recommendedFrequency.replace('_', ' ').toUpperCase()}
                </StatusBadge>
              </div>
              <p className="text-2xl font-bold text-white mb-1">
                {inventoryRecommendation.recommendedFrequency.replace('_', ' ')}
              </p>
              <p className="text-xs text-gray-400">{t('dashboard.operations.confidence')}: {inventoryRecommendation.confidence}%</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-[#0f0f0f] rounded-xl border border-gray-800">
                <p className="text-xs text-gray-400 mb-1">{t('dashboard.operations.currentVariance')}</p>
                <p className="text-xl font-bold text-white">{inventoryRecommendation.currentVariance}%</p>
              </div>
              <div className="p-3 bg-[#0f0f0f] rounded-xl border border-gray-800">
                <p className="text-xs text-gray-400 mb-1">{t('dashboard.operations.projectedVariance')}</p>
                <p className="text-xl font-bold text-white">{inventoryRecommendation.projectedVariance}%</p>
              </div>
              <div className="p-3 bg-[#0f0f0f] rounded-xl border border-gray-800">
                <p className="text-xs text-gray-400 mb-1">{t('dashboard.operations.costImpact')}</p>
                <p className="text-xl font-bold text-green-400">{safeFormatCurrency(inventoryRecommendation.costImpact || 0, currency)}</p>
              </div>
            </div>

            {inventoryRecommendation.reasoning && inventoryRecommendation.reasoning.length > 0 && (
              <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
                <p className="text-sm font-semibold text-indigo-400 mb-2">{t('dashboard.operations.reasoning')}</p>
                <ul className="space-y-1">
                  {inventoryRecommendation.reasoning.map((reason, idx) => (
                    <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                      <span className="text-indigo-400 mt-1">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </AppCard>
      )}

      {/* Process Error Analysis (Not People-Focused) */}
      {processErrors.length > 0 && (
        <AppCard className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="h-6 w-6 text-amber-400" />
            <h2 className="text-xl font-bold text-white">{t('dashboard.operations.processImprovements')}</h2>
          </div>
          <div className="space-y-3">
            {processErrors.map((error, idx) => (
              <div
                key={idx}
                className="p-4 bg-[#0f0f0f] rounded-xl border border-gray-800"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-white mb-1">{error.errorType}</h3>
                    <p className="text-xs text-gray-400">{t('dashboard.operations.frequency')}: {error.frequency} {t('dashboard.operations.occurrences')}</p>
                  </div>
                  <StatusBadge
                    variant={error.impact === 'high' ? 'error' : error.impact === 'medium' ? 'warning' : 'info'}
                    size="sm"
                  >
                    {error.impact} {t('dashboard.operations.impact')}
                  </StatusBadge>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-800">
                  <p className="text-sm text-gray-300 mb-2">
                    <strong className="text-white">{t('dashboard.operations.suggestedImprovement')}:</strong> {error.suggestedImprovement}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {error.commonContext.map((context, cIdx) => (
                      <StatusBadge key={cIdx} variant="info" size="sm">
                        {context}
                      </StatusBadge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AppCard>
      )}
      </div>
    )
}

