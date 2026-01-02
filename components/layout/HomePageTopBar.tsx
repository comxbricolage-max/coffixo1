'use client'

import Link from 'next/link'
import { ChefHat, ArrowRight } from 'lucide-react'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import GradientButton from '@/components/ui/GradientButton'
import { useTranslation } from '@/hooks/useTranslation'

export default function HomePageTopBar() {
  let t: (key: string, params?: Record<string, string | number>) => string
  try {
    const translation = useTranslation()
    t = translation.t
  } catch {
    t = (key: string) => key
  }

  return (
    <div className="sticky top-0 z-50 bg-[#1a1a1a]/95 backdrop-blur-md border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 flex items-center justify-center">
              <ChefHat className="h-6 w-6 text-orange-400" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              {t('common.appName')}
            </h1>
          </Link>

          {/* Right side: Language + CTAs */}
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link href="/app/login">
              <button className="px-4 py-2 text-white font-semibold rounded-xl hover:bg-gray-800/50 transition-all">
                {t('home.topBar.signIn')}
              </button>
            </Link>
            <Link href="/app/signup">
              <GradientButton variant="orange" size="md" fullWidth={false}>
                {t('home.topBar.startFreeTrial')}
                <ArrowRight className="h-4 w-4" />
              </GradientButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

