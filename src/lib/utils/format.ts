import type { LocalizedString, RateValue } from '$lib/types/regime'

/** Extract English name from localized string, with fallback to first available */
export function locName(name: LocalizedString | undefined): string {
  if (!name) return ''
  return name.en || name.es || name.de || name.fr || Object.values(name)[0] || ''
}

/** Get the current (most recent, non-disabled) rate value */
export function currentRate(values: RateValue[]): RateValue | undefined {
  return values.find((v) => !v.disabled)
}

/** Format a percentage string for display (e.g., "21.0%" → "21%") */
export function fmtPercent(percent: string): string {
  // Remove trailing zeros and unnecessary decimal point
  const num = parseFloat(percent)
  if (isNaN(num)) return percent
  return num % 1 === 0 ? `${num}%` : `${num}%`
}

/** Generate flag emoji from ISO alpha-2 country code */
export function countryFlag(alpha2: string): string {
  const code = alpha2 === 'EL' ? 'GR' : alpha2
  return String.fromCodePoint(
    ...code
      .toUpperCase()
      .split('')
      .map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
  )
}
