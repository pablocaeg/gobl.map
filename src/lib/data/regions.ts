export type Region = 'Europe' | 'Americas' | 'Asia-Pacific' | 'Middle East & Africa'

export const countryRegion: Record<string, Region> = {
  // Europe
  AT: 'Europe',
  BE: 'Europe',
  CH: 'Europe',
  CZ: 'Europe',
  DE: 'Europe',
  DK: 'Europe',
  EL: 'Europe',
  ES: 'Europe',
  FR: 'Europe',
  GB: 'Europe',
  GR: 'Europe',
  IE: 'Europe',
  IT: 'Europe',
  NL: 'Europe',
  PL: 'Europe',
  PT: 'Europe',
  SE: 'Europe',

  // Americas
  AR: 'Americas',
  BR: 'Americas',
  CA: 'Americas',
  CO: 'Americas',
  MX: 'Americas',
  US: 'Americas',

  // Asia-Pacific
  IN: 'Asia-Pacific',
  SG: 'Asia-Pacific',

  // Middle East & Africa
  AE: 'Middle East & Africa'
}

// Colors that work on the dark navy map background
export const regionColors: Record<Region, string> = {
  Europe: '#6EC5EE', // GOBL blue
  Americas: '#7DD3A8', // Soft green
  'Asia-Pacific': '#C4A7E7', // Soft purple
  'Middle East & Africa': '#F0B866' // Warm amber
}
