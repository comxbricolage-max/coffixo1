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
import { mockOrders, type Order, calculateOrderTimes } from '@/lib/mock-data'
import { Clock, ChefHat, CheckCircle, Users, AlertCircle, TrendingUp, ShoppingCart, DollarSign, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import { safeFormatCurrency } from '@/lib/safe-currency'
import { useCurrency } from '@/hooks/useCurrency'
import { getSafeCurrency } from '@/lib/safe-currency'

export default function OrdersPage() {
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

  const [orders, setOrders] = useState(mockOrders)

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    const now = new Date()
    setOrders(orders.map(order => {
      if (order.id !== orderId) return order
      
      const updated: Order = { ...order, status: newStatus }
      
      // Set timestamps based on status change
      if (newStatus === 'preparing' && !order.acceptedAt) {
        updated.acceptedAt = now
        updated.acceptedBy = 'staff-3' // Mock staff assignment
      }
      if (newStatus === 'preparing' && !order.startedAt) {
        updated.startedAt = now
        updated.preparedBy = 'staff-2' // Mock kitchen staff
      }
      if (newStatus === 'ready' && !order.readyAt) {
        updated.readyAt = now
      }
      if (newStatus === 'served' && !order.servedAt) {
        updated.servedAt = now
        updated.servedBy = 'staff-3' // Mock waiter
      }
      
      // Recalculate times
      const times = calculateOrderTimes(updated)
      updated.preparationTime = times.preparationTime || undefined
      updated.serviceTime = times.serviceTime || undefined
      updated.totalCycleTime = times.totalCycleTime || undefined
      
      return updated
    }))
  }

  const pendingOrders = orders.filter(o => o.status === 'pending')
  const preparingOrders = orders.filter(o => o.status === 'preparing')
  const readyOrders = orders.filter(o => o.status === 'ready')
  const servedOrders = orders.filter(o => o.status === 'served')

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const getTimeElapsed = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000)
    if (minutes < 1) return t('dashboard.orders.justNow')
    if (minutes < 60) return `${minutes}${t('dashboard.orders.minutes')}`
    const hours = Math.floor(minutes / 60)
    return `${hours}${t('dashboard.orders.hours')} ${minutes % 60}${t('dashboard.orders.minutes')}`
  }

  const getTimeElapsedColor = (date: Date, status: string) => {
    if (status === 'served') return 'text-gray-400'
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000)
    if (minutes > 20) return 'text-red-400 font-semibold'
    if (minutes > 10) return 'text-orange-400'
    return 'text-gray-400'
  }

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0

  const OrderCard = ({ order, status }: { order: Order; status: string }) => {
    const times = calculateOrderTimes(order)
    
    return (
      <AppCard className={`p-4 border-2 mb-3 hover:scale-[1.02] transition-all cursor-pointer ${
        status === 'pending' ? 'border-amber-500/30 bg-amber-500/5' :
        status === 'preparing' ? 'border-orange-500/30 bg-orange-500/5' :
        status === 'ready' ? 'border-green-500/30 bg-green-500/5' :
        'border-blue-500/30 bg-blue-500/5'
      }`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl font-bold text-white">{t('dashboard.orders.table', { number: order.tableNumber })}</span>
              <StatusBadge variant={status as any} size="sm">
                {formatTime(order.createdAt)}
              </StatusBadge>
              <Link 
                href={`/order/${order.id}`}
                target="_blank"
                className="text-orange-400 hover:text-orange-300 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Clock className={`h-3 w-3 ${getTimeElapsedColor(order.createdAt, status)}`} />
              <span className={`text-xs ${getTimeElapsedColor(order.createdAt, status)}`}>
                {getTimeElapsed(order.createdAt)}
              </span>
              {times.estimatedTimeRemaining !== null && times.estimatedTimeRemaining !== undefined && (
                <>
                  <span className="text-gray-600">•</span>
                  <span className="text-xs text-orange-400">
                    ~{times.estimatedTimeRemaining}{t('dashboard.orders.minutes')} {t('dashboard.orders.remaining')}
                  </span>
                </>
              )}
            </div>
            {/* Lifecycle times */}
            {(order.preparationTime || order.serviceTime || order.totalCycleTime) && (
              <div className="flex items-center gap-3 mt-2 text-xs">
                {order.preparationTime && (
                  <span className="text-gray-400">{t('dashboard.orders.prep')}: {order.preparationTime}{t('dashboard.orders.minutes')}</span>
                )}
                {order.serviceTime && (
                  <span className="text-gray-400">{t('dashboard.orders.service')}: {order.serviceTime}{t('dashboard.orders.minutes')}</span>
                )}
                {order.totalCycleTime && (
                  <span className="text-gray-400">{t('dashboard.orders.totalTime')}: {order.totalCycleTime}{t('dashboard.orders.minutes')}</span>
                )}
              </div>
            )}
          </div>
          <div className="text-end">
            <p className="text-2xl font-bold text-white">{safeFormatCurrency(order.total, currency)}</p>
            <p className="text-xs text-gray-400">{order.items.length} {t('dashboard.orders.itemCount')}</p>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-2 mb-3 bg-[#0f0f0f] rounded-xl p-3 border border-gray-800">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white w-6">{item.quantity}x</span>
                <span className="text-gray-300 flex-1">{item.productName}</span>
                {item.customization?.size && (
                  <StatusBadge variant="info" size="sm">
                    {item.customization.size}
                  </StatusBadge>
                )}
              </div>
              <span className="text-gray-300 font-medium">{safeFormatCurrency(item.price * item.quantity, currency)}</span>
            </div>
          ))}
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="mb-3 p-3 bg-amber-500/20 border border-amber-500/30 rounded-xl text-xs text-amber-300">
                <strong>{t('dashboard.orders.note')}:</strong> {order.notes}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-gray-800">
          {order.status === 'pending' && (
            <GradientButton
              size="sm"
              variant="orange"
              onClick={() => handleStatusChange(order.id, 'preparing')}
              fullWidth
            >
              <ChefHat className="h-4 w-4" />
                  {t('dashboard.orders.startPreparing')}
            </GradientButton>
          )}
          {order.status === 'preparing' && (
            <GradientButton
              size="sm"
              variant="green"
              onClick={() => handleStatusChange(order.id, 'ready')}
              fullWidth
            >
              <CheckCircle className="h-4 w-4" />
                  {t('dashboard.orders.markReady')}
            </GradientButton>
          )}
          {order.status === 'ready' && (
            <GradientButton
              size="sm"
              variant="blue"
              onClick={() => handleStatusChange(order.id, 'served')}
              fullWidth
            >
              <Users className="h-4 w-4" />
                  {t('dashboard.orders.markServed')}
            </GradientButton>
          )}
          {order.status === 'served' && (
            <div className="flex-1 text-center">
              <StatusBadge variant="success" size="sm">
                <CheckCircle className="h-3 w-3" />
                    {t('dashboard.orders.completed')}
              </StatusBadge>
            </div>
          )}
        </div>
      </AppCard>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <SectionHeader 
        title={t('dashboard.orders.title')} 
        subtitle={t('dashboard.orders.subtitle')}
        icon={ShoppingCart}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPIStatCard
          label={t('dashboard.orders.pending')}
          value={pendingOrders.length}
          icon={AlertCircle}
          gradient="amber"
        />
        <KPIStatCard
          label={t('dashboard.orders.preparing')}
          value={preparingOrders.length}
          icon={ChefHat}
          gradient="orange"
        />
        <KPIStatCard
          label={t('dashboard.orders.ready')}
          value={readyOrders.length}
          icon={CheckCircle}
          gradient="green"
        />
        <KPIStatCard
          label={t('dashboard.orders.served')}
          value={servedOrders.length}
          icon={Users}
          gradient="blue"
        />
      </div>

      {/* Revenue Summary */}
      <AppCard className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-amber-500/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-orange-300 mb-1">{t('dashboard.orders.totalRevenue')}</p>
            <p className="text-3xl font-bold text-white">{safeFormatCurrency(totalRevenue, currency)}</p>
            <p className="text-xs text-gray-400 mt-1">{t('dashboard.orders.avgPerOrder')}: {safeFormatCurrency(avgOrderValue, currency)} {t('dashboard.orders.perOrder')}</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
            <TrendingUp className="h-8 w-8 text-orange-400" />
          </div>
        </div>
      </AppCard>

      {/* Kanban Board */}
      <SectionHeader 
        title={t('dashboard.orders.orderPipeline')} 
        subtitle={t('dashboard.orders.pipelineSubtitle')}
        icon={ShoppingCart}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Column */}
        <div>
          <div className="mb-4 flex items-center gap-2 pb-3 border-b-2 border-amber-500/30">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-amber-400" />
            </div>
                <h2 className="text-lg font-bold text-white">{t('dashboard.orders.pending')}</h2>
            <StatusBadge variant="pending">{pendingOrders.length}</StatusBadge>
          </div>
          <div className="space-y-3 min-h-[200px]">
            {pendingOrders.length > 0 ? (
              pendingOrders.map((order) => (
                <OrderCard key={order.id} order={order} status="pending" />
              ))
            ) : (
              <EmptyState
                icon={<AlertCircle className="h-10 w-10 text-gray-600" />}
                    title={t('dashboard.orders.noPending')}
                    description={t('dashboard.orders.noPendingDesc')}
              />
            )}
          </div>
        </div>

        {/* Preparing Column */}
        <div>
          <div className="mb-4 flex items-center gap-2 pb-3 border-b-2 border-orange-500/30">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
              <ChefHat className="h-5 w-5 text-orange-400" />
            </div>
                <h2 className="text-lg font-bold text-white">{t('dashboard.orders.preparing')}</h2>
            <StatusBadge variant="preparing">{preparingOrders.length}</StatusBadge>
          </div>
          <div className="space-y-3 min-h-[200px]">
            {preparingOrders.length > 0 ? (
              preparingOrders.map((order) => (
                <OrderCard key={order.id} order={order} status="preparing" />
              ))
            ) : (
              <EmptyState
                icon={<ChefHat className="h-10 w-10 text-gray-600" />}
                    title={t('dashboard.orders.noPreparing')}
                    description={t('dashboard.orders.noPreparingDesc')}
              />
            )}
          </div>
        </div>

        {/* Ready Column */}
        <div>
          <div className="mb-4 flex items-center gap-2 pb-3 border-b-2 border-green-500/30">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
                <h2 className="text-lg font-bold text-white">{t('dashboard.orders.ready')}</h2>
            <StatusBadge variant="ready">{readyOrders.length}</StatusBadge>
          </div>
          <div className="space-y-3 min-h-[200px]">
            {readyOrders.length > 0 ? (
              readyOrders.map((order) => (
                <OrderCard key={order.id} order={order} status="ready" />
              ))
            ) : (
              <EmptyState
                icon={<CheckCircle className="h-10 w-10 text-gray-600" />}
                    title={t('dashboard.orders.noReady')}
                    description={t('dashboard.orders.noReadyDesc')}
              />
            )}
          </div>
        </div>

        {/* Served Column */}
        <div>
          <div className="mb-4 flex items-center gap-2 pb-3 border-b-2 border-blue-500/30">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
                <h2 className="text-lg font-bold text-white">{t('dashboard.orders.served')}</h2>
            <StatusBadge variant="served">{servedOrders.length}</StatusBadge>
          </div>
          <div className="space-y-3 min-h-[200px]">
            {servedOrders.length > 0 ? (
              servedOrders.map((order) => (
                <OrderCard key={order.id} order={order} status="served" />
              ))
            ) : (
              <EmptyState
                icon={<Users className="h-10 w-10 text-gray-600" />}
                    title={t('dashboard.orders.noServed')}
                    description={t('dashboard.orders.noServedDesc')}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
