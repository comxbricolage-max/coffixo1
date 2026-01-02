'use client'

import { useState, useEffect } from 'react'
import { CurrencyCode, getCurrency, setCurrency as setCurrencyStorage, CURRENCIES } from '@/lib/currency'
import { useTranslation } from '@/hooks/useTranslation'

/**
 * Safe currency hook with fallbacks
 * Always returns valid currency and locale
 */
export function useCurrency() {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    try {
      if (typeof window !== 'undefined') {
        return getCurrency()
      }
    } catch {
      // Silent fail
    }
    return 'USD'
  })

  // Get locale from translation hook if available
  let currentLang = 'en'
  try {
    const { lang } = useTranslation()
    currentLang = lang || 'en'
  } catch {
    // Silent fail, use default
  }

  // Get locale based on currency and language
  const getLocale = (curr: CurrencyCode): string => {
    try {
      const currencyInfo = CURRENCIES[curr] || CURRENCIES.USD
      // If language is Arabic, prefer Arabic locale
      if (currentLang === 'ar' && currencyInfo.locale.includes('ar')) {
        return currencyInfo.locale
      }
      // Otherwise use currency's default locale
      return currencyInfo.locale || 'en-US'
    } catch {
      return 'en-US'
    }
  }

  const locale = getLocale(currency)

  useEffect(() => {
    const handleCurrencyChange = () => {
      try {
        setCurrencyState(getCurrency())
      } catch {
        // Silent fail, keep current currency
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('currencychange', handleCurrencyChange)
      return () => {
        window.removeEventListener('currencychange', handleCurrencyChange)
      }
    }
  }, [])

  const setCurrency = (newCurrency: CurrencyCode) => {
    try {
      setCurrencyStorage(newCurrency)
      setCurrencyState(newCurrency)
    } catch {
      // Silent fail
    }
  }

  // Always return valid values with fallbacks
  return {
    currency: currency || 'USD',
    locale: locale || 'en-US',
    setCurrency,
  }
}

