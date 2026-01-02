'use client'

// 🧪 DEMO MODE – NO DATABASE
// TODO: Replace with real database queries when MongoDB is connected

import { useState } from 'react'
import AppCard from '@/components/ui/AppCard'
import StatusBadge from '@/components/ui/StatusBadge'
import SectionHeader from '@/components/ui/SectionHeader'
import GradientButton from '@/components/ui/GradientButton'
import KPIStatCard from '@/components/ui/KPIStatCard'
import {
  mockDirectStock,
  mockRawMaterials,
  mockSuppliers,
  getLowStockItems,
  calculateInventoryValuation,
  type DirectStock,
  type RawMaterial,
} from '@/lib/mock-data'
import {
  calculateInventoryValuation as calculateSmartValuation,
  getStockAlerts,
  estimateInventoryLoss,
  calculateProfitMetrics,
} from '@/lib/smart-inventory-engine'
import { Package, ShoppingCart, AlertTriangle, TrendingUp, Plus, Edit, DollarSign, TrendingDown, ClipboardCheck, History } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import { safeFormatCurrency } from '@/lib/safe-currency'
import { useCurrency } from '@/hooks/useCurrency'
import { getSafeCurrency } from '@/lib/safe-currency'
import {
  getRawMaterialsForInventory,
  createInventorySnapshot,
  getAllInventorySnapshots,
  type InventorySnapshot,
} from '@/lib/bom-cost-engine'
import { mockStaff } from '@/lib/mock-data'

