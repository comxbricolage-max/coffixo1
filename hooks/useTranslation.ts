'use client'

import { useState, useEffect } from 'react'
import { Language, getLanguage, t as translate } from '@/lib/i18n'

export function useTranslation() {
  const [lang, setLang] = useState<Language>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    try {
      const currentLang = getLanguage()
      setLang(currentLang)
    } catch {
      setLang('en')
    }

    const handleStorageChange = () => {
      try {
        setLang(getLanguage())
      } catch {
        setLang('en')
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange)
      window.addEventListener('languagechange', handleStorageChange)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange)
        window.removeEventListener('languagechange', handleStorageChange)
      }
    }
  }, [])

  const t = (key: string, params?: Record<string, string | number>): string => {
    try {
      if (!key || typeof key !== 'string') {
        return ''
      }
      // Always try to translate, even if not mounted (for SSR)
      const result = translate(key, mounted ? lang : 'en', params)
      return result || key
    } catch {
      return key
    }
  }

  return { t, lang: mounted ? lang : 'en' }
}

