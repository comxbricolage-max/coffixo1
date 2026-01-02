'use client'

// 🧪 DEMO MODE – NO DATABASE
// Reception / Cashier Dashboard - Payment & Order Flow
// TODO: Replace with real database queries when MongoDB is connected

import { useState, useEffect } from 'react'
import AppCard from '@/components/ui/AppCard'
import KPIStatCard from '@/components/ui/KPIStatCard'
import StatusBadge from '@/components/ui/StatusBadge'
import SectionHeader from '@/components/ui/SectionHeader'
import GradientButton from '@/components/ui/GradientButton'
import { getReceptionAnalytics } from '@/lib/analytics'
import { mockOrders, type Order } from '@/lib/mock-data'
import { 
  ShoppingCart, 
  DollarSign, 
  Clock, 
  AlertCircle,
  CheckCircle,
  Activity,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import { safeFormatCurrency } from '@/lib/safe-currency'
import { useCurrency } from '@/hooks/useCurrency'
import { getSafeCurrency } from '@/lib/safe-currency'

export default function ReceptionDashboardPage() {
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

  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [analytics, setAnalytics] = useState(getReceptionAnalytics())

  // Refresh analytics every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setAnalytics(getReceptionAnalytics())
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const pendingOrders = orders.filter(o => o.status === 'pending')
  const readyOrders = orders.filter(o => o.status === 'ready')
  const servedOrders = orders.filter(o => o.status === 'served')

  const getTimeElapsed = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000)
    if (minutes < 1) return t('dashboard.reception.justNow')
    if (minutes < 60) return `${minutes}m`
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1a1a] via-[#252525] to-[#1a1a1a] border border-gray-800/50 p-8 md:p-12">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-transparent" />
        <div className="relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-500/10">
              <ShoppingCart className="h-8 w-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {t('dashboard.reception.title')}
              </h1>
              <p className="text-lg text-gray-400">
                {t('dashboard.reception.subtitle')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPIStatCard
          label={t('dashboard.reception.ordersReceived')}
          value={analytics.ordersReceived}
          icon={ShoppingCart}
          gradient="blue"
        />
        <KPIStatCard
          label={t('dashboard.reception.ordersServed')}
          value={analytics.ordersServed}
          icon={CheckCircle}
          gradient="green"
        />
        <KPIStatCard
          label={t('dashboard.reception.pendingPayments')}
          value={analytics.pendingPayments}
          icon={DollarSign}
          gradient="orange"
        />
        <KPIStatCard
          label={t('dashboard.reception.todayRevenue')}
          value={safeFormatCurrency(analytics.todayRevenue, currency)}
          icon={TrendingUp}
          gradient="green"
        />
      </div>

      {/* Payment Flow */}
      <AppCard className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-indigo-500/5">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="h-6 w-6 text-blue-400" />
          <h2 className="text-xl font-bold text-white">{t('dashboard.reception.paymentFlow')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[#0f0f0f] rounded-xl border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">{t('dashboard.reception.pending')}</span>
              <StatusBadge variant="pending">{analytics.paymentFlow.pending}</StatusBadge>
            </div>
            <p className="text-2xl font-bold text-white">{analytics.paymentFlow.pending}</p>
            <p className="text-xs text-gray-400 mt-1">{t('dashboard.reception.awaitingPreparation')}</p>
          </div>
          <div className="p-4 bg-[#0f0f0f] rounded-xl border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">{t('dashboard.reception.ready')}</span>
              <StatusBadge variant="ready">{analytics.paymentFlow.ready}</StatusBadge>
            </div>
            <p className="text-2xl font-bold text-white">{analytics.paymentFlow.ready}</p>
            <p className="text-xs text-gray-400 mt-1">{t('dashboard.reception.readyForPaymentStatus')}</p>
          </div>
          <div className="p-4 bg-[#0f0f0f] rounded-xl border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">{t('dashboard.reception.served')}</span>
              <StatusBadge variant="served">{analytics.paymentFlow.served}</StatusBadge>
            </div>
            <p className="text-2xl font-bold text-white">{analytics.paymentFlow.served}</p>
            <p className="text-xs text-gray-400 mt-1">{t('dashboard.reception.paymentPending')}</p>
          </div>
        </div>
      </AppCard>

      {/* Order Delays */}
      {analytics.orderDelays.count > 0 && (
        <AppCard className="border-red-500/20 bg-gradient-to-br from-red-500/5 to-orange-500/5">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="h-6 w-6 text-red-400" />
            <h2 className="text-xl font-bold text-white">{t('dashboard.reception.orderDelays')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-sm text-red-400 mb-1">{t('dashboard.reception.delayedOrders')}</p>
              <p className="text-3xl font-bold text-red-400">{analytics.orderDelays.count}</p>
            </div>
            <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
              <p className="text-sm text-orange-400 mb-1">{t('dashboard.reception.avgDelay')}</p>
              <p className="text-3xl font-bold text-orange-400">{analytics.orderDelays.avgDelay} min</p>
            </div>
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-sm text-red-400 mb-1">{t('dashboard.reception.longestDelay')}</p>
              <p className="text-3xl font-bold text-red-400">{analytics.orderDelays.longestDelay} min</p>
            </div>
          </div>
        </AppCard>
      )}

      {/* Ready Orders (Payment Pending) */}
      <SectionHeader 
        title={t('dashboard.reception.readyForPayment')} 
        subtitle={t('dashboard.reception.readyForPaymentSubtitle')}
        icon={CheckCircle}
        action={
          <Link href="/app/dashboard/orders">
            <GradientButton variant="outline" size="sm">
              {t('common.viewAllOrders')}
            </GradientButton>
          </Link>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {readyOrders.length > 0 ? (
          readyOrders.map((order) => (
            <AppCard 
              key={order.id}
              className="border-green-500/30 bg-gradient-to-br from-green-500/5 to-emerald-500/5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{t('dashboard.reception.table')} {order.tableNumber}</h3>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-400">
                      {t('dashboard.reception.readyAgo')} {getTimeElapsed(order.createdAt)} {t('dashboard.reception.ago')}
                    </span>
                  </div>
                </div>
                <StatusBadge variant="ready">{t('dashboard.reception.ready')}</StatusBadge>
              </div>
              <div className="space-y-2 mb-3">
                {order.items.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm p-2 bg-[#0f0f0f] rounded-lg">
                    <span className="text-gray-300">
                      {item.quantity}x {item.productName}
                    </span>
                    <span className="text-gray-400">{safeFormatCurrency(item.price * item.quantity, currency)}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                <span className="text-sm text-gray-400">{t('common.total')}</span>
                <span className="text-2xl font-bold text-green-400">{safeFormatCurrency(order.total, currency)}</span>
              </div>
              <GradientButton variant="green" fullWidth className="mt-3">
                {t('dashboard.reception.processPayment')}
              </GradientButton>
            </AppCard>
          ))
        ) : (
          <AppCard className="border-gray-800 bg-[#0f0f0f]">
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
              <p className="text-gray-400">{t('dashboard.reception.noOrdersReadyForPayment')}</p>
            </div>
          </AppCard>
        )}
      </div>

      {/* Pending Orders */}
      {pendingOrders.length > 0 && (
        <SectionHeader 
          title={t('dashboard.reception.newOrders')} 
          subtitle={t('dashboard.reception.newOrdersSubtitle')}
          icon={ShoppingCart}
        />
      )}
      {pendingOrders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingOrders.slice(0, 4).map((order) => (
            <AppCard 
              key={order.id}
              className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{t('dashboard.reception.table')} {order.tableNumber}</h3>
                  <span className="text-xs text-gray-400">{getTimeElapsed(order.createdAt)} {t('dashboard.reception.ago')}</span>
                </div>
                <StatusBadge variant="pending">{t('dashboard.reception.pending')}</StatusBadge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">{order.items.length} items</span>
                <span className="text-lg font-bold text-white">{safeFormatCurrency(order.total, currency)}</span>
              </div>
            </AppCard>
          ))}
        </div>
      )}
    </div>
  )
}

