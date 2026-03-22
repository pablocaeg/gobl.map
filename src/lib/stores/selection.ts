import { writable, get } from 'svelte/store'
import type { CountryData } from '$lib/utils/data-loader'
import type { GuideInfo } from '$lib/data/compliance'
import { regimeData } from './regimes'

export const selectedCountry = writable<CountryData | null>(null)
export const selectedGuide = writable<GuideInfo | null>(null)
export const compareCountry = writable<CountryData | null>(null)
export const compareMode = writable(false)

// Sync selection to URL hash
selectedCountry.subscribe((v) => {
  if (typeof window === 'undefined') return
  if (v) {
    const code = v.regime.country.toLowerCase()
    const url = new URL(window.location.href)
    url.hash = code
    window.history.replaceState({}, '', url.toString())
  } else {
    const url = new URL(window.location.href)
    if (url.hash) {
      url.hash = ''
      window.history.replaceState({}, '', url.toString())
    }
  }
})

export function restoreFromHash() {
  if (typeof window === 'undefined') return
  const hash = window.location.hash.replace('#', '').toUpperCase()
  if (!hash) return

  const data = get(regimeData)
  for (const [, countryData] of data) {
    if (countryData.countryCode === hash || countryData.regime.country === hash) {
      selectedCountry.set(countryData)
      return
    }
  }
}