export default function InventoryPage() {
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
  
  const [directStock, setDirectStock] = useState<DirectStock[]>(mockDirectStock || [])
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>(mockRawMaterials || [])
  const [activeTab, setActiveTab] = useState<'direct' | 'raw'>('raw')
  const [showInventoryCount, setShowInventoryCount] = useState(false)
  const [inventoryCounts, setInventoryCounts] = useState<Record<string, number>>({})
  const [inventoryType, setInventoryType] = useState<'daily' | 'weekly' | 'monthly' | 'manual'>('manual')
  const [inventoryNote, setInventoryNote] = useState('')
  
  // Get current user (in real app, from auth context)
  const currentUser = mockStaff[0] || { id: 'system', name: 'System', role: undefined }
  
  // Safe calculation with error handling
  let lowStock, valuation, smartValuation, stockAlerts, inventoryLoss, profitMetrics
  
  try {
    lowStock = getLowStockItems()
    valuation = calculateInventoryValuation()
    smartValuation = calculateSmartValuation()
    stockAlerts = getStockAlerts()
    inventoryLoss = estimateInventoryLoss()
    profitMetrics = calculateProfitMetrics('today')
  } catch (error) {
    // Fallback values - silently handle errors
    lowStock = { directStock: [], rawMaterials: [] }
    valuation = { totalValue: 0, directStockValue: 0, rawMaterialValue: 0, byCategory: [], lowStockValue: 0, overstockValue: 0 }
    smartValuation = { totalValue: 0, directStockValue: 0, rawMaterialValue: 0, byCategory: [], lowStockValue: 0, overstockValue: 0 }
    stockAlerts = { lowStock: [], overstock: [] }
    inventoryLoss = { totalEstimatedLoss: 0, byCategory: [], expiredItems: [], wasteEstimate: 0 }
    profitMetrics = { todayProfit: 0, todayRevenue: 0, todayCost: 0, todayMargin: 0, byProduct: [] }
  }

  const getSupplierName = (supplierId?: string) => {
    if (!supplierId) return t('dashboard.inventory.notAvailable')
    return mockSuppliers.find(s => s.id === supplierId)?.name || t('dashboard.inventory.unknown')
  }

  const isLowStock = (item: DirectStock | RawMaterial) => {
    // Type guard for RawMaterial
    if ('currentQuantity' in item && 'lowStockThreshold' in item) {
      const rawMaterial = item as RawMaterial
      return rawMaterial.currentQuantity <= rawMaterial.lowStockThreshold
    }
    // Type guard for DirectStock
    if ('quantity' in item && 'lowStockThreshold' in item) {
      const directStock = item as DirectStock
      return directStock.quantity <= directStock.lowStockThreshold
    }
    return false
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <SectionHeader 
        title={t('dashboard.inventory.title')} 
        subtitle={t('dashboard.inventory.subtitle')}
        icon={Package}
        action={
          <div className="flex gap-2">
            <GradientButton variant="orange" onClick={() => setShowInventoryCount(true)}>
              <ClipboardCheck className="h-4 w-4 me-2" />
              Run Inventory
            </GradientButton>
            <GradientButton variant="orange">
              <Plus className="h-4 w-4" />
              {t('dashboard.inventory.addItem')}
            </GradientButton>
          </div>
        }
      />

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPIStatCard
          label={t('dashboard.inventory.totalValuation')}
          value={safeFormatCurrency(smartValuation.totalValue, currency)}
          icon={TrendingUp}
          gradient="orange"
        />
        <KPIStatCard
          label={t('dashboard.inventory.directStockValue')}
          value={safeFormatCurrency(smartValuation.directStockValue, currency)}
          icon={Package}
          gradient="amber"
        />
        <KPIStatCard
          label={t('dashboard.inventory.rawMaterialsValue')}
          value={safeFormatCurrency(smartValuation.rawMaterialValue, currency)}
          icon={ShoppingCart}
          gradient="green"
        />
        <KPIStatCard
          label={t('dashboard.inventory.lowStockAlerts')}
          value={stockAlerts.lowStock.length.toString()}
          icon={AlertTriangle}
          gradient="red"
        />
        <KPIStatCard
          label={t('dashboard.inventory.overstockItems')}
          value={stockAlerts.overstock.length.toString()}
          icon={TrendingDown}
          gradient="blue"
        />
      </div>

      {/* Low Stock & Overstock Alerts */}
      {(stockAlerts.lowStock.length > 0 || stockAlerts.overstock.length > 0) && (
        <div className="space-y-4">
          {stockAlerts.lowStock.length > 0 && (
            <AppCard className="border-red-500/20 bg-gradient-to-br from-red-500/5 to-orange-500/5">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-400" />
                <h2 className="text-xl font-bold text-white">{t('dashboard.inventory.lowStockAlertsTitle')}</h2>
                <StatusBadge variant="error" size="sm">{stockAlerts.lowStock.length} {t('dashboard.inventory.items')}</StatusBadge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stockAlerts.lowStock.map(alert => (
                  <div 
                    key={alert.id} 
                    className={`p-4 rounded-xl border ${
                      alert.urgency === 'critical' 
                        ? 'bg-red-500/10 border-red-500/50' 
                        : alert.urgency === 'warning'
                        ? 'bg-orange-500/10 border-orange-500/50'
                        : 'bg-amber-500/10 border-amber-500/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-white">{alert.name}</p>
                      <StatusBadge 
                        variant={alert.urgency === 'critical' ? 'error' : alert.urgency === 'warning' ? 'warning' : 'info'}
                        size="sm"
                      >
                        {t(`dashboard.inventory.${alert.urgency}`)}
                      </StatusBadge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">
                        {alert.current} / {alert.threshold} {alert.unit}
                      </span>
                      <span className="text-red-400 font-semibold">{safeFormatCurrency(alert.value, currency)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </AppCard>
          )}
          
          {stockAlerts.overstock.length > 0 && (
            <AppCard className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-indigo-500/5">
              <div className="flex items-center gap-3 mb-4">
                <TrendingDown className="h-6 w-6 text-blue-400" />
                <h2 className="text-xl font-bold text-white">{t('dashboard.inventory.overstockItemsTitle')}</h2>
                <StatusBadge variant="info" size="sm">{stockAlerts.overstock.length} {t('dashboard.inventory.items')}</StatusBadge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stockAlerts.overstock.map(alert => (
                  <div key={alert.id} className="p-4 bg-[#0f0f0f] rounded-xl border border-blue-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-white">{alert.name}</p>
                      <StatusBadge variant="info" size="sm">{t('dashboard.inventory.overstock')}</StatusBadge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">{t('dashboard.inventory.current')}:</span>
                        <span className="text-white">{alert.current} {alert.unit}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">{t('dashboard.inventory.optimal')}:</span>
                        <span className="text-green-400">{alert.optimal.toFixed(1)} {alert.unit}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">{t('dashboard.inventory.excessValue')}:</span>
                        <span className="text-blue-400 font-semibold">{safeFormatCurrency(alert.excessValue, currency)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </AppCard>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/app/dashboard/inventory/history">
          <GradientButton variant="outline" size="sm">
            <History className="h-4 w-4" />
            {t('dashboard.inventory.history', { default: 'History' })}
          </GradientButton>
        </Link>
        <Link href="/app/dashboard/inventory/cost-breakdown">
          <GradientButton variant="outline" size="sm">
            <DollarSign className="h-4 w-4" />
            {t('dashboard.inventory.costBreakdown')}
          </GradientButton>
        </Link>
        <Link href="/app/dashboard/inventory/analytics">
          <GradientButton variant="outline" size="sm">
            <TrendingUp className="h-4 w-4" />
            {t('dashboard.inventory.analytics')}
          </GradientButton>
        </Link>
      </div>

      {/* Profit Metrics */}
      <AppCard className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
        <div className="flex items-center gap-3 mb-6">
          <DollarSign className="h-6 w-6 text-green-400" />
          <h2 className="text-xl font-bold text-white">{t('dashboard.inventory.todayProfitMetrics')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-[#0f0f0f] rounded-xl border border-gray-800">
            <p className="text-sm text-gray-400 mb-1">{t('dashboard.inventory.revenue')}</p>
            <p className="text-2xl font-bold text-white">{safeFormatCurrency(profitMetrics.todayRevenue, currency)}</p>
          </div>
          <div className="p-4 bg-[#0f0f0f] rounded-xl border border-gray-800">
            <p className="text-sm text-gray-400 mb-1">{t('dashboard.inventory.cost')}</p>
            <p className="text-2xl font-bold text-orange-400">{safeFormatCurrency(profitMetrics.todayCost, currency)}</p>
          </div>
          <div className="p-4 bg-[#0f0f0f] rounded-xl border border-gray-800">
            <p className="text-sm text-gray-400 mb-1">{t('dashboard.inventory.profit')}</p>
            <p className="text-2xl font-bold text-green-400">{safeFormatCurrency(profitMetrics.todayProfit, currency)}</p>
          </div>
          <div className="p-4 bg-[#0f0f0f] rounded-xl border border-gray-800">
            <p className="text-sm text-gray-400 mb-1">{t('dashboard.inventory.margin')}</p>
            <p className="text-2xl font-bold text-white">{profitMetrics.todayMargin.toFixed(1)}%</p>
          </div>
        </div>
      </AppCard>

      {/* Inventory Loss & Waste */}
      {inventoryLoss.totalEstimatedLoss > 0 && (
        <AppCard className="border-red-500/20 bg-gradient-to-br from-red-500/5 to-orange-500/5">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="h-6 w-6 text-red-400" />
            <h2 className="text-xl font-bold text-white">{t('dashboard.inventory.inventoryLoss')}</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#0f0f0f] rounded-xl border border-red-500/30">
              <div>
                <p className="text-sm text-gray-400 mb-1">{t('dashboard.inventory.totalEstimatedLoss')}</p>
                <p className="text-2xl font-bold text-red-400">{safeFormatCurrency(inventoryLoss.totalEstimatedLoss, currency)}</p>
              </div>
              <div className="text-end">
                <p className="text-sm text-gray-400 mb-1">{t('dashboard.inventory.wasteEstimate')}</p>
                <p className="text-lg font-bold text-orange-400">{safeFormatCurrency(inventoryLoss.wasteEstimate, currency)}</p>
              </div>
            </div>
            {inventoryLoss.expiredItems.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-300 mb-2">{t('dashboard.inventory.expiredItemsLabel')}</p>
                <div className="space-y-2">
                  {inventoryLoss.expiredItems.map((item) => (
                    <div key={item.itemId} className="p-3 bg-[#0f0f0f] rounded-xl border border-red-500/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">{item.itemName}</p>
                          <p className="text-xs text-gray-400">
                            {item.quantity} {mockRawMaterials.find(m => m.id === item.itemId)?.unit || t('dashboard.inventory.units.units')} • {item.daysExpired} {t('dashboard.inventory.daysExpired')}
                          </p>
                        </div>
                        <span className="text-lg font-bold text-red-400">{safeFormatCurrency(item.value, currency)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </AppCard>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800">
        <button
          onClick={() => setActiveTab('raw')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'raw'
              ? 'text-orange-400 border-b-2 border-orange-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          {t('dashboard.inventory.rawMaterials')} ({rawMaterials.length})
        </button>
        <button
          onClick={() => setActiveTab('direct')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab && activeTab === 'direct'
              ? 'text-orange-400 border-b-2 border-orange-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          {t('dashboard.inventory.directStock')} ({directStock.length})
        </button>
      </div>

      {/* Raw Materials Tab */}
      {activeTab && activeTab === 'raw' && (
        <div className="space-y-4">
          {rawMaterials.map((material) => (
            <AppCard 
              key={material.id}
              className={`border-2 hover:scale-[1.01] transition-all ${
                isLowStock(material) 
                  ? 'border-red-500/30 bg-red-500/5' 
                  : 'border-green-500/20 bg-green-500/5'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold text-white">{material.name}</h3>
                    {isLowStock(material) && (
                      <StatusBadge variant="error">{t('dashboard.inventory.lowStock')}</StatusBadge>
                    )}
                    {material.expirationDate && (
                      <StatusBadge variant="warning" size="sm">
                        {t('dashboard.inventory.expires')} {material.expirationDate.toLocaleDateString()}
                      </StatusBadge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="p-3 bg-[#0f0f0f] rounded-xl border border-gray-800">
                      <p className="text-xs text-gray-400 mb-1">{t('dashboard.inventory.currentQuantity')}</p>
                      <p className="text-lg font-bold text-white">
                        {material.currentQuantity} {material.unit}
                      </p>
                    </div>
                    <div className="p-3 bg-[#0f0f0f] rounded-xl border border-gray-800">
                      <p className="text-xs text-gray-400 mb-1">{t('dashboard.inventory.costPerUnit')}</p>
                      <p className="text-lg font-bold text-orange-400">
                        {safeFormatCurrency(material.costPerUnit, currency)}
                      </p>
                    </div>
                    <div className="p-3 bg-[#0f0f0f] rounded-xl border border-gray-800">
                      <p className="text-xs text-gray-400 mb-1">{t('dashboard.inventory.totalValue')}</p>
                      <p className="text-lg font-bold text-green-400">
                        {safeFormatCurrency(material.currentQuantity * material.costPerUnit, currency)}
                      </p>
                    </div>
                    <div className="p-3 bg-[#0f0f0f] rounded-xl border border-gray-800">
                      <p className="text-xs text-gray-400 mb-1">{t('dashboard.inventory.supplier')}</p>
                      <p className="text-sm font-semibold text-white">
                        {getSupplierName(material.supplierId)}
                      </p>
                    </div>
                  </div>
                  {material.category && (
                    <StatusBadge variant="info" size="sm">{material.category}</StatusBadge>
                  )}
                </div>
                <GradientButton variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                  {t('dashboard.inventory.edit')}
                </GradientButton>
              </div>
            </AppCard>
          ))}
        </div>
      )}

      {/* Direct Stock Tab */}
      {activeTab && activeTab === 'direct' && (
        <div className="space-y-4">
          {directStock.map((stock) => (
            <AppCard 
              key={stock.id}
              className={`border-2 hover:scale-[1.01] transition-all ${
                isLowStock(stock) 
                  ? 'border-red-500/30 bg-red-500/5' 
                  : 'border-amber-500/20 bg-amber-500/5'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold text-white">{stock.productName}</h3>
                    {isLowStock(stock) && (
                      <StatusBadge variant="error">{t('dashboard.inventory.lowStock')}</StatusBadge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div className="p-3 bg-[#0f0f0f] rounded-xl border border-gray-800">
                      <p className="text-xs text-gray-400 mb-1">Quantity</p>
                      <p className="text-lg font-bold text-white">
                        {stock.quantity} {stock.unit}
                      </p>
                    </div>
                    <div className="p-3 bg-[#0f0f0f] rounded-xl border border-gray-800">
                      <p className="text-xs text-gray-400 mb-1">{t('dashboard.inventory.unitCost')}</p>
                      <p className="text-lg font-bold text-orange-400">
                        {safeFormatCurrency(stock.unitCost, currency)}
                      </p>
                    </div>
                    <div className="p-3 bg-[#0f0f0f] rounded-xl border border-gray-800">
                      <p className="text-xs text-gray-400 mb-1">{t('dashboard.inventory.sellingPrice')}</p>
                      <p className="text-lg font-bold text-green-400">
                        {safeFormatCurrency(stock.sellingPrice, currency)}
                      </p>
                    </div>
                    <div className="p-3 bg-[#0f0f0f] rounded-xl border border-gray-800">
                      <p className="text-xs text-gray-400 mb-1">{t('dashboard.inventory.margin')}</p>
                      <p className="text-lg font-bold text-white">
                        {stock.margin.toFixed(1)}%
                      </p>
                    </div>
                    <div className="p-3 bg-[#0f0f0f] rounded-xl border border-gray-800">
                      <p className="text-xs text-gray-400 mb-1">{t('dashboard.inventory.totalValue')}</p>
                      <p className="text-lg font-bold text-white">
                        {safeFormatCurrency(stock.quantity * stock.unitCost, currency)}
                      </p>
                    </div>
                  </div>
                  {stock.lastRestocked && (
                    <p className="text-xs text-gray-400">
                      {t('dashboard.inventory.lastRestocked')} {stock.lastRestocked.toLocaleDateString()}
                    </p>
                  )}
                </div>
                <GradientButton variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                  {t('dashboard.inventory.edit')}
                </GradientButton>
              </div>
            </AppCard>
          ))}
        </div>
      )}

      {/* Run Inventory Modal */}
      {showInventoryCount && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <AppCard className="max-w-4xl w-full border-orange-500/30 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Run Inventory Count</h2>
              <button
                onClick={() => {
                  setShowInventoryCount(false)
                  setInventoryCounts({})
                }}
                className="text-gray-400 hover:text-white text-2xl leading-none transition-colors"
              >
                ×
              </button>
            </div>

            <p className="text-sm text-gray-400 mb-6">
              {t('dashboard.inventory.countInstructions', { default: 'Count all raw materials and enter the actual quantities. This will create an immutable inventory snapshot.' })}
            </p>

            {/* Inventory Type and Note */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  {t('dashboard.inventory.inventoryType', { default: 'Inventory Type' })}
                </label>
                <select
                  value={inventoryType || 'manual'}
                  onChange={(e) => {
                    const newType = e.target.value as 'daily' | 'weekly' | 'monthly' | 'manual'
                    setInventoryType(newType || 'manual')
                  }}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="manual">{t('dashboard.inventory.manual', { default: 'Manual' })}</option>
                  <option value="daily">{t('dashboard.inventory.daily', { default: 'Daily' })}</option>
                  <option value="weekly">{t('dashboard.inventory.weekly', { default: 'Weekly' })}</option>
                  <option value="monthly">{t('dashboard.inventory.monthly', { default: 'Monthly' })}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  {t('dashboard.inventory.note', { default: 'Note (optional)' })}
                </label>
                <input
                  type="text"
                  value={inventoryNote}
                  onChange={(e) => setInventoryNote(e.target.value)}
                  placeholder={t('dashboard.inventory.notePlaceholder', { default: 'Add a note about this inventory count...' })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {getRawMaterialsForInventory().map(({ rawMaterial, lastCounted, daysSinceLastCount }) => (
                <div
                  key={rawMaterial.id}
                  className="flex items-center justify-between p-4 bg-[#0f0f0f] rounded-xl border border-gray-800"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{rawMaterial.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>Current: {rawMaterial.currentQuantity} {rawMaterial.unit}</span>
                      <span>Cost: {safeFormatCurrency(rawMaterial.costPerUnit, currency)}/{rawMaterial.unit}</span>
                      {lastCounted && (
                        <span>Last counted: {daysSinceLastCount !== undefined ? `${daysSinceLastCount} days ago` : 'N/A'}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Counted qty"
                      value={inventoryCounts[rawMaterial.id] ?? ''}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        setInventoryCounts(prev => ({
                          ...prev,
                          [rawMaterial.id]: value,
                        }))
                      }}
                      className="w-32 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                    />
                    <span className="text-gray-400 text-sm">{rawMaterial.unit}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 justify-end">
              <GradientButton
                variant="outline"
                onClick={() => {
                  setShowInventoryCount(false)
                  setInventoryCounts({})
                }}
              >
                Cancel
              </GradientButton>
              <GradientButton
                variant="orange"
                onClick={() => {
                  try {
                    // Filter only materials with counts entered
                    const materialsToCount = Object.entries(inventoryCounts)
                      .filter(([_, quantity]) => quantity > 0)
                      .map(([rawMaterialId, countedQuantity]) => ({
                        rawMaterialId,
                        countedQuantity,
                      }))

                    if (materialsToCount.length === 0) {
                      alert(t('dashboard.inventory.noCountsEntered', { default: 'Please enter at least one quantity to count.' }))
                      return
                    }

                    // Create immutable inventory snapshot
                    const snapshot = createInventorySnapshot(
                      materialsToCount,
                      {
                        userId: currentUser?.id || 'system',
                        name: currentUser?.name || 'System',
                        role: currentUser?.role,
                      },
                      inventoryType || 'manual',
                      inventoryNote || undefined
                    )

                    // Refresh raw materials state
                    setRawMaterials([...mockRawMaterials])
                    setShowInventoryCount(false)
                    setInventoryCounts({})
                    setInventoryNote('')
                    setInventoryType('manual')
                    
                    // Show success message
                    alert(t('dashboard.inventory.snapshotCreated', { 
                      default: `Inventory snapshot created successfully!\nFinancial impact: ${safeFormatCurrency(snapshot.totalFinancialImpact, currency)}` 
                    }))
                  } catch (error) {
                    alert(t('dashboard.inventory.errorCreatingSnapshot', { default: 'Error creating inventory snapshot. Please try again.' }))
                  }
                }}
              >
                {t('dashboard.inventory.createSnapshot', { default: 'Create Inventory Snapshot' })}
              </GradientButton>
            </div>
          </AppCard>
        </div>
      )}
    </div>
  )
}

