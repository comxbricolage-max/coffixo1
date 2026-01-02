import React, { ReactNode, ButtonHTMLAttributes } from 'react'
import Link from 'next/link'
import { LucideIcon } from 'lucide-react'

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'orange' | 'amber' | 'green' | 'red' | 'blue' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  icon?: LucideIcon
  fullWidth?: boolean
  href?: string
}

export default function GradientButton({ 
  children, 
  variant = 'orange', 
  size = 'md',
  icon: Icon,
  fullWidth = false,
  href,
  className,
  ...props 
}: GradientButtonProps) {
  const variantClasses = {
    orange: 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 glow-orange',
    amber: 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 glow-amber',
    green: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 glow-green',
    red: 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600',
    blue: 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600',
    outline: 'bg-transparent border-2 border-orange-500/50 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500',
  }
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }
  
  const widthClass = fullWidth ? 'w-full' : ''
  const textColor = variant === 'outline' ? '' : 'text-white'
  
  const buttonContent = (
    <>
      {Icon && <Icon className="h-5 w-5" />}
      {children}
    </>
  )
  
  const buttonClasses = `
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${widthClass}
    ${textColor}
    font-semibold rounded-xl
    transition-all duration-200
    hover:scale-105 active:scale-95
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
    flex items-center justify-center gap-2
    ${variant !== 'outline' ? 'shadow-lg' : ''}
    ${className || ''}
  `
  
  if (href) {
    return (
      <Link href={href} className={buttonClasses} {...props as any}>
        {buttonContent}
      </Link>
    )
  }
  
  return (
    <button
      className={buttonClasses}
      {...props}
    >
      {buttonContent}
    </button>
  )
}
