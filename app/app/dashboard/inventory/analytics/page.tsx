'use client'

// 🧪 DEMO MODE – NO DATABASE
// TODO: Replace with real database queries when MongoDB is connected

import AppCard from '@/components/ui/AppCard'
import SectionHeader from '@/components/ui/SectionHeader'
import KPIStatCard from '@/components/ui/KPIStatCard'
import StatusBadge from '@/components/ui/StatusBadge'
import {
  mockRawMaterials,
  mockDirectStock,
  mockOrders,
  calculateInventoryValuation,
  getConsumptionRate,
  getStockTurnover,
  calculateProductCost,
  calculateProductMargin,
  mockProducts,
} from '@/lib/mock-data'
import { TrendingUp, AlertCircle, DollarSign, Package, BarChart3, Clock } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { safeFormatCurrency } from '@/lib/safe-currency'
import { useCurrency } from '@/hooks/useCurrency'
import { getSafeCurrency } from '@/lib/safe-currency'

export default function InventoryAnalyticsPage() {
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
  let valuation
  try {
    valuation = calculateInventoryValuation()
  } catch {
    valuation = { totalValue: 0, directStockValue: 0, rawMaterialValue: 0, byCategory: [], lowStockValue: 0, overstockValue: 0 }
  }
  
  // Calculate consumption rates with safe fallback
  const materialConsumption = (mockRawMaterials || []).map(material => ({
    material,
    dailyConsumption: getConsumptionRate(material.id, 30),
    daysUntilStockout: getStockTurnover(material.id),
  }))

  // Calculate product profitability with safe fallback
  const productProfitability = (mockProducts || []).map(product => {
    const cost = calculateProductCost(product.id)
    const margin = calculateProductMargin(product.id, product.price)
    return {
      product,
      cost,
      margin,
      profit: product.price - cost,
    }
  }).filter(p => p.cost > 0).sort((a, b) => b.profit - a.profit)

  // Dead stock detection (items with no consumption in 30 days)
  const deadStock = materialConsumption.filter(m => m.dailyConsumption === 0)

  // High turnover items
  const highTurnover = materialConsumption
    .filter(m => m.dailyConsumption > 0)
    .sort((a, b) => b.dailyConsumption - a.dailyConsumption)
    .slice(0, 5)

  return (
    <div className="space-y-8">
      {/* Header */}
      <SectionHeader 
        title={t('dashboard.inventoryAnalytics.title')} 
        subtitle={t('dashboard.inventoryAnalytics.subtitle')}
        icon={BarChart3}
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPIStatCard
          label={t('dashboard.inventoryAnalytics.totalInventoryValue')}
          value={safeFormatCurrency(valuation.totalValue, currency)}
          icon={DollarSign}
          gradient="orange"
        />
        <KPIStatCard
          label={t('dashboard.inventoryAnalytics.rawMaterialsValue')}
          value={safeFormatCurrency(valuation.rawMaterialValue, currency)}
          icon={Package}
          gradient="amber"
        />
        <KPIStatCard
          label={t('dashboard.inventoryAnalytics.directStockValue')}
          value={safeFormatCurrency(valuation.directStockValue, currency)}
          icon={Package}
          gradient="green"
        />
        <KPIStatCard
          label={t('dashboard.inventoryAnalytics.deadStockItems')}
          value={deadStock.length.toString()}
          icon={AlertCircle}
          gradient="red"
        />
      </div>

      {/* Stock Turnover Analysis */}
      <AppCard className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-amber-500/5">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="h-6 w-6 text-orange-400" />
          <h2 className="text-xl font-bold text-white">{t('dashboard.inventoryAnalytics.stockTurnoverAnalysis')}</h2>
        </div>
        <div className="space-y-3">
          {highTurnover.map(({ material, dailyConsumption, daysUntilStockout }) => (
            <div 
              key={material.id}
              className="flex items-center justify-between p-4 bg-[#0f0f0f] rounded-xl border border-gray-800"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-white">{material.name}</h3>
                  <StatusBadge 
                    variant={daysUntilStockout < 7 ? 'error' : daysUntilStockout < 14 ? 'warning' : 'success'}
                    size="sm"
                  >
                    {daysUntilStockout.toFixed(1)} {t('dashboard.inventoryAnalytics.daysLeft')}
                  </StatusBadge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">{t('dashboard.inventoryAnalytics.dailyConsumption')}</p>
                    <p className="font-bold text-white">
                      {dailyConsumption.toFixed(2)} {material.unit}{t('dashboard.inventoryAnalytics.perDay')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">{t('dashboard.inventoryAnalytics.currentStock')}</p>
                    <p className="font-bold text-white">
                      {material.currentQuantity} {material.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">{t('dashboard.inventoryAnalytics.stockValue')}</p>
                    <p className="font-bold text-green-400">
                      {safeFormatCurrency(material.currentQuantity * material.costPerUnit, currency)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </AppCard>

      {/* Product Profitability */}
      <AppCard className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
        <div className="flex items-center gap-3 mb-6">
          <DollarSign className="h-6 w-6 text-green-400" />
          <h2 className="text-xl font-bold text-white">{t('dashboard.inventoryAnalytics.productProfitability')}</h2>
        </div>
        <div className="space-y-3">
          {productProfitability.slice(0, 10).map(({ product, cost, margin, profit }) => (
            <div 
              key={product.id}
              className="flex items-center justify-between p-4 bg-[#0f0f0f] rounded-xl border border-gray-800"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-white">{product.name}</h3>
                  <StatusBadge 
                    variant={margin > 60 ? 'success' : margin > 40 ? 'warning' : 'error'}
                    size="sm"
                  >
                    {margin.toFixed(1)}% {t('dashboard.inventoryAnalytics.margin')}
                  </StatusBadge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">{t('dashboard.inventoryAnalytics.sellingPrice')}</p>
                    <p className="font-bold text-white">{safeFormatCurrency(product.price, currency)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">{t('dashboard.inventoryAnalytics.cost')}</p>
                    <p className="font-bold text-orange-400">{safeFormatCurrency(cost, currency)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">{t('dashboard.inventoryAnalytics.profit')}</p>
                    <p className="font-bold text-green-400">{safeFormatCurrency(profit, currency)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </AppCard>

      {/* Dead Stock Alert */}
      {deadStock.length > 0 && (
        <AppCard className="border-red-500/20 bg-gradient-to-br from-red-500/5 to-orange-500/5">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="h-6 w-6 text-red-400" />
            <h2 className="text-xl font-bold text-white">{t('dashboard.inventoryAnalytics.deadStock')}</h2>
          </div>
          <div className="space-y-2">
            {deadStock.map(({ material }) => (
              <div 
                key={material.id}
                className="flex items-center justify-between p-3 bg-[#0f0f0f] rounded-xl border border-red-500/30"
              >
                <div>
                  <p className="font-semibold text-white">{material.name}</p>
                  <p className="text-sm text-gray-400">
                    {material.currentQuantity} {material.unit} • {safeFormatCurrency(material.currentQuantity * material.costPerUnit, currency)} {t('dashboard.inventoryAnalytics.value')}
                  </p>
                </div>
                <StatusBadge variant="error">{t('dashboard.inventoryAnalytics.noConsumption')}</StatusBadge>
              </div>
            ))}
          </div>
        </AppCard>
      )}

      {/* Consumption Rate Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AppCard className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
          <h3 className="text-lg font-bold text-white mb-4">{t('dashboard.inventoryAnalytics.topConsumedMaterials')}</h3>
          <div className="space-y-2">
            {materialConsumption
              .filter(m => m.dailyConsumption > 0)
              .sort((a, b) => b.dailyConsumption - a.dailyConsumption)
              .slice(0, 5)
              .map(({ material, dailyConsumption }) => (
                <div key={material.id} className="flex items-center justify-between p-2 bg-[#0f0f0f] rounded-lg">
                  <span className="text-sm text-white">{material.name}</span>
                  <span className="text-sm font-bold text-orange-400">
                    {dailyConsumption.toFixed(2)} {material.unit}{t('dashboard.inventoryAnalytics.perDay')}
                  </span>
                </div>
              ))}
          </div>
        </AppCard>

        <AppCard className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
          <h3 className="text-lg font-bold text-white mb-4">{t('dashboard.inventoryAnalytics.mostProfitableProducts')}</h3>
          <div className="space-y-2">
            {productProfitability.slice(0, 5).map(({ product, profit, margin }) => (
              <div key={product.id} className="flex items-center justify-between p-2 bg-[#0f0f0f] rounded-lg">
                <span className="text-sm text-white">{product.name}</span>
                <div className="text-right">
                  <span className="text-sm font-bold text-green-400">{safeFormatCurrency(profit, currency)}</span>
                  <span className="text-xs text-gray-400 ml-2">({margin.toFixed(1)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </AppCard>
      </div>
    </div>
  )
}

