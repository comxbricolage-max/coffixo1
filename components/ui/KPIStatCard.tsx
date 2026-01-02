import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'
import AppCard from './AppCard'

interface KPIStatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: string
    positive: boolean
  }
  gradient?: 'orange' | 'amber' | 'green' | 'red' | 'blue'
  emoji?: string
}

export default function KPIStatCard({ 
  label, 
  value, 
  icon: Icon, 
  trend, 
  gradient = 'orange',
  emoji 
}: KPIStatCardProps) {
  const gradientClasses = {
    orange: 'from-orange-500/20 to-amber-500/20 border-orange-500/30',
    amber: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30',
    green: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
    red: 'from-red-500/20 to-orange-500/20 border-red-500/30',
    blue: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30',
  }
  
  const iconColors = {
    orange: 'text-orange-400',
    amber: 'text-amber-400',
    green: 'text-green-400',
    red: 'text-red-400',
    blue: 'text-blue-400',
  }
  
  const textColors = {
    orange: 'text-orange-300',
    amber: 'text-amber-300',
    green: 'text-green-300',
    red: 'text-red-300',
    blue: 'text-blue-300',
  }

  return (
    <AppCard 
      className={`bg-gradient-to-br ${gradientClasses[gradient]} border-2`}
      glow={gradient === 'orange' ? 'orange' : gradient === 'amber' ? 'amber' : gradient === 'green' ? 'green' : false}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {emoji && <span className="text-xl">{emoji}</span>}
            <p className={`text-xs font-semibold uppercase tracking-wide ${textColors[gradient]}`}>
              {label}
            </p>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-medium ${
              trend.positive ? 'text-green-400' : 'text-red-400'
            }`}>
              <span>{trend.positive ? '↑' : '↓'}</span>
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${gradientClasses[gradient]} flex items-center justify-center border border-gray-800/50`}>
          <Icon className={`h-7 w-7 ${iconColors[gradient]}`} />
        </div>
      </div>
    </AppCard>
  )
}

