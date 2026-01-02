'use client'

// 🧪 DEMO MODE – NO DATABASE
// Inventory History & Audit Trail
// Immutable records of all inventory changes
// TODO: Replace with real database queries when MongoDB is connected

import { useState } from 'react'
import AppCard from '@/components/ui/AppCard'
import SectionHeader from '@/components/ui/SectionHeader'
import StatusBadge from '@/components/ui/StatusBadge'
import {
  getAllInventorySnapshots,
  getInventorySnapshotsForMaterial,
  type InventorySnapshot,
} from '@/lib/bom-cost-engine'
import { mockRawMaterials } from '@/lib/mock-data'
import { History, Calendar, User, FileText, DollarSign, TrendingUp, TrendingDown, Package, Filter } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { safeFormatCurrency } from '@/lib/safe-currency'
import { useCurrency } from '@/hooks/useCurrency'
import { getSafeCurrency } from '@/lib/safe-currency'

export default function InventoryHistoryPage() {
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
  
  const [selectedMaterial, setSelectedMaterial] = useState<string | 'all'>('all')
  const [selectedType, setSelectedType] = useState<'all' | 'daily' | 'weekly' | 'monthly' | 'manual'>('all')
  const [expandedSnapshot, setExpandedSnapshot] = useState<string | null>(null)

  const allSnapshots = getAllInventorySnapshots()
  
  // Filter snapshots
  const filteredSnapshots = allSnapshots.filter(snapshot => {
    if (selectedMaterial !== 'all') {
      const hasMaterial = snapshot.materials.some(m => m.rawMaterialId === selectedMaterial)
      if (!hasMaterial) return false
    }
    if (selectedType !== 'all') {
      if (snapshot.snapshotType !== selectedType) return false
    }
    return true
  })

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const getTypeBadgeVariant = (type: string): 'info' | 'success' | 'warning' | 'error' => {
    switch (type) {
      case 'daily': return 'info'
      case 'weekly': return 'success'
      case 'monthly': return 'warning'
      case 'manual': return 'info'
      default: return 'info'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <SectionHeader 
        title={t('dashboard.inventoryHistory.title', { default: 'Inventory History & Audit Trail' })} 
        subtitle={t('dashboard.inventoryHistory.subtitle', { default: 'Complete immutable record of all inventory changes' })}
        icon={History}
      />

      {/* Filters */}
      <AppCard className="border-orange-500/20">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-400">{t('dashboard.inventoryHistory.filterBy', { default: 'Filter by' })}:</span>
          </div>
          
          <select
            value={selectedMaterial}
            onChange={(e) => setSelectedMaterial(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500"
          >
            <option value="all">{t('dashboard.inventoryHistory.allMaterials', { default: 'All Materials' })}</option>
            {mockRawMaterials.map(rm => (
              <option key={rm.id} value={rm.id}>{rm.name}</option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500"
          >
            <option value="all">{t('dashboard.inventoryHistory.allTypes', { default: 'All Types' })}</option>
            <option value="daily">{t('dashboard.inventoryHistory.daily', { default: 'Daily' })}</option>
            <option value="weekly">{t('dashboard.inventoryHistory.weekly', { default: 'Weekly' })}</option>
            <option value="monthly">{t('dashboard.inventoryHistory.monthly', { default: 'Monthly' })}</option>
            <option value="manual">{t('dashboard.inventoryHistory.manual', { default: 'Manual' })}</option>
          </select>
        </div>
      </AppCard>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AppCard className="border-orange-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">{t('dashboard.inventoryHistory.totalSnapshots', { default: 'Total Snapshots' })}</p>
              <p className="text-2xl font-bold text-white">{allSnapshots.length}</p>
            </div>
            <History className="h-8 w-8 text-orange-400" />
          </div>
        </AppCard>
        <AppCard className="border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">{t('dashboard.inventoryHistory.currentValue', { default: 'Current Value' })}</p>
              <p className="text-2xl font-bold text-green-400">
                {allSnapshots.length > 0 
                  ? safeFormatCurrency(allSnapshots[0].totalValueAfter, currency)
                  : safeFormatCurrency(0, currency)
                }
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-400" />
          </div>
        </AppCard>
        <AppCard className="border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">{t('dashboard.inventoryHistory.filteredResults', { default: 'Filtered Results' })}</p>
              <p className="text-2xl font-bold text-white">{filteredSnapshots.length}</p>
            </div>
            <Filter className="h-8 w-8 text-blue-400" />
          </div>
        </AppCard>
        <AppCard className="border-amber-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">{t('dashboard.inventoryHistory.lastSnapshot', { default: 'Last Snapshot' })}</p>
              <p className="text-sm font-bold text-white">
                {allSnapshots.length > 0 
                  ? formatDate(allSnapshots[0].performedAt)
                  : t('dashboard.inventoryHistory.none', { default: 'None' })
                }
              </p>
            </div>
            <Calendar className="h-8 w-8 text-amber-400" />
          </div>
        </AppCard>
      </div>

      {/* Inventory Snapshots */}
      {filteredSnapshots.length === 0 ? (
        <AppCard className="bg-gradient-to-br from-orange-500/5 to-amber-500/5 border-orange-500/20">
          <div className="text-center py-12">
            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">{t('dashboard.inventoryHistory.noSnapshots', { default: 'No inventory snapshots found' })}</p>
          </div>
        </AppCard>
      ) : (
        <div className="space-y-4">
          {filteredSnapshots.map((snapshot) => (
            <AppCard 
              key={snapshot.id}
              className="border-orange-500/20 hover:border-orange-500/40 transition-all"
            >
              {/* Snapshot Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-white">
                      {t('dashboard.inventoryHistory.snapshot', { default: 'Inventory Snapshot' })} #{snapshot.id.slice(-8)}
                    </h3>
                    <StatusBadge variant={getTypeBadgeVariant(snapshot.snapshotType)} size="sm">
                      {snapshot.snapshotType}
                    </StatusBadge>
                    {snapshot.isImmutable && (
                      <StatusBadge variant="info" size="sm">
                        {t('dashboard.inventoryHistory.immutable', { default: 'Immutable' })}
                      </StatusBadge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(snapshot.performedAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {snapshot.performedBy.name}
                      {snapshot.performedBy.role && ` (${snapshot.performedBy.role})`}
                    </div>
                    {snapshot.note && (
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {snapshot.note}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setExpandedSnapshot(expandedSnapshot === snapshot.id ? null : snapshot.id)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {expandedSnapshot === snapshot.id ? '▼' : '▶'}
                </button>
              </div>

              {/* Financial Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-3 bg-[#0f0f0f] rounded-xl border border-gray-800">
                  <p className="text-xs text-gray-400 mb-1">{t('dashboard.inventoryHistory.valueBefore', { default: 'Value Before' })}</p>
                  <p className="text-lg font-bold text-white">{safeFormatCurrency(snapshot.totalValueBefore, currency)}</p>
                </div>
                <div className="p-3 bg-[#0f0f0f] rounded-xl border border-gray-800">
                  <p className="text-xs text-gray-400 mb-1">{t('dashboard.inventoryHistory.valueAfter', { default: 'Value After' })}</p>
                  <p className="text-lg font-bold text-green-400">{safeFormatCurrency(snapshot.totalValueAfter, currency)}</p>
                </div>
                <div className={`p-3 bg-[#0f0f0f] rounded-xl border ${
                  snapshot.totalFinancialImpact >= 0 ? 'border-green-500/30' : 'border-red-500/30'
                }`}>
                  <p className="text-xs text-gray-400 mb-1">{t('dashboard.inventoryHistory.financialImpact', { default: 'Financial Impact' })}</p>
                  <div className="flex items-center gap-1">
                    {snapshot.totalFinancialImpact >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    )}
                    <p className={`text-lg font-bold ${
                      snapshot.totalFinancialImpact >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {safeFormatCurrency(snapshot.totalFinancialImpact, currency)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedSnapshot === snapshot.id && (
                <div className="pt-4 border-t border-gray-800 space-y-3">
                  <h4 className="font-semibold text-white mb-3">
                    {t('dashboard.inventoryHistory.materialDetails', { default: 'Material Details' })} ({snapshot.materials.length})
                  </h4>
                  {snapshot.materials.map((material) => (
                    <div
                      key={material.rawMaterialId}
                      className="p-3 bg-[#0f0f0f] rounded-xl border border-gray-800"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-semibold text-white">{material.rawMaterialName}</h5>
                        <div className={`flex items-center gap-1 ${
                          material.financialImpact >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {material.financialImpact >= 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          <span className="text-sm font-bold">
                            {safeFormatCurrency(material.financialImpact, currency)}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-sm">
                        <div>
                          <p className="text-gray-400">{t('dashboard.inventoryHistory.before', { default: 'Before' })}</p>
                          <p className="font-semibold text-white">{material.quantityBefore} {material.unit}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">{t('dashboard.inventoryHistory.after', { default: 'After' })}</p>
                          <p className="font-semibold text-white">{material.quantityAfter} {material.unit}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">{t('dashboard.inventoryHistory.difference', { default: 'Difference' })}</p>
                          <p className={`font-semibold ${
                            material.difference >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {material.difference >= 0 ? '+' : ''}{material.difference} {material.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">{t('dashboard.inventoryHistory.unitCost', { default: 'Unit Cost' })}</p>
                          <p className="font-semibold text-orange-400">{safeFormatCurrency(material.unitCost, currency)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </AppCard>
          ))}
        </div>
      )}
    </div>
  )
}

