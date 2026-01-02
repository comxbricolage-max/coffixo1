'use client'

import { useTranslation } from '@/hooks/useTranslation'

export default function DemoBanner() {
  let bannerText = '🧪 Demo Mode - No database required'
  try {
    const translation = useTranslation()
    bannerText = translation.t('demo.banner') || bannerText
  } catch {
    // Use default text
  }

  return (
    <div className="bg-yellow-100 border-b border-yellow-300 px-4 py-2 text-center text-sm text-yellow-800">
      {bannerText}
    </div>
  )
}

