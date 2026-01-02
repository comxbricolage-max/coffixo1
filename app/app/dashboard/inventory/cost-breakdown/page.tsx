'use client'

// 🧪 DEMO MODE – NO DATABASE
// Product Cost Breakdown - Shows how product costs are calculated
// TODO: Replace with real database queries when MongoDB is connected

import AppCard from '@/components/ui/AppCard'
import StatusBadge from '@/components/ui/StatusBadge'
import SectionHeader from '@/components/ui/SectionHeader'
import KPIStatCard from '@/components/ui/KPIStatCard'
import { mockProducts } from '@/lib/mock-data'
import {
  calculateSmartProductCost,
  calculateProductProfitability,
} from '@/lib/smart-inventory-engine'
import { DollarSign, TrendingUp, Package, AlertCircle, Info } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import { safeFormatCurrency } from '@/lib/safe-currency'
import { useCurrency } from '@/hooks/useCurrency'
import { getSafeCurrency } from '@/lib/safe-currency'

export default function CostBreakdownPage() {
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
  
  // Safe calculation with error handling
  let profitability: Array<{
    productId: string
    productName: string
    sellingPrice: number
    cost: number
    profit: number
    margin: number
    costConfidence: number
    sales: number
    totalRevenue: number
    totalProfit: number
    profitabilityScore: number
  }> = []
  
  try {
    profitability = calculateProductProfitability()
  } catch (error) {
    // Silently handle errors - use empty array fallback
    profitability = []
  }
  
  // Safe sorting with fallback
  const sortedByProfit = profitability.length > 0 
    ? [...profitability].sort((a, b) => b.totalProfit - a.totalProfit)
    : []
  const sortedByMargin = profitability.length > 0
    ? [...profitability].sort((a, b) => b.margin - a.margin)
    : []
  
  // Calculate safe averages
  const avgMargin = profitability.length > 0
    ? profitability.reduce((sum, p) => sum + p.margin, 0) / profitability.length
    : 0
  const totalRevenue = profitability.reduce((sum, p) => sum + p.totalRevenue, 0)
  const totalProfit = profitability.reduce((sum, p) => sum + p.totalProfit, 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <SectionHeader 
        title={t('dashboard.costBreakdown.title')} 
        subtitle={t('dashboard.costBreakdown.subtitle')}
        icon={DollarSign}
        action={
          <Link href="/app/dashboard/inventory">
            <StatusBadge variant="info" size="sm">
              <Package className="h-3 w-3" />
              {t('dashboard.costBreakdown.backToInventory')}
            </StatusBadge>
          </Link>
        }
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPIStatCard
          label={t('dashboard.costBreakdown.totalProducts')}
          value={profitability.length}
          icon={Package}
          gradient="orange"
        />
        <KPIStatCard
          label={t('dashboard.costBreakdown.avgMargin')}
          value={`${avgMargin.toFixed(1)}%`}
          icon={TrendingUp}
          gradient="green"
        />
        <KPIStatCard
          label={t('dashboard.costBreakdown.totalRevenue')}
          value={safeFormatCurrency(totalRevenue, currency)}
          icon={DollarSign}
          gradient="amber"
        />
        <KPIStatCard
          label={t('dashboard.costBreakdown.totalProfit')}
          value={safeFormatCurrency(totalProfit, currency)}
          icon={TrendingUp}
          gradient="green"
        />
      </div>

      {/* Most Profitable Products */}
      <SectionHeader 
        title={t('dashboard.costBreakdown.mostProfitable')} 
        subtitle={t('dashboard.costBreakdown.mostProfitableSubtitle')}
        icon={TrendingUp}
      />
      {sortedByProfit.length === 0 ? (
        <AppCard className="border-gray-800 bg-[#0f0f0f]">
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">{t('dashboard.costBreakdown.noProfitabilityData')}</p>
            <p className="text-sm text-gray-500 mt-2">{t('dashboard.costBreakdown.noProfitabilityDataDesc')}</p>
          </div>
        </AppCard>
      ) : (
        <div className="space-y-4">
          {sortedByProfit.slice(0, 10).map((product, index) => {
          let costData
          try {
            costData = calculateSmartProductCost(product.productId)
          } catch (error) {
            // Silently handle errors - use zero cost fallback
            costData = { cost: 0, confidence: 0, breakdown: [], margin: 0, profit: 0 }
          }
          return (
            <AppCard 
              key={product.productId}
              className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-amber-500/5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 flex items-center justify-center">
                    <span className="text-xl font-bold text-orange-400">#{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{product.productName}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge 
                        variant={product.margin > 60 ? 'success' : product.margin > 40 ? 'warning' : 'error'} 
                        size="sm"
                      >
                        {product.margin.toFixed(1)}% {t('dashboard.costBreakdown.margin')}
                      </StatusBadge>
                      <StatusBadge variant="info" size="sm">
                        {product.sales} {t('dashboard.costBreakdown.sales')}
                      </StatusBadge>
                      {product.costConfidence < 70 && (
                        <StatusBadge variant="warning" size="sm">
                          {product.costConfidence}% {t('dashboard.costBreakdown.confidence')}
                        </StatusBadge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-end">
                  <p className="text-2xl font-bold text-green-400">{safeFormatCurrency(product.totalProfit, currency)}</p>
                  <p className="text-xs text-gray-400">{t('dashboard.costBreakdown.totalProfitLabel')}</p>
                </div>
              </div>

                {/* Cost Breakdown */}
              <div className="pt-4 border-t border-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="p-3 bg-[#0f0f0f] rounded-xl border border-gray-800">
                    <p className="text-xs text-gray-400 mb-1">{t('dashboard.costBreakdown.sellingPrice')}</p>
                    <p className="text-lg font-bold text-white">{safeFormatCurrency(product.sellingPrice, currency)}</p>
                  </div>
                  <div className="p-3 bg-[#0f0f0f] rounded-xl border border-gray-800">
                    <p className="text-xs text-gray-400 mb-1">{t('dashboard.costBreakdown.costPerUnit')}</p>
                    <p className="text-lg font-bold text-orange-400">{safeFormatCurrency(product.cost, currency)}</p>
                  </div>
                  <div className="p-3 bg-[#0f0f0f] rounded-xl border border-gray-800">
                    <p className="text-xs text-gray-400 mb-1">{t('dashboard.costBreakdown.profitPerUnit')}</p>
                    <p className="text-lg font-bold text-green-400">{safeFormatCurrency(product.profit, currency)}</p>
                  </div>
                  <div className="p-3 bg-[#0f0f0f] rounded-xl border border-gray-800">
                    <p className="text-xs text-gray-400 mb-1">{t('dashboard.costBreakdown.totalRevenueLabel')}</p>
                    <p className="text-lg font-bold text-white">{safeFormatCurrency(product.totalRevenue, currency)}</p>
                  </div>
                </div>

                {/* Ingredient Breakdown */}
                {costData.breakdown.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-gray-300 mb-2">{t('dashboard.costBreakdown.costBreakdown')}:</p>
                    <div className="space-y-2">
                      {costData.breakdown.map((item, idx) => (
                        <div 
                          key={idx}
                          className="flex items-center justify-between p-2 bg-[#0f0f0f] rounded-lg border border-gray-800"
                        >
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-white">{item.ingredient}</span>
                            <span className="text-xs text-gray-500">
                              {item.quantity.toFixed(3)} {item.unit}
                            </span>
                            <StatusBadge variant="info" size="sm">
                              {item.source.replace('_', ' ')}
                            </StatusBadge>
                          </div>
                          <span className="text-sm font-bold text-orange-400">
                            {safeFormatCurrency(item.totalCost, currency)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-800 flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">{t('dashboard.costBreakdown.totalCost')}:</span>
                      <span className="text-lg font-bold text-orange-400">
                        {safeFormatCurrency(costData.cost, currency)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </AppCard>
          )
          })}
        </div>
      )}

      {/* Highest Margin Products */}
      <SectionHeader 
        title={t('dashboard.costBreakdown.highestMargin')} 
        subtitle={t('dashboard.costBreakdown.highestMarginSubtitle')}
        icon={TrendingUp}
      />
      {sortedByMargin.length === 0 ? null : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedByMargin.slice(0, 6).map((product) => (
          <AppCard 
            key={product.productId}
            className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">{product.productName}</h3>
                <p className="text-sm text-gray-400">{safeFormatCurrency(product.sellingPrice, currency)} {t('dashboard.costBreakdown.perUnit')}</p>
              </div>
              <StatusBadge 
                variant={product.margin > 60 ? 'success' : product.margin > 40 ? 'warning' : 'error'}
              >
                {product.margin.toFixed(1)}%
              </StatusBadge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">{t('dashboard.costBreakdown.costPerUnit')}:</span>
                <span className="text-orange-400 font-semibold">{safeFormatCurrency(product.cost, currency)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">{t('dashboard.costBreakdown.profitPerUnit')}:</span>
                <span className="text-green-400 font-semibold">{safeFormatCurrency(product.profit, currency)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">{t('dashboard.costBreakdown.sales')}:</span>
                <span className="text-white font-semibold">{product.sales}</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{t('dashboard.costBreakdown.totalProfitLabel')}:</span>
                <span className="text-lg font-bold text-green-400">
                  {safeFormatCurrency(product.totalProfit, currency)}
                </span>
              </div>
            </div>
          </AppCard>
        ))}
        </div>
      )}

      {/* Cost Confidence Info */}
      <AppCard className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-indigo-500/5">
        <div className="flex items-center gap-3 mb-4">
          <Info className="h-6 w-6 text-blue-400" />
          <h2 className="text-xl font-bold text-white">{t('dashboard.costBreakdown.aboutCostCalculation')}</h2>
        </div>
        <div className="space-y-3 text-sm text-gray-300">
          <p>
            <strong className="text-white">{t('dashboard.costBreakdown.directStock')}:</strong> {t('dashboard.costBreakdown.directStockDesc')}
          </p>
          <p>
            <strong className="text-white">{t('dashboard.costBreakdown.statisticalInference')}:</strong> {t('dashboard.costBreakdown.statisticalInferenceDesc')}
          </p>
          <p>
            <strong className="text-white">{t('dashboard.costBreakdown.confidenceScore')}:</strong> {t('dashboard.costBreakdown.confidenceScoreDesc')}
          </p>
          <p>
            <strong className="text-white">{t('dashboard.costBreakdown.yieldRules')}:</strong> {t('dashboard.costBreakdown.yieldRulesDesc')}
          </p>
        </div>
      </AppCard>
    </div>
  )
}

