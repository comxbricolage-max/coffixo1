'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Utensils, 
  QrCode, 
  Users, 
  UserCircle, 
  BarChart3, 
  Settings,
  ChefHat,
  TrendingUp,
  Package,
  ShoppingBag,
  Brain,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

interface NavItem {
  key: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

interface CollapsibleSection {
  key: string
  labelKey: string
  items: NavItem[]
}

export default function Sidebar() {
  const pathname = usePathname()
  
  let t: (key: string) => string
  try {
    const translation = useTranslation()
    t = translation.t
  } catch {
    t = (key: string) => key
  }

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/')
  }

  // Auto-expand sections that contain active items
  const getInitialExpandedSections = () => {
    const expanded = new Set<string>()
    const managementItems = [
      '/app/dashboard/tables',
      '/app/dashboard/staff',
      '/app/dashboard/inventory',
      '/app/dashboard/purchasing',
      '/app/dashboard/clients',
    ]
    const intelligenceItems = [
      '/app/dashboard/operations',
      '/app/dashboard/performance',
      '/app/dashboard/analytics',
    ]
    
    if (managementItems.some(href => isActive(href))) {
      expanded.add('management')
    }
    if (intelligenceItems.some(href => isActive(href))) {
      expanded.add('intelligence')
    }
    
    return expanded
  }

  const [expandedSections, setExpandedSections] = useState<Set<string>>(getInitialExpandedSections())

  // Update expanded sections when pathname changes (e.g., direct navigation)
  useEffect(() => {
    const expanded = new Set<string>()
    const managementItems = [
      '/app/dashboard/tables',
      '/app/dashboard/staff',
      '/app/dashboard/inventory',
      '/app/dashboard/purchasing',
      '/app/dashboard/clients',
    ]
    const intelligenceItems = [
      '/app/dashboard/operations',
      '/app/dashboard/performance',
      '/app/dashboard/analytics',
    ]

    if (managementItems.some(href => pathname === href || pathname?.startsWith(href + '/'))) {
      expanded.add('management')
    }
    if (intelligenceItems.some(href => pathname === href || pathname?.startsWith(href + '/'))) {
      expanded.add('intelligence')
    }
    
    setExpandedSections(prev => {
      // Merge: keep manually expanded sections, add auto-expanded ones
      const merged = new Set(prev)
      expanded.forEach(key => merged.add(key))
      return merged
    })
  }, [pathname])

  // PRIMARY - Always visible (daily use)
  const primaryItems: NavItem[] = [
    { key: 'sidebar.overview', href: '/app/dashboard', icon: LayoutDashboard },
    { key: 'sidebar.orders', href: '/app/dashboard/orders', icon: ShoppingCart },
    { key: 'sidebar.menu', href: '/app/dashboard/menu', icon: Utensils },
  ]

  // MANAGEMENT - Collapsible section
  const managementSection: CollapsibleSection = {
    key: 'management',
    labelKey: 'sidebar.management',
    items: [
      { key: 'sidebar.tables', href: '/app/dashboard/tables', icon: QrCode },
      { key: 'sidebar.staff', href: '/app/dashboard/staff', icon: Users },
      { key: 'sidebar.inventory', href: '/app/dashboard/inventory', icon: Package },
      { key: 'sidebar.purchasing', href: '/app/dashboard/purchasing', icon: ShoppingBag },
      { key: 'sidebar.clients', href: '/app/dashboard/clients', icon: UserCircle },
    ]
  }

  // INTELLIGENCE - Collapsible section
  const intelligenceSection: CollapsibleSection = {
    key: 'intelligence',
    labelKey: 'sidebar.intelligence',
    items: [
      { key: 'sidebar.operations', href: '/app/dashboard/operations', icon: Brain },
      { key: 'sidebar.performance', href: '/app/dashboard/performance', icon: TrendingUp },
      { key: 'sidebar.analytics', href: '/app/dashboard/analytics', icon: BarChart3 },
    ]
  }

  // SETTINGS - Always visible, always last
  const settingsItem: NavItem = {
    key: 'sidebar.settings',
    href: '/app/dashboard/settings',
    icon: Settings
  }

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(sectionKey)) {
        next.delete(sectionKey)
      } else {
        next.add(sectionKey)
      }
      return next
    })
  }

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon
    const active = isActive(item.href)
    return (
      <Link
        key={item.key}
        href={item.href}
        className={`group flex items-center ps-4 pe-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
          active
            ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-300 border border-orange-500/30 shadow-lg shadow-orange-500/10'
            : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-300'
        }`}
      >
        <Icon className={`me-3 h-5 w-5 transition-colors ${
          active ? 'text-orange-400' : 'text-gray-500 group-hover:text-gray-400'
        }`} />
        {t(item.key)}
      </Link>
    )
  }

  const renderCollapsibleSection = (section: CollapsibleSection) => {
    const isExpanded = expandedSections.has(section.key)
    const hasActiveItem = section.items.some(item => isActive(item.href))
    const ChevronIcon = isExpanded ? ChevronDown : ChevronRight

    return (
      <div key={section.key} className="space-y-1">
        <button
          onClick={() => toggleSection(section.key)}
          className={`w-full flex items-center justify-between ps-4 pe-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
            hasActiveItem
              ? 'text-orange-300 bg-gray-800/30'
              : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-300'
          }`}
        >
          <span>{t(section.labelKey)}</span>
          <ChevronIcon className={`h-4 w-4 transition-transform duration-200 ${
            isExpanded ? 'rotate-0' : ''
          }`} />
        </button>
        {isExpanded && (
          <div className="space-y-1 ms-4">
            {section.items.map(item => renderNavItem(item))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:start-0 bg-[#1a1a1a] border-e border-gray-800/50 backdrop-blur-sm">
      <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
        {/* Logo / Brand */}
        <div className="flex items-center flex-shrink-0 ps-6 pe-6 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 flex items-center justify-center me-3">
            <ChefHat className="h-6 w-6 text-orange-400" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
            {t('common.appName')}
          </h1>
        </div>
        
        {/* Navigation */}
        <nav className="mt-2 flex-1 ps-3 pe-3 space-y-2">
          {/* PRIMARY - Always visible */}
          <div className="space-y-1">
            {primaryItems.map(item => renderNavItem(item))}
          </div>

          {/* Spacing between sections */}
          <div className="pt-2"></div>

          {/* MANAGEMENT - Collapsible */}
          {renderCollapsibleSection(managementSection)}

          {/* Spacing between sections */}
          <div className="pt-2"></div>

          {/* INTELLIGENCE - Collapsible */}
          {renderCollapsibleSection(intelligenceSection)}

          {/* Spacing before settings */}
          <div className="pt-2"></div>

          {/* SETTINGS - Always visible, always last */}
          {renderNavItem(settingsItem)}
        </nav>
      </div>
      
      {/* User Footer */}
      <div className="flex-shrink-0 flex border-t border-gray-800/50 ps-4 pe-4 py-4">
        <div className="flex-shrink-0 w-full">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 flex items-center justify-center me-3">
              <ChefHat className="h-5 w-5 text-orange-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{t('sidebar.demoRestaurant')}</p>
              <p className="text-xs text-gray-400 truncate">{t('sidebar.demoEmail')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
