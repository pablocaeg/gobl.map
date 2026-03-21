// Maps country alpha-2 codes to their addon keys
export const countryAddons: Record<string, string[]> = {
  AR: ['ar-arca-v4'],
  BR: ['br-nfe-v4', 'br-nfse-v1'],
  CO: ['co-dian-v2'],
  DE: ['de-xrechnung-v3', 'de-zugferd-v2'],
  ES: ['es-facturae-v3', 'es-sii-v1', 'es-tbai-v1', 'es-verifactu-v1'],
  FR: ['fr-choruspro-v1', 'fr-ctc-flow2-v1', 'fr-ctc-v1', 'fr-facturx-v1'],
  GR: ['gr-mydata-v1'],
  EL: ['gr-mydata-v1'],
  IT: ['it-sdi-v1', 'it-ticket-v1'],
  MX: ['mx-cfdi-v4'],
  PL: ['pl-favat-v2', 'pl-favat-v3'],
  PT: ['pt-saft-v1']
}

// EU-wide addon applies to all EU member countries
export const EU_ADDON_KEYS = ['eu-en16931-v2017']

export const EU_MEMBER_CODES = [
  'AT',
  'BE',
  'CZ',
  'DE',
  'DK',
  'EL',
  'ES',
  'FR',
  'GR',
  'IE',
  'IT',
  'NL',
  'PL',
  'PT',
  'SE'
]
