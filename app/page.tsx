'use client'

import Link from 'next/link'
import { ArrowRight, QrCode, Smartphone, ChefHat, BarChart3, Users, Utensils, Clock, TrendingUp, Check } from 'lucide-react'
import GradientButton from '@/components/ui/GradientButton'
import AppCard from '@/components/ui/AppCard'
import HomePageTopBar from '@/components/layout/HomePageTopBar'
import { useTranslation } from '@/hooks/useTranslation'

export default function HomePage() {
  let t: (key: string, params?: Record<string, string | number>) => string
  try {
    const translation = useTranslation()
    t = translation.t
  } catch {
    t = (key: string) => key
  }

  const features = [
    { icon: QrCode, titleKey: 'home.features.qrOrdering.title', descKey: 'home.features.qrOrdering.description', color: 'orange' },
    { icon: Utensils, titleKey: 'home.features.menuManagement.title', descKey: 'home.features.menuManagement.description', color: 'amber' },
    { icon: Users, titleKey: 'home.features.staffControl.title', descKey: 'home.features.staffControl.description', color: 'green' },
    { icon: Clock, titleKey: 'home.features.realtimeOrders.title', descKey: 'home.features.realtimeOrders.description', color: 'blue' },
    { icon: BarChart3, titleKey: 'home.features.analytics.title', descKey: 'home.features.analytics.description', color: 'orange' },
    { icon: TrendingUp, titleKey: 'home.features.multilocation.title', descKey: 'home.features.multilocation.description', color: 'amber' },
  ]

  return (
    <div className="min-h-screen">
      <HomePageTopBar />
      
      {/* Hero Section - Dark Warm Premium */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent" />
          <div className="relative max-w-7xl mx-auto ps-4 pe-4 sm:ps-6 sm:pe-6 lg:ps-8 lg:pe-8 pt-20 sm:pt-28 lg:pt-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/20 border border-orange-500/30 mb-8 backdrop-blur-sm">
              <span className="text-sm font-semibold text-orange-300">{t('home.hero.badge')}</span>
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-white mb-6 leading-tight">
              {t('home.hero.title')}
              <span className="block bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                {t('home.hero.titleHighlight')}
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              {t('home.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <Link href="/app/signup">
                <GradientButton variant="orange" size="lg" fullWidth={false}>
                  {t('home.hero.ctaPrimary')}
                  <ArrowRight className="h-5 w-5" />
                </GradientButton>
              </Link>
              <Link href="/app/login">
                <button className="px-8 py-4 border-2 border-gray-600 text-white font-semibold rounded-xl hover:border-orange-500/50 hover:bg-orange-500/10 transition-all backdrop-blur-sm">
                  {t('home.hero.ctaSecondary')}
                </button>
              </Link>
            </div>
            <p className="text-sm text-gray-400">
              {t('home.hero.trialInfo')}
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
              {t('home.howItWorks.title')}
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
              {t('home.howItWorks.subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <AppCard className="text-center border-orange-500/20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 mb-6">
                <QrCode className="h-10 w-10 text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {t('home.howItWorks.step1.title')}
              </h3>
              <p className="text-gray-400 text-base leading-relaxed">
                {t('home.howItWorks.step1.description')}
              </p>
            </AppCard>
            <AppCard className="text-center border-amber-500/20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/30 mb-6">
                <Smartphone className="h-10 w-10 text-amber-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {t('home.howItWorks.step2.title')}
              </h3>
              <p className="text-gray-400 text-base leading-relaxed">
                {t('home.howItWorks.step2.description')}
              </p>
            </AppCard>
            <AppCard className="text-center border-green-500/20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 mb-6">
                <ChefHat className="h-10 w-10 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {t('home.howItWorks.step3.title')}
              </h3>
              <p className="text-gray-400 text-base leading-relaxed">
                {t('home.howItWorks.step3.description')}
              </p>
            </AppCard>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
              {t('home.features.title')}
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
              {t('home.features.subtitle')}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon
              const colorClasses = {
                orange: 'border-orange-500/20 from-orange-500/10 to-amber-500/10 text-orange-400',
                amber: 'border-amber-500/20 from-amber-500/10 to-yellow-500/10 text-amber-400',
                green: 'border-green-500/20 from-green-500/10 to-emerald-500/10 text-green-400',
                blue: 'border-blue-500/20 from-blue-500/10 to-indigo-500/10 text-blue-400',
              }
              return (
                <AppCard key={idx} className={`border-2 bg-gradient-to-br ${colorClasses[feature.color as keyof typeof colorClasses]}`}>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[feature.color as keyof typeof colorClasses]} flex items-center justify-center mb-4`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{t(feature.titleKey)}</h3>
                  <p className="text-gray-400">{t(feature.descKey)}</p>
                </AppCard>
              )
            })}
          </div>
        </div>
      </section>

      {/* For Who Section */}
      <section className="py-20 sm:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
              {t('home.forWho.title')}
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
              {t('home.forWho.subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <AppCard className="border-orange-500/20">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 flex items-center justify-center me-4">
                  <ChefHat className="h-8 w-8 text-orange-400" />
                </div>
                <h3 className="text-3xl font-bold text-white">
                  {t('home.forWho.owners.title')}
                </h3>
              </div>
              <p className="text-gray-400 mb-6 text-lg">
                {t('home.forWho.owners.description')}
              </p>
              <ul className="space-y-4">
                {[
                  'home.forWho.owners.features.0',
                  'home.forWho.owners.features.1',
                  'home.forWho.owners.features.2',
                  'home.forWho.owners.features.3',
                  'home.forWho.owners.features.4',
                ].map((itemKey, idx) => (
                  <li key={idx} className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <Check className="h-5 w-5 text-green-400" />
                    </div>
                    <span className="text-gray-300 ms-3">{t(itemKey)}</span>
                  </li>
                ))}
              </ul>
            </AppCard>

            <AppCard className="border-amber-500/20">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/30 flex items-center justify-center me-4">
                  <Smartphone className="h-8 w-8 text-amber-400" />
                </div>
                <h3 className="text-3xl font-bold text-white">
                  {t('home.forWho.cafes.title')}
                </h3>
              </div>
              <p className="text-gray-400 mb-6 text-lg">
                {t('home.forWho.cafes.description')}
              </p>
              <ul className="space-y-4">
                {[
                  'home.forWho.cafes.features.0',
                  'home.forWho.cafes.features.1',
                  'home.forWho.cafes.features.2',
                  'home.forWho.cafes.features.3',
                  'home.forWho.cafes.features.4',
                ].map((itemKey, idx) => (
                  <li key={idx} className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <Check className="h-5 w-5 text-green-400" />
                    </div>
                    <span className="text-gray-300 ms-3">{t(itemKey)}</span>
                  </li>
                ))}
              </ul>
            </AppCard>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent" />
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6">
            {t('home.cta.title')}
          </h2>
          <p className="text-xl sm:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto">
            {t('home.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link href="/app/signup">
              <GradientButton variant="orange" size="lg" fullWidth={false}>
                {t('home.hero.ctaPrimary')}
                <ArrowRight className="h-5 w-5" />
              </GradientButton>
            </Link>
            <Link href="/app/login">
              <button className="px-8 py-4 border-2 border-gray-600 text-white font-semibold rounded-xl hover:border-orange-500/50 hover:bg-orange-500/10 transition-all backdrop-blur-sm">
                {t('home.hero.ctaSecondary')}
              </button>
            </Link>
          </div>
          <p className="text-sm text-gray-400">
            {t('home.cta.trialInfo')}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <h3 className="text-white text-2xl font-bold mb-4">{t('common.appName')}</h3>
              <p className="text-sm text-gray-400 max-w-md">
                {t('home.footer.description')}
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t('home.footer.getStarted')}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/app/signup" className="text-gray-400 hover:text-orange-400 transition-colors">
                    {t('home.footer.signUp')}
                  </Link>
                </li>
                <li>
                  <Link href="/app/login" className="text-gray-400 hover:text-orange-400 transition-colors">
                    {t('home.footer.login')}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t('home.footer.resources')}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                    {t('home.footer.documentation')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                    {t('home.footer.support')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                    {t('home.footer.pricing')}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800/50 pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-400">
                {t('home.footer.copyright')}
              </p>
              <div className="flex gap-6 text-sm">
                <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">{t('home.footer.privacy')}</a>
                <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">{t('home.footer.terms')}</a>
                <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">{t('home.footer.security')}</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
