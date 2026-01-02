import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  icon?: LucideIcon
  emoji?: string
  action?: ReactNode
}

export default function SectionHeader({ 
  title, 
  subtitle, 
  icon: Icon,
  emoji,
  action 
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {(Icon || emoji) && (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 flex items-center justify-center">
            {emoji ? (
              <span className="text-2xl">{emoji}</span>
            ) : Icon ? (
              <Icon className="h-6 w-6 text-orange-400" />
            ) : null}
          </div>
        )}
        <div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          {subtitle && (
            <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

