/**
 * Safe Currency Utilities
 * Guaranteed to never throw, always returns a valid string
 */

import { formatCurrency as baseFormatCurrency, type CurrencyCode } from './currency'

/**
 * Safe currency formatting - never throws
 * Always returns a formatted string even if currency is missing
 */
export function safeFormatCurrency(
  value: number | null | undefined,
  currency?: CurrencyCode | string,
  locale?: string
): string {
  try {
    // Use base formatCurrency which already has safety built in
    return baseFormatCurrency(value, currency, locale)
  } catch (error) {
    // Ultimate fallback - never throw
    const numValue = typeof value === 'number' && !isNaN(value) ? value : 0
    const currencyCode = currency || 'USD'
    return `${numValue.toFixed(2)} ${currencyCode}`
  }
}

/**
 * Safe currency hook wrapper
 * Always returns a valid currency code
 */
export function getSafeCurrency(currency?: CurrencyCode | string | null | undefined): CurrencyCode {
  if (!currency) {
    return 'USD' // Default fallback
  }
  
  // Validate currency code
  const validCurrencies: CurrencyCode[] = ['MAD', 'DZD', 'TND', 'EUR', 'USD', 'SAR', 'AED', 'QAR', 'KWD']
  if (validCurrencies.includes(currency as CurrencyCode)) {
    return currency as CurrencyCode
  }
  
  return 'USD' // Fallback to default
}

