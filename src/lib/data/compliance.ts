// E-invoicing compliance status per country
// Source: invopop.com/invoicing-guides (March 2026)

export type ComplianceStatus = 'mandatory' | 'upcoming' | 'planned' | 'not-required' | 'unknown'

export interface ComplianceInfo {
  b2g: ComplianceStatus
  b2b: ComplianceStatus
  b2c: ComplianceStatus
}

function m(
  b2g: ComplianceStatus,
  b2b: ComplianceStatus,
  b2c: ComplianceStatus
): ComplianceInfo {
  return { b2g, b2b, b2c }
}

// ISO alpha-2 → compliance status
export const compliance: Record<string, ComplianceInfo> = {
  AL: m('mandatory', 'mandatory', 'mandatory'),
  AR: m('mandatory', 'mandatory', 'mandatory'),
  AU: m('mandatory', 'planned', 'unknown'),
  AT: m('mandatory', 'not-required', 'not-required'),
  AZ: m('mandatory', 'mandatory', 'mandatory'),
  BE: m('mandatory', 'upcoming', 'not-required'),
  BO: m('mandatory', 'mandatory', 'mandatory'),
  BR: m('mandatory', 'mandatory', 'mandatory'),
  BG: m('mandatory', 'planned', 'not-required'),
  CA: m('mandatory', 'unknown', 'unknown'),
  CL: m('mandatory', 'mandatory', 'mandatory'),
  CN: m('mandatory', 'mandatory', 'mandatory'),
  CO: m('mandatory', 'mandatory', 'mandatory'),
  CR: m('mandatory', 'mandatory', 'mandatory'),
  HR: m('mandatory', 'upcoming', 'not-required'),
  CY: m('mandatory', 'unknown', 'unknown'),
  CZ: m('mandatory', 'unknown', 'unknown'),
  DK: m('mandatory', 'not-required', 'not-required'),
  DO: m('mandatory', 'mandatory', 'mandatory'),
  EC: m('mandatory', 'mandatory', 'mandatory'),
  EG: m('mandatory', 'mandatory', 'mandatory'),
  SV: m('mandatory', 'unknown', 'unknown'),
  EE: m('mandatory', 'not-required', 'not-required'),
  FI: m('mandatory', 'not-required', 'not-required'),
  FR: m('mandatory', 'upcoming', 'not-required'),
  GE: m('mandatory', 'unknown', 'unknown'),
  DE: m('mandatory', 'not-required', 'not-required'),
  GH: m('mandatory', 'mandatory', 'mandatory'),
  GR: m('mandatory', 'mandatory', 'mandatory'),
  GT: m('mandatory', 'mandatory', 'mandatory'),
  HN: m('mandatory', 'unknown', 'unknown'),
  HU: m('mandatory', 'mandatory', 'mandatory'),
  IS: m('mandatory', 'not-required', 'not-required'),
  IN: m('mandatory', 'mandatory', 'not-required'),
  ID: m('mandatory', 'mandatory', 'mandatory'),
  IE: m('mandatory', 'not-required', 'not-required'),
  IL: m('mandatory', 'unknown', 'unknown'),
  IT: m('mandatory', 'mandatory', 'mandatory'),
  JP: m('mandatory', 'not-required', 'not-required'),
  KZ: m('mandatory', 'mandatory', 'mandatory'),
  KE: m('mandatory', 'mandatory', 'mandatory'),
  LV: m('mandatory', 'planned', 'not-required'),
  LT: m('mandatory', 'planned', 'not-required'),
  LU: m('mandatory', 'not-required', 'not-required'),
  MY: m('mandatory', 'unknown', 'unknown'),
  MT: m('mandatory', 'unknown', 'unknown'),
  MU: m('mandatory', 'unknown', 'unknown'),
  MX: m('mandatory', 'mandatory', 'mandatory'),
  MA: m('mandatory', 'unknown', 'unknown'),
  NL: m('mandatory', 'not-required', 'not-required'),
  NZ: m('mandatory', 'unknown', 'unknown'),
  NI: m('mandatory', 'unknown', 'unknown'),
  NO: m('mandatory', 'not-required', 'not-required'),
  PA: m('mandatory', 'mandatory', 'mandatory'),
  PY: m('mandatory', 'mandatory', 'mandatory'),
  PE: m('mandatory', 'mandatory', 'mandatory'),
  PH: m('mandatory', 'unknown', 'unknown'),
  PL: m('mandatory', 'upcoming', 'not-required'),
  PT: m('mandatory', 'mandatory', 'mandatory'),
  RO: m('mandatory', 'mandatory', 'not-required'),
  SA: m('mandatory', 'mandatory', 'mandatory'),
  RS: m('mandatory', 'mandatory', 'not-required'),
  SG: m('mandatory', 'unknown', 'unknown'),
  SK: m('mandatory', 'planned', 'planned'),
  SI: m('mandatory', 'planned', 'not-required'),
  ZA: m('mandatory', 'unknown', 'unknown'),
  KR: m('mandatory', 'mandatory', 'mandatory'),
  ES: m('mandatory', 'mandatory', 'mandatory'),
  SE: m('mandatory', 'not-required', 'not-required'),
  CH: m('mandatory', 'not-required', 'not-required'),
  TR: m('mandatory', 'mandatory', 'mandatory'),
  UA: m('mandatory', 'unknown', 'unknown'),
  AE: m('mandatory', 'unknown', 'unknown'),
  GB: m('mandatory', 'not-required', 'not-required'),
  US: m('mandatory', 'unknown', 'unknown'),
  UY: m('mandatory', 'mandatory', 'mandatory'),
  VE: m('mandatory', 'unknown', 'unknown')
}

export function getComplianceLabel(status: ComplianceStatus): string {
  switch (status) {
    case 'mandatory':
      return 'Mandatory'
    case 'upcoming':
      return 'Upcoming'
    case 'planned':
      return 'Planned'
    case 'not-required':
      return 'Not required'
    default:
      return '—'
  }
}

export function getComplianceColor(status: ComplianceStatus): string {
  switch (status) {
    case 'mandatory':
      return '#ef4444'
    case 'upcoming':
      return '#F0B866'
    case 'planned':
      return '#94B2CD'
    case 'not-required':
      return '#4a4a5e'
    default:
      return '#2a2a50'
  }
}
