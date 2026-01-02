'use client'

// 🧪 DEMO MODE – NO DATABASE
// TODO: Replace with real database queries when MongoDB is connected

import { useState } from 'react'
import AppCard from '@/components/ui/AppCard'
import StatusBadge from '@/components/ui/StatusBadge'
import SectionHeader from '@/components/ui/SectionHeader'
import GradientButton from '@/components/ui/GradientButton'
import KPIStatCard from '@/components/ui/KPIStatCard'
import EmptyState from '@/components/ui/EmptyState'
import { mockStaff, type Staff } from '@/lib/mock-data'
import { Users, Plus, Mail, Shield, UserCheck, UserX, ChefHat, Clock } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

export default function StaffPage() {
  let t: (key: string, params?: Record<string, string | number>) => string
  try {
    const translation = useTranslation()
    t = translation.t
  } catch {
    t = (key: string) => key
  }

  const [staff, setStaff] = useState<Staff[]>(mockStaff || [])
  const [showAddModal, setShowAddModal] = useState(false)

  const toggleStaffStatus = (staffId: string) => {
    setStaff(staff.map(member =>
      member.id === staffId ? { ...member, active: !member.active } : member
    ))
  }

  const roleConfig = {
    owner: { 
      label: t('dashboard.staff.roles.owner'), 
      variant: 'info' as const, 
      icon: Shield, 
      gradient: 'from-orange-500/10 to-amber-500/10 border-orange-500/30', 
      iconBg: 'bg-orange-500/20', 
      iconColor: 'text-orange-400',
      emoji: '👑'
    },
    kitchen: { 
      label: t('dashboard.staff.roles.kitchen'), 
      variant: 'warning' as const, 
      icon: ChefHat, 
      gradient: 'from-red-500/10 to-orange-500/10 border-red-500/30', 
      iconBg: 'bg-red-500/20', 
      iconColor: 'text-red-400',
      emoji: '👨‍🍳'
    },
    waiter: { 
      label: t('dashboard.staff.roles.waiter'), 
      variant: 'success' as const, 
      icon: UserCheck, 
      gradient: 'from-green-500/10 to-emerald-500/10 border-green-500/30', 
      iconBg: 'bg-green-500/20', 
      iconColor: 'text-green-400',
      emoji: '🍽️'
    },
    cashier: { 
      label: t('dashboard.staff.roles.cashier'), 
      variant: 'info' as const, 
      icon: UserCheck, 
      gradient: 'from-amber-500/10 to-yellow-500/10 border-amber-500/30', 
      iconBg: 'bg-amber-500/20', 
      iconColor: 'text-amber-400',
      emoji: '💳'
    },
  }

  const totalStaff = staff.length
  const activeStaff = staff.filter(s => s.active).length
  const onShiftStaff = staff.filter(s => s.onShift).length
  const kitchenStaff = staff.filter(s => s.role === 'kitchen').length
  const waiters = staff.filter(s => s.role === 'waiter').length
  const cashiers = staff.filter(s => s.role === 'cashier').length

  return (
    <div className="space-y-8 w-full max-w-[1400px] mx-auto px-6 md:px-10 xl:px-16">
      {/* Header */}
      <SectionHeader 
        title={t('dashboard.staff.title')} 
        subtitle={t('dashboard.staff.subtitle')}
        icon={Users}
        action={
          <GradientButton variant="orange" onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4" />
            {t('dashboard.staff.addStaff')}
          </GradientButton>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPIStatCard
          label={t('dashboard.staff.totalStaff')}
          value={totalStaff}
          icon={Users}
          gradient="orange"
        />
        <KPIStatCard
          label={t('dashboard.staff.active')}
          value={activeStaff}
          icon={UserCheck}
          gradient="green"
        />
        <KPIStatCard
          label={t('dashboard.staff.kitchen')}
          value={kitchenStaff}
          icon={ChefHat}
          gradient="red"
        />
        <KPIStatCard
          label={t('dashboard.staff.waiters')}
          value={waiters}
          icon={UserCheck}
          gradient="green"
        />
        <KPIStatCard
          label={t('dashboard.staff.onShift')}
          value={onShiftStaff}
          icon={Clock}
          gradient="amber"
        />
      </div>

      {/* Staff List */}
      <SectionHeader 
        title={t('dashboard.staff.teamMembers')} 
        subtitle={t('dashboard.staff.teamMembersSubtitle')}
        icon={Users}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((member) => {
          // Use role from Staff interface (legacy support)
          const role = member.role || 'waiter'
          const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.waiter
          const RoleIcon = config.icon

          return (
            <AppCard 
              key={member.id} 
              className={`bg-gradient-to-br ${config.gradient} border-2 hover:scale-[1.02] transition-all`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full ${config.iconBg} border border-gray-800 flex items-center justify-center`}>
                    <span className="text-2xl">{config.emoji}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white mb-1">{member.name}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge variant={config.variant} size="sm">
                        <RoleIcon className="h-3 w-3" />
                        {config.label}
                      </StatusBadge>
                      {member.onShift ? (
                        <StatusBadge variant="success" size="sm">
                          <Clock className="h-3 w-3" />
                          {t('dashboard.staff.onShift')}
                        </StatusBadge>
                      ) : (
                        <StatusBadge variant="info" size="sm">{t('dashboard.staff.offShift')}</StatusBadge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-400">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  {member.email}
                </div>
              </div>
              
              <div className="flex gap-2 pt-4 border-t border-gray-800">
                <GradientButton 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                >
                  {t('dashboard.staff.edit')}
                </GradientButton>
                <button
                  onClick={() => toggleStaffStatus(member.id)}
                  className={`p-2.5 rounded-xl transition-all ${
                    member.active 
                      ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30' 
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-400 border border-gray-700'
                  }`}
                  aria-label={member.active ? t('dashboard.staff.deactivate') : t('dashboard.staff.activate')}
                >
                  {member.active ? (
                    <UserX className="h-5 w-5" />
                  ) : (
                    <UserCheck className="h-5 w-5" />
                  )}
                </button>
              </div>
            </AppCard>
          )
        })}
      </div>

      {staff.length === 0 && (
        <AppCard className="bg-gradient-to-br from-orange-500/5 to-amber-500/5 border-orange-500/20">
          <EmptyState
            icon={<Users className="h-12 w-12 text-orange-400" />}
            title={t('dashboard.staff.noStaff')}
            description={t('dashboard.staff.noStaffDesc')}
            action={
              <GradientButton 
                onClick={() => setShowAddModal(true)}
                variant="orange"
              >
                <Plus className="h-4 w-4" />
                {t('dashboard.staff.addStaff')}
              </GradientButton>
            }
          />
        </AppCard>
      )}

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <AppCard className="max-w-md w-full border-orange-500/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">{t('dashboard.staff.modalTitle')}</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white text-2xl leading-none transition-colors"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              {t('dashboard.staff.modalDescription')}
            </p>
            <GradientButton 
              onClick={() => setShowAddModal(false)} 
              variant="orange"
              fullWidth
            >
              {t('dashboard.staff.close')}
            </GradientButton>
          </AppCard>
        </div>
      )}
    </div>
  )
}
