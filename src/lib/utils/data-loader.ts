import type { Regime } from '$lib/types/regime'
import type { Addon } from '$lib/types/addon'
import { alpha2ToNumeric } from '$lib/data/country-codes'
import { countryAddons, EU_ADDON_KEYS, EU_MEMBER_CODES } from '$lib/data/addon-map'

export interface CountryData {
  regime: Regime
  addons: Addon[]
  countryCode: string // Canonical alpha-2 code (GR for Greece, not EL)
  numericCode: string
}

export function loadRegimes(): Map<string, CountryData> {
  const regimeModules = import.meta.glob('$lib/data/regimes/*.json', { eager: true })
  const addonModules = import.meta.glob('$lib/data/addons/*.json', { eager: true })

  // Load all addons into a lookup by key
  const addonsByKey = new Map<string, Addon>()
  for (const [path, mod] of Object.entries(addonModules)) {
    const addon = (mod as { default: Addon }).default
    addonsByKey.set(addon.key, addon)
  }

  // Load regimes, deduplicating Greece (prefer regime-def schema)
  const regimesByCode = new Map<string, Regime>()
  for (const [path, mod] of Object.entries(regimeModules)) {
    const regime = (mod as { default: Regime }).default
    const code = regime.country

    // For Greece: EL has regime-def schema, GR has older regime schema
    // Prefer regime-def (the richer definition)
    const existing = regimesByCode.get(code)
    if (existing) {
      if (regime.$schema.includes('regime-def')) {
        regimesByCode.set(code, regime)
      }
      continue
    }

    // Check if this regime's alt codes overlap with an existing entry
    const altCodes = regime.alt_country_codes || []
    let isDuplicate = false
    for (const [existingCode, existingRegime] of regimesByCode) {
      const existingAlts = existingRegime.alt_country_codes || []
      if (existingAlts.includes(code) || altCodes.includes(existingCode)) {
        // Prefer the one with regime-def schema
        if (
          regime.$schema.includes('regime-def') &&
          !existingRegime.$schema.includes('regime-def')
        ) {
          regimesByCode.delete(existingCode)
          regimesByCode.set(code, regime)
        }
        isDuplicate = true
        break
      }
    }

    if (!isDuplicate) {
      regimesByCode.set(code, regime)
    }
  }

  // Build the final map keyed by the code that topojson uses (standard ISO alpha-2)
  const result = new Map<string, CountryData>()

  for (const [code, regime] of regimesByCode) {
    // Determine the canonical alpha-2 code for topojson lookup
    // EL → GR (topojson uses standard ISO), everything else stays the same
    const canonicalCode = code === 'EL' ? 'GR' : code
    const numericCode = alpha2ToNumeric[canonicalCode] || alpha2ToNumeric[code]

    if (!numericCode) continue

    // Collect addons for this country
    const addonKeys = [...(countryAddons[code] || []), ...(countryAddons[canonicalCode] || [])]

    // Add EU addon for EU members
    if (EU_MEMBER_CODES.includes(code) || EU_MEMBER_CODES.includes(canonicalCode)) {
      addonKeys.push(...EU_ADDON_KEYS)
    }

    // Deduplicate addon keys
    const uniqueAddonKeys = [...new Set(addonKeys)]
    const addons = uniqueAddonKeys
      .map((key) => addonsByKey.get(key))
      .filter((a): a is Addon => a !== undefined)

    result.set(numericCode, {
      regime,
      addons,
      countryCode: canonicalCode,
      numericCode
    })
  }

  return result
}
