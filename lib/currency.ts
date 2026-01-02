/**
 * Currency system for Caffixo
 * Supports multiple currencies with proper formatting
 */

export type CurrencyCode = 'MAD' | 'DZD' | 'TND' | 'EUR' | 'USD' | 'SAR' | 'AED' | 'QAR' | 'KWD'

export interface Currency {
  code: CurrencyCode
  name: string
  symbol: string
  locale: string
  flag: string
}

export const CURRENCIES: Record<CurrencyCode, Currency> = {
  MAD: { code: 'MAD', name: 'Moroccan Dirham', symbol: 'DH', locale: 'ar-MA', flag: '🇲🇦' },
  DZD: { code: 'DZD', name: 'Algerian Dinar', symbol: 'د.ج', locale: 'ar-DZ', flag: '🇩🇿' },
  TND: { code: 'TND', name: 'Tunisian Dinar', symbol: 'د.ت', locale: 'ar-TN', flag: '🇹🇳' },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', locale: 'fr-FR', flag: '🇪🇺' },
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', locale: 'en-US', flag: '🇺🇸' },
  SAR: { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', locale: 'ar-SA', flag: '🇸🇦' },
  AED: { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', locale: 'ar-AE', flag: '🇦🇪' },
  QAR: { code: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق', locale: 'ar-QA', flag: '🇶🇦' },
  KWD: { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', locale: 'ar-KW', flag: '🇰🇼' },
}

const DEFAULT_CURRENCY: CurrencyCode = 'USD'

/**
 * Get currency from localStorage or default
 */
export function getCurrency(): CurrencyCode {
  if (typeof window === 'undefined') {
    return DEFAULT_CURRENCY
  }

  try {
    const stored = localStorage.getItem('caffixo-currency') as CurrencyCode | null
    if (stored && stored in CURRENCIES) {
      return stored
    }
  } catch {
    // Silent fail
  }

  return DEFAULT_CURRENCY
}

/**
 * Set currency and persist to localStorage
 */
export function setCurrency(currency: CurrencyCode): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    if (currency in CURRENCIES) {
      localStorage.setItem('caffixo-currency', currency)
      window.dispatchEvent(new Event('currencychange'))
    }
  } catch {
    // Silent fail
  }
}

/**
 * Format amount with currency
 * SAFE: Never throws, handles null/undefined, always returns a string
 */
export function formatCurrency(
  amount: number | null | undefined,
  currencyCode?: CurrencyCode | string,
  locale?: string
): string {
  // Handle null/undefined/NaN
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '—'
  }

  // Ensure amount is a number
  const numAmount = typeof amount === 'number' ? amount : parseFloat(String(amount))
  if (isNaN(numAmount)) {
    return '—'
  }

  // Get currency with safe fallback
  let currency: CurrencyCode = 'USD'
  try {
    if (currencyCode && currencyCode in CURRENCIES) {
      currency = currencyCode as CurrencyCode
    } else {
      currency = getCurrency()
    }
  } catch {
    currency = 'USD'
  }

  const currencyInfo = CURRENCIES[currency] || CURRENCIES.USD
  const useLocale = locale || currencyInfo.locale || 'en-US'

  try {
    // Use Intl.NumberFormat for proper localization
    const formatter = new Intl.NumberFormat(useLocale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

    return formatter.format(numAmount)
  } catch {
    // Fallback formatting - never throw
    try {
      const formatted = numAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
      return `${formatted} ${currencyInfo.symbol}`
    } catch {
      // Ultimate fallback
      return `${numAmount.toFixed(2)} ${currencyInfo.symbol}`
    }
  }
}

/**
 * Format amount without currency symbol (for display flexibility)
 */
export function formatAmount(amount: number, currencyCode?: CurrencyCode): string {
  const currency = currencyCode || getCurrency()
  const currencyInfo = CURRENCIES[currency]

  try {
    const formatter = new Intl.NumberFormat(currencyInfo.locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

    return formatter.format(amount)
  } catch {
    return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currencyCode?: CurrencyCode): string {
  const currency = currencyCode || getCurrency()
  return CURRENCIES[currency].symbol
}

