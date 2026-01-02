import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AppCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  glow?: 'orange' | 'amber' | 'green' | false
}

export default function AppCard({ children, className, hover = true, glow = false }: AppCardProps) {
  const glowClass = glow ? `glow-${glow}` : ''
  const hoverClass = hover ? 'hover-lift' : ''
  
  return (
    <div
      className={cn(
        'bg-[#1a1a1a] border border-[#2d2d2d] rounded-2xl p-6',
        'backdrop-blur-sm',
        hoverClass,
        glowClass,
        className
      )}
    >
      {children}
    </div>
  )
}

