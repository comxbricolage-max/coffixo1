'use client'

// 🧪 DEMO MODE – NO DATABASE
// TODO: Replace with real database queries when MongoDB is connected

import { useState } from 'react'
import AppCard from '@/components/ui/AppCard'
import StatusBadge from '@/components/ui/StatusBadge'
import SectionHeader from '@/components/ui/SectionHeader'
import GradientButton from '@/components/ui/GradientButton'
import KPIStatCard from '@/components/ui/KPIStatCard'
import EmptyState from '@/components/ui/EmptyState'
import { mockCategories, mockProducts, type Product, calculateProductCost, calculateProductMargin } from '@/lib/mock-data'
import { Utensils, Plus, Edit, ToggleLeft, ToggleRight, Coffee, Flame, Image as ImageIcon, DollarSign } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { safeFormatCurrency } from '@/lib/safe-currency'
import { useCurrency } from '@/hooks/useCurrency'
import { getSafeCurrency } from '@/lib/safe-currency'

export default function MenuPage() {
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
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [showAddModal, setShowAddModal] = useState(false)

  const toggleProductAvailability = (productId: string) => {
    setProducts(products.map(product =>
      product.id === productId ? { ...product, available: !product.available } : product
    ))
  }

  // Calculate bestsellers (mock logic - products with most orders)
  const bestsellers = ['prod-2', 'prod-5', 'prod-1'] // Mock bestseller IDs

  const getCategoryIcon = (categoryName: string) => {
    if (categoryName.toLowerCase().includes('coffee') || categoryName.toLowerCase().includes('drink')) {
      return <Coffee className="h-5 w-5" />
    }
    return <Utensils className="h-5 w-5" />
  }

  const totalProducts = products.length
  const availableProducts = products.filter(p => p.available).length
  const unavailableProducts = totalProducts - availableProducts

  return (
    <div className="space-y-8">
      {/* Header */}
      <SectionHeader 
        title={t('dashboard.menu.title')} 
        subtitle={t('dashboard.menu.subtitle')}
        icon={Utensils}
        action={
          <GradientButton variant="orange" onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4" />
            {t('dashboard.menu.addProduct')}
          </GradientButton>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPIStatCard
          label={t('dashboard.menu.totalProducts')}
          value={totalProducts}
          icon={Utensils}
          gradient="orange"
        />
        <KPIStatCard
          label={t('dashboard.menu.availableProducts')}
          value={availableProducts}
          icon={ToggleRight}
          gradient="green"
        />
        <KPIStatCard
          label={t('dashboard.menu.unavailableProducts')}
          value={unavailableProducts}
          icon={ToggleLeft}
          gradient="red"
        />
      </div>

      {/* Categories */}
      <SectionHeader 
        title={t('dashboard.menu.categories')} 
        subtitle={t('dashboard.menu.organizeByCategory')}
        icon={Utensils}
        action={
          <GradientButton variant="outline" size="sm">
            <Plus className="h-4 w-4" />
            {t('dashboard.menu.addCategory')}
          </GradientButton>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockCategories.map((category, index) => {
          const categoryProducts = products.filter(p => p.categoryId === category.id)
          const categoryIcon = getCategoryIcon(category.name)
          const gradients = [
            'from-orange-500/10 to-amber-500/10 border-orange-500/30',
            'from-amber-500/10 to-yellow-500/10 border-amber-500/30',
            'from-cream-500/10 to-orange-500/10 border-cream-500/30',
            'from-caramel-500/10 to-amber-500/10 border-caramel-500/30',
          ]
          return (
            <AppCard 
              key={category.id} 
              className={`cursor-pointer bg-gradient-to-br ${gradients[index % gradients.length]} hover:scale-105 transition-all`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 flex items-center justify-center">
                      {categoryIcon}
                    </div>
                    <h3 className="font-bold text-lg text-white">{category.name}</h3>
                  </div>
                  {category.description && (
                    <p className="text-sm text-gray-400 mb-3">{category.description}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <StatusBadge variant="info" size="sm">
                      {categoryProducts.length} {t('dashboard.menu.items')}
                    </StatusBadge>
                    {categoryProducts.filter(p => p.available).length < categoryProducts.length && (
                      <StatusBadge variant="warning" size="sm">
                        {categoryProducts.filter(p => !p.available).length} {t('dashboard.menu.unavailableCount')}
                      </StatusBadge>
                    )}
                  </div>
                </div>
              </div>
            </AppCard>
          )
        })}
      </div>

      {/* Products by Category */}
      {mockCategories.map((category) => {
        const categoryProducts = products.filter(p => p.categoryId === category.id)
        if (categoryProducts.length === 0) return <div key={category.id} />

        return (
          <div key={category.id} className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 flex items-center justify-center">
                {getCategoryIcon(category.name)}
              </div>
              <h2 className="text-2xl font-bold text-white">{category.name}</h2>
              <StatusBadge variant="info">{categoryProducts.length} {t('dashboard.menu.products')}</StatusBadge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryProducts.map((product) => {
                const isBestseller = bestsellers.includes(product.id)
                return (
                  <AppCard 
                    key={product.id} 
                    className="hover:scale-[1.02] transition-all group overflow-hidden border-2 hover:border-orange-500/40"
                  >
                    {/* Product Image Placeholder */}
                    <div className="relative h-40 bg-gradient-to-br from-orange-500/10 via-amber-500/10 to-yellow-500/10 mb-4 rounded-xl flex items-center justify-center overflow-hidden border border-orange-500/20">
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5" />
                      <ImageIcon className="h-16 w-16 text-orange-400/50 relative z-10" />
                      {isBestseller && (
                        <div className="absolute top-3 right-3 z-20">
                          <StatusBadge variant="warning">
                            <Flame className="h-3 w-3" />
                            {t('dashboard.menu.bestseller')}
                          </StatusBadge>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-xl text-white">{product.name}</h3>
                            {product.available ? (
                              <StatusBadge variant="success" size="sm">{t('dashboard.menu.available')}</StatusBadge>
                            ) : (
                              <StatusBadge variant="error" size="sm">{t('dashboard.menu.unavailable')}</StatusBadge>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 mb-3 line-clamp-2">{product.description}</p>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                                {safeFormatCurrency(product.price, currency)}
                              </p>
                              {product.categoryId === 'cat-1' && (
                                <StatusBadge variant="warning" size="sm">
                                  {t('dashboard.menu.hot')}
                                </StatusBadge>
                              )}
                            </div>
                            {/* Cost & Profit Info */}
                            {(() => {
                              const cost = calculateProductCost(product.id)
                              const margin = calculateProductMargin(product.id, product.price)
                              const profit = product.price - cost
                              if (cost > 0) {
                                return (
                                  <div className="flex items-center gap-3 text-xs pt-2 border-t border-gray-800">
                                    <div className="flex items-center gap-1">
                                      <DollarSign className="h-3 w-3 text-gray-400" />
                                      <span className="text-gray-400">{t('dashboard.menu.cost')}:</span>
                                      <span className="text-orange-400 font-semibold">{safeFormatCurrency(cost, currency)}</span>
                                    </div>
                                    <span className="text-gray-600">•</span>
                                    <div className="flex items-center gap-1">
                                      <span className="text-gray-400">{t('dashboard.menu.profit')}:</span>
                                      <span className="text-green-400 font-semibold">{safeFormatCurrency(profit, currency)}</span>
                                    </div>
                                    <span className="text-gray-600">•</span>
                                    <StatusBadge 
                                      variant={margin > 60 ? 'success' : margin > 40 ? 'warning' : 'error'} 
                                      size="sm"
                                    >
                                      {margin.toFixed(0)}% {t('dashboard.menu.margin')}
                                    </StatusBadge>
                                  </div>
                                )
                              }
                              return <span key="empty" />
                            })()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-4 border-t border-gray-800">
                        <GradientButton 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                        >
                          <Edit className="h-4 w-4" />
                          {t('dashboard.menu.edit')}
                        </GradientButton>
                        <button
                          onClick={() => toggleProductAvailability(product.id)}
                          className={`p-2.5 rounded-xl transition-all ${
                            product.available 
                              ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30' 
                              : 'bg-gray-800 hover:bg-gray-700 text-gray-400 border border-gray-700'
                          }`}
                          aria-label={product.available ? t('dashboard.menu.markUnavailable') : t('dashboard.menu.markAvailable')}
                        >
                          {product.available ? (
                            <ToggleRight className="h-5 w-5" />
                          ) : (
                            <ToggleLeft className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </AppCard>
                )
              })}
            </div>
          </div>
        )
      })}

      {products.length === 0 && (
        <AppCard className="bg-gradient-to-br from-orange-500/5 to-amber-500/5 border-orange-500/20">
          <EmptyState
            icon={<Utensils className="h-12 w-12 text-orange-400" />}
            title={t('dashboard.menu.noProducts')}
            description={t('dashboard.menu.noProductsDesc')}
            action={
              <GradientButton 
                onClick={() => setShowAddModal(true)}
                variant="orange"
              >
                <Plus className="h-4 w-4" />
                {t('dashboard.menu.addProduct')}
              </GradientButton>
            }
          />
        </AppCard>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <AppCard className="max-w-md w-full border-orange-500/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">{t('dashboard.menu.addProduct')}</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white text-2xl leading-none transition-colors"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              {t('dashboard.menu.productCreationNote')}
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
