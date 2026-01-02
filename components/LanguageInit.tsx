'use client'

import { useEffect } from 'react'
import { initLanguage, isRTL } from '@/lib/i18n'

export default function LanguageInitClient() {
  useEffect(() => {
    try {
      if (typeof document === 'undefined') {
        return
      }

      const lang = initLanguage()
      const dir = isRTL(lang) ? 'rtl' : 'ltr'

      document.documentElement.setAttribute('dir', dir)
      document.documentElement.setAttribute('lang', lang)
    } catch {
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('dir', 'ltr')
        document.documentElement.setAttribute('lang', 'en')
      }
    }
  }, [])

  return null
}

