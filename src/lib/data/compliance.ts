// Loaded from src/lib/data/guides/*.json at build time

export type ComplianceStatus = 'mandatory' | 'upcoming' | 'planned' | 'not-required' | 'unknown'

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

export function loadGuides(): Map<string, GuideInfo> {
  const modules = import.meta.glob('$lib/data/guides/*.json', { eager: true })
  const result = new Map<string, GuideInfo>()
  for (const [, mod] of Object.entries(modules)) {
    const guide = (mod as { default: GuideInfo }).default
    result.set(guide.code, guide)
  }
  return result
}

export function getComplianceLabel(status: ComplianceStatus | null | undefined): string {
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

export function getComplianceColor(status: ComplianceStatus | null | undefined): string {
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

export function needsInvoicing(guide: GuideInfo): boolean {
  return (
    guide.b2b === 'mandatory' ||
    guide.b2b === 'upcoming' ||
    guide.b2c === 'mandatory' ||
    guide.b2c === 'upcoming'
  )
}
