export type ComplianceStatus = 'mandatory' | 'upcoming' | 'planned' | 'not-required' | 'unknown'

export interface ComplianceInfo {
  b2g: ComplianceStatus
  b2b: ComplianceStatus
  b2c: ComplianceStatus
}

// Full guide info loaded from src/lib/data/guides/*.json
export interface GuideInfo {
  code: string
  name: string
  b2g: ComplianceStatus
  b2b: ComplianceStatus
  b2c: ComplianceStatus
  format: string | null
  infrastructure: string | null
  model: string | null
  authority: string | null
  archiving: string | null
  eSignature: string | null
  notes: string | null
}

// Single source of truth: derive compliance from guide JSONs
const guideModules = import.meta.glob('$lib/data/guides/*.json', { eager: true })

export const compliance: Record<string, ComplianceInfo> = {}
export const guides = new Map<string, GuideInfo>()

for (const [, mod] of Object.entries(guideModules)) {
  const guide = (mod as { default: GuideInfo }).default
  guides.set(guide.code, guide)
  compliance[guide.code] = { b2g: guide.b2g, b2b: guide.b2b, b2c: guide.b2c }
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