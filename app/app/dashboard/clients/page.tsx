'use client'

// 🧪 DEMO MODE – NO DATABASE
// TODO: Replace with real database queries when MongoDB is connected

import AppCard from '@/components/ui/AppCard'
import StatusBadge from '@/components/ui/StatusBadge'
import SectionHeader from '@/components/ui/SectionHeader'
import KPIStatCard from '@/components/ui/KPIStatCard'
import EmptyState from '@/components/ui/EmptyState'
import { mockClients, mockProducts } from '@/lib/mock-data'
import { UserCircle, ShoppingBag, DollarSign, Heart } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { safeFormatCurrency } from '@/lib/safe-currency'
import { useCurrency } from '@/hooks/useCurrency'
import { getSafeCurrency } from '@/lib/safe-currency'

export default function ClientsPage() {
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
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <SectionHeader 
        title={t('dashboard.clients.title')} 
        subtitle={t('dashboard.clients.subtitle')}
        icon={UserCircle}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPIStatCard
          label={t('dashboard.clients.totalClients')}
          value={mockClients.length}
          icon={UserCircle}
          gradient="orange"
        />
        <KPIStatCard
          label={t('dashboard.clients.totalOrders')}
          value={mockClients.reduce((sum, c) => sum + c.totalOrders, 0)}
          icon={ShoppingBag}
          gradient="amber"
        />
        <KPIStatCard
          label={t('dashboard.clients.totalRevenue')}
          value={safeFormatCurrency(mockClients.reduce((sum, c) => sum + c.totalSpent, 0), currency ?? 'MAD')}
          icon={DollarSign}
          gradient="green"
        />
      </div>

      {/* Clients List */}
      <SectionHeader 
        title={t('dashboard.clients.allClients')} 
        subtitle={t('dashboard.clients.allClientsSubtitle')}
        icon={UserCircle}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockClients.map((client) => {
          const favoriteProducts = mockProducts.filter(p => 
            client.favoriteItems.includes(p.id)
          )

          return (
            <AppCard 
              key={client.id}
              className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-amber-500/5 hover:scale-[1.02] transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 flex items-center justify-center">
                    <UserCircle className="h-6 w-6 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">
                      {client.name || t('dashboard.clients.anonymousCustomer')}
                    </h3>
                    {client.email && (
                      <p className="text-sm text-gray-400">{client.email}</p>
                    )}
                    {client.phone && (
                      <p className="text-sm text-gray-400">{client.phone}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{t('dashboard.clients.totalOrders')}</span>
                  <span className="font-semibold text-white">{client.totalOrders}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{t('dashboard.clients.totalSpent')}</span>
                  <span className="font-semibold text-orange-400">{safeFormatCurrency(client.totalSpent, currency ?? 'MAD')}</span>
                </div>
                {client.lastOrderAt && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{t('dashboard.clients.lastOrder')}</span>
                    <span className="text-white">
                      {new Date(client.lastOrderAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
              {favoriteProducts.length > 0 && (
                <div className="pt-4 border-t border-gray-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-4 w-4 text-red-400" />
                    <span className="text-sm font-semibold text-gray-300">{t('dashboard.clients.favoriteItems')}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {favoriteProducts.map((product) => (
                      <StatusBadge key={product.id} variant="info" size="sm">
                        {product.name}
                      </StatusBadge>
                    ))}
                  </div>
                </div>
              )}
            </AppCard>
          )
        })}
      </div>

      {mockClients.length === 0 && (
        <AppCard className="bg-gradient-to-br from-orange-500/5 to-amber-500/5 border-orange-500/20">
          <EmptyState
            icon={<UserCircle className="h-12 w-12 text-orange-400" />}
            title={t('dashboard.clients.noClients')}
            description={t('dashboard.clients.noClientsDesc')}
          />
        </AppCard>
      )}
    </div>
  )
}
