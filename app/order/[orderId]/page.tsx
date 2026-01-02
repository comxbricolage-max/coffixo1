'use client'

// 🧪 DEMO MODE – NO DATABASE
// Public order tracking page - no authentication required
// TODO: Replace with real database queries when MongoDB is connected

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import AppCard from '@/components/ui/AppCard'
import StatusBadge from '@/components/ui/StatusBadge'
import { getOrderById, getOrderByTable, calculateOrderTimes, mockRestaurant } from '@/lib/mock-data'
import { Clock, CheckCircle, ChefHat, Package, Users, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'

export default function OrderTrackingPage() {
  let t: (key: string, params?: Record<string, string | number>) => string
  try {
    const translation = useTranslation()
    t = translation.t
  } catch {
    t = (key: string, params?: Record<string, string | number>) => {
      if (params) {
        return Object.entries(params).reduce((str, [k, v]) => str.replace(`{${k}}`, String(v)), key)
      }
      return key
    }
  }
  const params = useParams()
  // Support both orderId and tableId for backward compatibility
  const orderIdOrTable = (params?.orderId || params?.tableId) as string
  const [order, setOrder] = useState<any>(null)
  const [times, setTimes] = useState<any>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    // Try to find order by ID first, then by table number
    let foundOrder = getOrderById(orderIdOrTable)
    if (!foundOrder) {
      foundOrder = getOrderByTable(orderIdOrTable)
    }
    
    if (foundOrder) {
      setOrder(foundOrder)
      const calculatedTimes = calculateOrderTimes(foundOrder)
      setTimes(calculatedTimes)
    }
    
    // Update time every 10 seconds for live tracking
    const interval = setInterval(() => {
      setCurrentTime(new Date())
      if (foundOrder) {
        const updatedTimes = calculateOrderTimes(foundOrder)
        setTimes(updatedTimes)
      }
    }, 10000)
    
    return () => clearInterval(interval)
  }, [orderIdOrTable])

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-charcoal-950 via-charcoal-900 to-charcoal-800 flex items-center justify-center p-4">
        <AppCard className="max-w-md w-full text-center border-orange-500/20">
          <h2 className="text-2xl font-bold text-white mb-4">{t('dashboard.orderTracking.orderNotFound')}</h2>
          <p className="text-gray-400 mb-6">{t('dashboard.orderTracking.orderNotFoundDesc')}</p>
          <Link href="/" className="text-orange-400 hover:text-orange-300 font-semibold">
            {t('dashboard.orderTracking.returnHome')}
          </Link>
        </AppCard>
      </div>
    )
  }

  const statusSteps = [
    { key: 'pending', label: t('dashboard.orderTracking.orderReceived'), icon: Package, color: 'amber' },
    { key: 'preparing', label: t('dashboard.orderTracking.preparing'), icon: ChefHat, color: 'orange' },
    { key: 'ready', label: t('dashboard.orderTracking.ready'), icon: CheckCircle, color: 'green' },
    { key: 'served', label: t('dashboard.orderTracking.served'), icon: Users, color: 'blue' },
  ]

  const currentStepIndex = statusSteps.findIndex(step => step.key === order.status)
  const statusIndex = ['pending', 'preparing', 'ready', 'served'].indexOf(order.status)

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal-950 via-charcoal-900 to-charcoal-800 p-4">
      <div className="max-w-2xl mx-auto space-y-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-semibold">{t('dashboard.orderTracking.backToRestaurant', { name: mockRestaurant.name })}</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{t('dashboard.orderTracking.title')}</h1>
          <p className="text-gray-400">{t('dashboard.orderTracking.table')} {order.tableNumber}</p>
        </div>

        {/* Order Status Timeline */}
        <AppCard className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-amber-500/5">
          <h2 className="text-xl font-bold text-white mb-6">{t('dashboard.orderTracking.orderStatus')}</h2>
          <div className="space-y-6">
            {statusSteps.map((step, index) => {
              const StepIcon = step.icon
              const isCompleted = index <= statusIndex
              const isCurrent = index === statusIndex
              
              return (
                <div key={step.key} className="flex items-start gap-4">
                  {/* Timeline Line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCompleted
                        ? `bg-${step.color}-500/20 border-${step.color}-500/50 text-${step.color}-400`
                        : 'bg-gray-800 border-gray-700 text-gray-500'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : (
                        <StepIcon className="h-6 w-6" />
                      )}
                    </div>
                    {index < statusSteps.length - 1 && (
                      <div className={`w-0.5 h-16 mt-2 ${
                        isCompleted ? `bg-${step.color}-500/30` : 'bg-gray-800'
                      }`} />
                    )}
                  </div>
                  
                  {/* Step Content */}
                  <div className="flex-1 pt-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-bold text-lg ${
                        isCurrent ? 'text-white' : isCompleted ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        {step.label}
                      </h3>
                      {isCurrent && (
                        <StatusBadge variant={step.color as any}>
                          {t('dashboard.orderTracking.current')}
                        </StatusBadge>
                      )}
                    </div>
                    {isCurrent && times?.estimatedTimeRemaining !== null && (
                      <p className="text-sm text-orange-400 flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {t('dashboard.orderTracking.estimatedRemaining', { minutes: times.estimatedTimeRemaining })}
                      </p>
                    )}
                    {isCompleted && index === statusIndex && (
                      <p className="text-xs text-gray-400 mt-1">
                        {order.status === 'served' && order.servedAt
                          ? t('dashboard.orderTracking.servedAt', { time: order.servedAt.toLocaleTimeString() })
                          : t('dashboard.orderTracking.completed')}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </AppCard>

        {/* Order Details */}
        <AppCard className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
          <h2 className="text-xl font-bold text-white mb-4">{t('dashboard.orderTracking.orderDetails')}</h2>
          <div className="space-y-3">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-[#0f0f0f] rounded-xl border border-gray-800">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white w-8">{item.quantity}x</span>
                  <div>
                    <p className="font-semibold text-white">{item.productName}</p>
                    {item.customization?.size && (
                      <p className="text-xs text-gray-400">{t('dashboard.orderTracking.size')}: {item.customization.size}</p>
                    )}
                  </div>
                </div>
                <span className="font-bold text-orange-400">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
            <span className="text-lg font-semibold text-white">{t('dashboard.orderTracking.total')}</span>
            <span className="text-2xl font-bold text-orange-400">${order.total.toFixed(2)}</span>
          </div>
        </AppCard>

        {/* Order Timeline Info */}
        {(order.acceptedAt || order.startedAt || order.readyAt || order.servedAt) && (
          <AppCard className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
            <h2 className="text-xl font-bold text-white mb-4">{t('dashboard.orderTracking.timeline')}</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">{t('dashboard.orderTracking.orderPlaced')}</span>
                <span className="text-white">{order.createdAt.toLocaleTimeString()}</span>
              </div>
              {order.acceptedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">{t('dashboard.orderTracking.accepted')}</span>
                  <span className="text-white">{order.acceptedAt.toLocaleTimeString()}</span>
                </div>
              )}
              {order.startedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">{t('dashboard.orderTracking.kitchenStarted')}</span>
                  <span className="text-white">{order.startedAt.toLocaleTimeString()}</span>
                </div>
              )}
              {order.readyAt && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">{t('dashboard.orderTracking.readyAt')}</span>
                  <span className="text-white">{order.readyAt.toLocaleTimeString()}</span>
                </div>
              )}
              {order.servedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">{t('dashboard.orderTracking.servedAtTime')}</span>
                  <span className="text-white">{order.servedAt.toLocaleTimeString()}</span>
                </div>
              )}
            </div>
          </AppCard>
        )}

        {/* Notes */}
        {order.notes && (
          <AppCard className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-yellow-500/5">
            <h3 className="text-lg font-bold text-white mb-2">{t('dashboard.orderTracking.specialNotes')}</h3>
            <p className="text-gray-300">{order.notes}</p>
          </AppCard>
        )}
      </div>
    </div>
  )
}

