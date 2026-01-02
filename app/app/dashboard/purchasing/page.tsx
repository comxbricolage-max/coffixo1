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
  mockPurchases,
  mockSuppliers,
  type Purchase,
  type Supplier,
} from '@/lib/mock-data'
import { ShoppingCart, Plus, FileText, TrendingUp, Calendar } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { safeFormatCurrency } from '@/lib/safe-currency'
import { useCurrency } from '@/hooks/useCurrency'
import { getSafeCurrency } from '@/lib/safe-currency'

export default function PurchasingPage() {
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
  
  const [purchases, setPurchases] = useState<Purchase[]>(mockPurchases)
  const [showAddModal, setShowAddModal] = useState(false)

  // Calculate totals
  const totalPurchases = purchases.length
  const totalSpent = purchases.reduce((sum, p) => sum + p.totalCost, 0)
  const thisMonthSpent = purchases
    .filter(p => {
      const purchaseDate = new Date(p.purchaseDate)
      const now = new Date()
      return purchaseDate.getMonth() === now.getMonth() && 
             purchaseDate.getFullYear() === now.getFullYear()
    })
    .reduce((sum, p) => sum + p.totalCost, 0)

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <SectionHeader 
        title={t('dashboard.purchasing.title')} 
        subtitle={t('dashboard.purchasing.subtitle')}
        icon={ShoppingCart}
        action={
          <GradientButton variant="orange" onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4" />
            {t('dashboard.purchasing.newPurchase')}
          </GradientButton>
        }
      />

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPIStatCard
          label={t('dashboard.purchasing.totalPurchases')}
          value={totalPurchases}
          icon={FileText}
          gradient="orange"
        />
        <KPIStatCard
          label={t('dashboard.purchasing.totalSpent')}
          value={safeFormatCurrency(totalSpent, currency)}
          icon={TrendingUp}
          gradient="amber"
        />
        <KPIStatCard
          label={t('dashboard.purchasing.thisMonth')}
          value={safeFormatCurrency(thisMonthSpent, currency)}
          icon={Calendar}
          gradient="green"
        />
      </div>

      {/* Suppliers */}
      <SectionHeader 
        title={t('dashboard.purchasing.suppliers')} 
        subtitle={t('dashboard.purchasing.suppliersSubtitle')}
        icon={ShoppingCart}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockSuppliers.map((supplier) => (
          <AppCard 
            key={supplier.id}
            className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-amber-500/5 hover:scale-[1.02] transition-all"
          >
            <h3 className="text-lg font-bold text-white mb-2">{supplier.name}</h3>
            {supplier.contactPerson && (
              <p className="text-sm text-gray-400 mb-1">{supplier.contactPerson}</p>
            )}
            {supplier.email && (
              <p className="text-xs text-gray-500">{supplier.email}</p>
            )}
            {supplier.phone && (
              <p className="text-xs text-gray-500">{supplier.phone}</p>
            )}
          </AppCard>
        ))}
      </div>

      {/* Purchase History */}
      <SectionHeader 
        title={t('dashboard.purchasing.purchaseHistory')} 
        subtitle={t('dashboard.purchasing.purchaseHistorySubtitle')}
        icon={FileText}
      />
      <div className="space-y-4">
        {purchases.map((purchase) => (
          <AppCard 
            key={purchase.id}
            className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-white">{purchase.supplierName}</h3>
                  <StatusBadge variant={purchase.type === 'direct_stock' ? 'info' : 'success'}>
                    {purchase.type === 'direct_stock' ? t('dashboard.purchasing.directStock') : t('dashboard.purchasing.rawMaterial')}
                  </StatusBadge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(purchase.purchaseDate)}
                  </span>
                  {purchase.invoiceNumber && (
                    <span>{t('dashboard.purchasing.invoice')}: {purchase.invoiceNumber}</span>
                  )}
                </div>
              </div>
              <div className="text-end">
                <p className="text-2xl font-bold text-orange-400">
                  {safeFormatCurrency(purchase.totalCost, currency)}
                </p>
                <p className="text-xs text-gray-400">{purchase.items.length} {t('dashboard.purchasing.items')}</p>
              </div>
            </div>

            {/* Purchase Items */}
            <div className="space-y-2">
              {purchase.items.map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-[#0f0f0f] rounded-xl border border-gray-800"
                >
                  <div>
                    <p className="font-semibold text-white">{item.itemName}</p>
                    <p className="text-xs text-gray-400">
                      {item.quantity} {item.unit} × {safeFormatCurrency(item.unitCost, currency)}
                    </p>
                  </div>
                  <p className="font-bold text-white">{safeFormatCurrency(item.totalCost, currency)}</p>
                </div>
              ))}
            </div>

            {purchase.notes && (
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <p className="text-sm text-amber-300">{purchase.notes}</p>
              </div>
            )}
          </AppCard>
        ))}
      </div>

      {/* Add Purchase Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <AppCard className="max-w-2xl w-full border-orange-500/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">{t('dashboard.purchasing.newPurchaseModalTitle')}</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white text-2xl leading-none transition-colors"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              {t('dashboard.purchasing.purchaseCreationNote')}
            </p>
            <GradientButton 
              onClick={() => setShowAddModal(false)} 
              variant="orange"
              fullWidth
            >
              {t('common.close')}
            </GradientButton>
          </AppCard>
        </div>
      )}
    </div>
  )
}

