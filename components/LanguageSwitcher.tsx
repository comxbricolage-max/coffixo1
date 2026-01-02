'use client'

import { useState, useEffect } from 'react'
import { Language, SUPPORTED_LANGUAGES, LANGUAGE_NAMES, setLanguage, getLanguage, isRTL } from '@/lib/i18n'
import { Globe, Check } from 'lucide-react'

export default function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState<Language>('en')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    try {
      setCurrentLang(getLanguage())
    } catch {
      setCurrentLang('en')
    }

    const handleLanguageChange = () => {
      try {
        setCurrentLang(getLanguage())
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('languagechange'))
        }
      } catch {
        setCurrentLang('en')
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleLanguageChange)
      window.addEventListener('languagechange', handleLanguageChange)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleLanguageChange)
        window.removeEventListener('languagechange', handleLanguageChange)
      }
    }
  }, [])

  const handleLanguageSelect = (lang: Language) => {
    try {
      setLanguage(lang)
      setCurrentLang(lang)
      setIsOpen(false)

      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        window.dispatchEvent(new Event('languagechange'))

        const currentDir = document.documentElement.getAttribute('dir') || 'ltr'
        const newDir = isRTL(lang) ? 'rtl' : 'ltr'

        if (currentDir !== newDir) {
          document.documentElement.setAttribute('dir', newDir)
          document.documentElement.setAttribute('lang', lang)
          window.location.reload()
        } else {
          document.documentElement.setAttribute('lang', lang)
        }
      }
    } catch {
      setIsOpen(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0f0f0f] border border-gray-800 hover:border-orange-500/50 transition-colors"
        aria-label="Select language"
      >
        <Globe className="h-4 w-4 text-gray-400" />
        <span className="text-sm font-semibold text-white">
          {currentLang.toUpperCase()}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute end-0 mt-2 w-48 bg-gradient-to-br from-[#1a1a1a] to-[#252525] border border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageSelect(lang)}
                className={`w-full px-4 py-3 text-start hover:bg-orange-500/10 transition-colors flex items-center justify-between ${
                  currentLang === lang ? 'bg-orange-500/10' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-white">
                    {LANGUAGE_NAMES[lang]}
                  </span>
                  {isRTL(lang) && (
                    <span className="text-xs text-gray-500">RTL</span>
                  )}
                </div>
                {currentLang === lang && (
                  <Check className="h-4 w-4 text-orange-400" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

