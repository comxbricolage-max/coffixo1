'use client'

import { useTranslation } from '@/hooks/useTranslation'
import { safeFormatCurrency } from '@/lib/safe-currency'
import { useCurrency } from '@/hooks/useCurrency'
import { getSafeCurrency } from '@/lib/safe-currency'
import AppCard from '@/components/ui/AppCard'
import SectionHeader from '@/components/ui/SectionHeader'
import GradientButton from '@/components/ui/GradientButton'
import { 
  ChefHat,
  Users,
  ShoppingCart,
  BarChart3,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'

interface DashboardClientProps {
  userName: string
  role: string
}

export default function DashboardClient({ userName, role }: DashboardClientProps) {
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
  // Safe currency access with fallback
  let currency = 'USD'
  try {
    const currencyHook = useCurrency()
    currency = getSafeCurrency(currencyHook?.currency) || 'USD'
  } catch {
    currency = 'USD'
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1a1a] via-[#252525] to-[#1a1a1a] border border-gray-800/50 p-8 md:p-12">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-amber-500/5 to-transparent" />
        <div className="relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 flex items-center justify-center shadow-lg shadow-orange-500/10">
              <ChefHat className="h-8 w-8 text-orange-400" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {t('dashboard.main.welcomeBack', { name: userName })}
              </h1>
              <p className="text-lg text-gray-400">
                {t('dashboard.main.selectRole')}
              </p>
            </div>
          </div>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 text-green-300 text-sm font-semibold">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            {t('dashboard.main.currentRole')}: {role}
          </div>
        </div>
      </div>

      {/* Role Dashboards */}
      <SectionHeader 
        title={t('dashboard.main.roleDashboards')} 
        subtitle={t('dashboard.main.roleDashboardsSubtitle')}
        icon={Users}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Owner Dashboard */}
        <Link href="/app/dashboard/owner">
          <AppCard className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-amber-500/5 hover:scale-105 transition-all cursor-pointer group">
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="h-8 w-8 text-orange-400" />
              </div>
              <h3 className="font-bold text-white text-lg mb-2">{t('dashboard.main.ownerDashboard')}</h3>
              <p className="text-sm text-gray-400 mb-4">
                {t('dashboard.main.ownerDescription')}
              </p>
              <GradientButton variant="outline" size="sm" className="w-full">
                {t('dashboard.main.viewDashboard')}
                <ArrowRight className="h-4 w-4" />
              </GradientButton>
            </div>
          </AppCard>
        </Link>

        {/* Kitchen Dashboard */}
        <Link href="/app/dashboard/kitchen">
          <AppCard className="border-red-500/20 bg-gradient-to-br from-red-500/5 to-orange-500/5 hover:scale-105 transition-all cursor-pointer group">
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ChefHat className="h-8 w-8 text-red-400" />
              </div>
              <h3 className="font-bold text-white text-lg mb-2">{t('dashboard.main.kitchenDashboard')}</h3>
              <p className="text-sm text-gray-400 mb-4">
                {t('dashboard.main.kitchenDescription')}
              </p>
              <GradientButton variant="outline" size="sm" className="w-full">
                {t('dashboard.main.viewDashboard')}
                <ArrowRight className="h-4 w-4" />
              </GradientButton>
            </div>
          </AppCard>
        </Link>

        {/* Reception Dashboard */}
        <Link href="/app/dashboard/reception">
          <AppCard className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 hover:scale-105 transition-all cursor-pointer group">
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShoppingCart className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="font-bold text-white text-lg mb-2">{t('dashboard.main.receptionDashboard')}</h3>
              <p className="text-sm text-gray-400 mb-4">
                {t('dashboard.main.receptionDescription')}
              </p>
              <GradientButton variant="outline" size="sm" className="w-full">
                {t('dashboard.main.viewDashboard')}
                <ArrowRight className="h-4 w-4" />
              </GradientButton>
            </div>
          </AppCard>
        </Link>

        {/* Waiter Dashboard */}
        <Link href="/app/dashboard/waiter">
          <AppCard className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5 hover:scale-105 transition-all cursor-pointer group">
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="font-bold text-white text-lg mb-2">{t('dashboard.main.waiterDashboard')}</h3>
              <p className="text-sm text-gray-400 mb-4">
                {t('dashboard.main.waiterDescription')}
              </p>
              <GradientButton variant="outline" size="sm" className="w-full">
                {t('dashboard.main.viewDashboard')}
                <ArrowRight className="h-4 w-4" />
              </GradientButton>
            </div>
          </AppCard>
        </Link>
      </div>

      {/* Quick Stats Overview */}
      <SectionHeader 
        title={t('dashboard.main.quickOverview')} 
        subtitle={t('dashboard.main.quickOverviewSubtitle')}
        icon={BarChart3}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AppCard className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-amber-500/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">{t('dashboard.overview.todayRevenue')}</p>
                <p className="text-3xl font-bold text-white">{safeFormatCurrency(342.50, currency)}</p>
              <p className="text-xs text-green-400 mt-1">↑ +12% {t('dashboard.main.fromYesterday')}</p>
            </div>
            <BarChart3 className="h-12 w-12 text-orange-400" />
          </div>
        </AppCard>
        <AppCard className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">{t('dashboard.main.activeOrders')}</p>
              <p className="text-3xl font-bold text-white">6</p>
              <p className="text-xs text-gray-400 mt-1">{t('dashboard.main.inProgress')}</p>
            </div>
            <ChefHat className="h-12 w-12 text-green-400" />
          </div>
        </AppCard>
        <AppCard className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-indigo-500/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">{t('dashboard.main.activeTables')}</p>
              <p className="text-3xl font-bold text-white">4</p>
              <p className="text-xs text-gray-400 mt-1">{t('dashboard.main.ofTotal', { total: 8 })}</p>
            </div>
            <Users className="h-12 w-12 text-blue-400" />
          </div>
        </AppCard>
      </div>
    </div>
  )
}

