import { StaffPerformance } from '@/lib/mock-data'
import AppCard from './AppCard'
import StatusBadge from './StatusBadge'
import { ChefHat, Users, Clock, TrendingUp, AlertCircle } from 'lucide-react'

interface StaffPerformanceCardProps {
  performance: StaffPerformance
}

export default function StaffPerformanceCard({ performance }: StaffPerformanceCardProps) {
  const getRoleIcon = () => {
    if (performance.role === 'kitchen') return <ChefHat className="h-5 w-5" />
    if (performance.role === 'waiter') return <Users className="h-5 w-5" />
    return <Users className="h-5 w-5" />
  }

  const getRoleGradient = () => {
    if (performance.role === 'kitchen') return 'from-red-500/10 to-orange-500/10 border-red-500/30'
    if (performance.role === 'waiter') return 'from-green-500/10 to-emerald-500/10 border-green-500/30'
    return 'from-orange-500/10 to-amber-500/10 border-orange-500/30'
  }

  return (
    <AppCard className={`bg-gradient-to-br ${getRoleGradient()}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl ${
            performance.role === 'kitchen' ? 'bg-red-500/20' : 'bg-green-500/20'
          } border ${
            performance.role === 'kitchen' ? 'border-red-500/30' : 'border-green-500/30'
          } flex items-center justify-center ${
            performance.role === 'kitchen' ? 'text-red-400' : 'text-green-400'
          }`}>
            {getRoleIcon()}
          </div>
          <div>
            <h3 className="font-bold text-white">{performance.staffName}</h3>
            <StatusBadge variant={performance.role === 'kitchen' ? 'warning' : 'success'} size="sm">
              {performance.role}
            </StatusBadge>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-[#0f0f0f] rounded-xl border border-gray-800">
          <span className="text-sm text-gray-400">Orders Handled</span>
          <span className="text-xl font-bold text-white">{performance.ordersHandled}</span>
        </div>

        {performance.role === 'kitchen' && performance.avgPrepTime !== undefined && (
          <div className="flex items-center justify-between p-3 bg-[#0f0f0f] rounded-xl border border-gray-800">
            <span className="text-sm text-gray-400">Avg Prep Time</span>
            <span className="text-lg font-bold text-orange-400">{performance.avgPrepTime.toFixed(1)} min</span>
          </div>
        )}

        {performance.role === 'waiter' && performance.avgServiceTime !== undefined && (
          <div className="flex items-center justify-between p-3 bg-[#0f0f0f] rounded-xl border border-gray-800">
            <span className="text-sm text-gray-400">Avg Service Time</span>
            <span className="text-lg font-bold text-green-400">{performance.avgServiceTime.toFixed(1)} min</span>
          </div>
        )}

        <div className="flex items-center justify-between p-3 bg-[#0f0f0f] rounded-xl border border-gray-800">
          <div className="flex items-center gap-2">
            <AlertCircle className={`h-4 w-4 ${
              performance.delayedPercentage > 20 ? 'text-red-400' : 
              performance.delayedPercentage > 10 ? 'text-orange-400' : 
              'text-green-400'
            }`} />
            <span className="text-sm text-gray-400">Delayed Orders</span>
          </div>
          <div className="text-right">
            <span className={`text-lg font-bold ${
              performance.delayedPercentage > 20 ? 'text-red-400' : 
              performance.delayedPercentage > 10 ? 'text-orange-400' : 
              'text-green-400'
            }`}>
              {performance.delayedOrders} ({performance.delayedPercentage}%)
            </span>
          </div>
        </div>
      </div>
    </AppCard>
  )
}

