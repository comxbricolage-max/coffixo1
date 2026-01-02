import { Order } from '@/lib/mock-data'
import { Package, ChefHat, CheckCircle, Users, Clock } from 'lucide-react'
import StatusBadge from './StatusBadge'

interface OrderTimelineProps {
  order: Order
  estimatedTimeRemaining?: number | null
}

export default function OrderTimeline({ order, estimatedTimeRemaining }: OrderTimelineProps) {
  const statusSteps = [
    { key: 'pending', label: 'Order Received', icon: Package, color: 'amber' },
    { key: 'preparing', label: 'Preparing', icon: ChefHat, color: 'orange' },
    { key: 'ready', label: 'Ready', icon: CheckCircle, color: 'green' },
    { key: 'served', label: 'Served', icon: Users, color: 'blue' },
  ]

  const statusIndex = ['pending', 'preparing', 'ready', 'served'].indexOf(order.status)

  return (
    <div className="space-y-4">
      {statusSteps.map((step, index) => {
        const StepIcon = step.icon
        const isCompleted = index <= statusIndex
        const isCurrent = index === statusIndex
        
        return (
          <div key={step.key} className="flex items-start gap-4">
            {/* Timeline Icon */}
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                isCompleted
                  ? `bg-${step.color}-500/20 border-${step.color}-500/50 text-${step.color}-400`
                  : 'bg-gray-800 border-gray-700 text-gray-500'
              }`}>
                {isCompleted ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <StepIcon className="h-5 w-5" />
                )}
              </div>
              {index < statusSteps.length - 1 && (
                <div className={`w-0.5 h-12 mt-2 ${
                  isCompleted ? `bg-${step.color}-500/30` : 'bg-gray-800'
                }`} />
              )}
            </div>
            
            {/* Step Content */}
            <div className="flex-1 pt-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className={`font-semibold ${
                  isCurrent ? 'text-white' : isCompleted ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  {step.label}
                </h3>
                {isCurrent && (
                  <StatusBadge variant={step.color as any} size="sm">
                    Current
                  </StatusBadge>
                )}
              </div>
              {isCurrent && estimatedTimeRemaining !== null && estimatedTimeRemaining !== undefined && (
                <p className="text-xs text-orange-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  ~{estimatedTimeRemaining} min remaining
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

