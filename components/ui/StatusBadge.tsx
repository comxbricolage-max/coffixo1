import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

interface StatusBadgeProps {
  children: ReactNode
  variant?: 'pending' | 'preparing' | 'ready' | 'served' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
  icon?: LucideIcon
}

export default function StatusBadge({ 
  children, 
  variant = 'info',
  size = 'md',
  icon: Icon 
}: StatusBadgeProps) {
  const variantClasses = {
    pending: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    preparing: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    ready: 'bg-green-500/20 text-green-300 border-green-500/30',
    served: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    success: 'bg-green-500/20 text-green-300 border-green-500/30',
    warning: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    error: 'bg-red-500/20 text-red-300 border-red-500/30',
    info: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  }
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  }
  
  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        font-semibold rounded-lg border
        backdrop-blur-sm
      `}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </span>
  )
}

