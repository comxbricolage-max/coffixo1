/**
 * i18n Helper Functions
 * Supports English, French, and Arabic (RTL)
 */

export type Language = 'en' | 'fr' | 'ar'

export const SUPPORTED_LANGUAGES: Language[] = ['en', 'fr', 'ar']

export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  fr: 'Français',
  ar: 'العربية',
}

export const RTL_LANGUAGES: Language[] = ['ar']

const I18N_SAFE_MODE = false

import enTranslationsData from './en.json'
import frTranslationsData from './fr.json'
import arTranslationsData from './ar.json'

const enTranslations: any = enTranslationsData || {}
const frTranslations: any = frTranslationsData || {}
const arTranslations: any = arTranslationsData || {}

const translations = {
  en: enTranslations,
  fr: frTranslations,
  ar: arTranslations,
}

/**
 * Get translation for a key path
 * Supports nested keys like "home.hero.title"
 */
export function t(key: string, lang: Language = 'en', params?: Record<string, string | number>): string {
  if (I18N_SAFE_MODE) {
    return key
  }

  try {
    if (!key || typeof key !== 'string') {
      return ''
    }

    const keys = key.split('.')
    let value: any = translations[lang] || translations.en

    if (!value || typeof value !== 'object') {
      value = translations.en || {}
    }

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        value = translations.en || {}
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey]
          } else {
            return key
          }
        }
        break
      }
    }

    if (typeof value !== 'string') {
      return key
    }

    if (params) {
      try {
        return value.replace(/\{(\w+)\}/g, (match: string, paramKey: string) => {
          return params[paramKey]?.toString() || match
        })
      } catch {
        return value
      }
    }

    return value
  } catch {
    return key
  }
}

/**
 * Check if language is RTL
 */
export function isRTL(lang: Language): boolean {
  return RTL_LANGUAGES.includes(lang)
}

/**
 * Get language from localStorage or browser, default to 'en'
 */
export function getLanguage(): Language {
  if (I18N_SAFE_MODE) {
    return 'en'
  }

  if (typeof window === 'undefined') {
    return 'en'
  }

  try {
    const stored = localStorage.getItem('caffixo-language') as Language | null
    if (stored && SUPPORTED_LANGUAGES.includes(stored)) {
      return stored
    }

    if (typeof navigator !== 'undefined' && navigator.language) {
      const browserLang = navigator.language.split('-')[0]
      if (browserLang === 'fr' || browserLang === 'ar') {
        return browserLang as Language
      }
    }

    return 'en'
  } catch {
    return 'en'
  }
}

/**
 * Set language and persist to localStorage
 */
export function setLanguage(lang: Language): void {
  if (I18N_SAFE_MODE) {
    return
  }

  if (typeof window === 'undefined') {
    return
  }

  try {
    if (SUPPORTED_LANGUAGES.includes(lang)) {
      localStorage.setItem('caffixo-language', lang)
    }
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Initialize language on app load
 */
export function initLanguage(): Language {
  if (I18N_SAFE_MODE) {
    return 'en'
  }

  try {
    const lang = getLanguage()
    setLanguage(lang)
    return lang
  } catch {
    return 'en'
  }
}

