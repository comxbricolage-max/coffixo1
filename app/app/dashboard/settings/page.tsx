'use client'

// 🧪 DEMO MODE – NO DATABASE
// TODO: Replace with real database queries when MongoDB is connected

import AppCard from '@/components/ui/AppCard'
import SectionHeader from '@/components/ui/SectionHeader'
import GradientButton from '@/components/ui/GradientButton'
import { mockRestaurant } from '@/lib/mock-data'
import { Settings, Building2, Globe, Clock } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useCurrency } from '@/hooks/useCurrency'
import { CURRENCIES, CurrencyCode } from '@/lib/currency'
import { useState } from 'react'

export default function SettingsPage() {
  let t: (key: string, params?: Record<string, string | number>) => string
  try {
    const translation = useTranslation()
    t = translation.t
  } catch {
    t = (key: string) => key
  }
  const { currency, setCurrency } = useCurrency()
  const [saving, setSaving] = useState(false)

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value as CurrencyCode
    setCurrency(newCurrency)
    setSaving(true)
    setTimeout(() => setSaving(false), 1000)
  }
  return (
    <div className="space-y-8">
      {/* Header */}
      <SectionHeader 
        title={t('dashboard.settings.title')} 
        subtitle={t('dashboard.settings.subtitle')}
        icon={Settings}
      />

      {/* Restaurant Information */}
      <AppCard className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-amber-500/5">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-orange-400" />
          </div>
          <h2 className="text-xl font-bold text-white">{t('dashboard.settings.restaurantInfo')}</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">{t('dashboard.settings.name')}</label>
            <input
              type="text"
              defaultValue={mockRestaurant.name}
              className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 text-white placeholder-gray-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">{t('dashboard.settings.description')}</label>
            <textarea
              defaultValue={mockRestaurant.description}
              rows={3}
              className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 text-white placeholder-gray-500 transition-all resize-none"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">{t('dashboard.settings.address')}</label>
              <input
                type="text"
                defaultValue={mockRestaurant.address}
                className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 text-white placeholder-gray-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">{t('dashboard.settings.phone')}</label>
              <input
                type="tel"
                defaultValue={mockRestaurant.phone}
                className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 text-white placeholder-gray-500 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">{t('dashboard.settings.email')}</label>
            <input
              type="email"
              defaultValue={mockRestaurant.email}
              className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 text-white placeholder-gray-500 transition-all"
            />
          </div>
          <GradientButton variant="orange">{t('dashboard.settings.save')}</GradientButton>
        </div>
      </AppCard>

      {/* Currency & Language */}
      <AppCard className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <Globe className="h-6 w-6 text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-white">{t('dashboard.settings.localization')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">{t('dashboard.settings.currency')}</label>
            <select
              value={currency}
              onChange={handleCurrencyChange}
              className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 text-white transition-all"
            >
              {Object.values(CURRENCIES).map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.flag} {curr.code} ({curr.symbol}) - {curr.name}
                </option>
              ))}
            </select>
            {saving && (
              <p className="text-xs text-green-400 mt-2">{t('dashboard.settings.currencySaved')}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">{t('dashboard.settings.language')}</label>
            <select
              defaultValue={mockRestaurant.language}
              className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 text-white transition-all"
              disabled
            >
              <option value="en">English</option>
              <option value="fr">French</option>
              <option value="ar">Arabic</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">{t('dashboard.settings.languageNote')}</p>
          </div>
        </div>
        <GradientButton variant="orange" className="mt-4">{t('dashboard.settings.save')}</GradientButton>
      </AppCard>

      {/* Opening Hours */}
      <AppCard className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center">
            <Clock className="h-6 w-6 text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-white">{t('dashboard.settings.openingHours')}</h2>
        </div>
        <div className="space-y-3">
          {Object.entries(mockRestaurant.openingHours).map(([day, hours]) => (
            <div key={day} className="flex items-center justify-between p-4 bg-[#0f0f0f] rounded-xl border border-gray-800">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  defaultChecked={!hours.closed}
                  className="rounded border-gray-600 text-orange-500 focus:ring-orange-500/50 bg-[#1a1a1a]"
                />
                <span className="font-semibold text-white capitalize">{day}</span>
              </div>
              {!hours.closed ? (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    defaultValue={hours.open}
                    className="px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50"
                  />
                  <span className="text-gray-400">{t('dashboard.settings.to')}</span>
                  <input
                    type="time"
                    defaultValue={hours.close}
                    className="px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50"
                  />
                </div>
              ) : (
                <span className="text-gray-400 text-sm">{t('dashboard.settings.closed')}</span>
              )}
            </div>
          ))}
        </div>
        <GradientButton variant="orange" className="mt-4">{t('dashboard.settings.save')}</GradientButton>
      </AppCard>
    </div>
  )
}
