export interface PendingRegime {
  countryCode: string
  countryName: string
  prUrl: string
  prTitle: string
  author: string
}

// Known country name → code mappings for names that appear in PR titles
const NAME_TO_CODE: Record<string, string> = {
  japan: 'JP',
  finland: 'FI',
  andorra: 'AD',
  turkey: 'TR',
  türkiye: 'TR',
  turkiye: 'TR',
  'saudi arabia': 'SA',
  norway: 'NO',
  israel: 'IL',
  romania: 'RO',
  romanian: 'RO',
  hungary: 'HU',
  croatia: 'HR',
  bulgaria: 'BG',
  'south korea': 'KR',
  korea: 'KR',
  australia: 'AU',
  'new zealand': 'NZ',
  egypt: 'EG',
  nigeria: 'NG',
  kenya: 'KE',
  chile: 'CL',
  peru: 'PE',
  ecuador: 'EC',
  uruguay: 'UY',
  paraguay: 'PY',
  czech: 'CZ',
  'czech republic': 'CZ'
}

export async function fetchPendingRegimes(): Promise<PendingRegime[]> {
  try {
    const res = await fetch(
      'https://api.github.com/repos/invopop/gobl/pulls?state=open&per_page=50',
      { headers: { Accept: 'application/vnd.github.v3+json' } }
    )
    if (!res.ok) return []
    const prs = await res.json()

    const results: PendingRegime[] = []
    const seen = new Set<string>()

    for (const pr of prs) {
      const title: string = pr.title || ''
      const lower = title.toLowerCase()

      // Skip PRs that aren't about adding regimes
      if (
        !lower.includes('regime') &&
        !lower.includes('tax') &&
        !lower.includes('add')
      )
        continue

      // Try to extract country code from parentheses: "Add Japan (JP)"
      const codeMatch = title.match(/\(([A-Z]{2})\)/)
      let code = codeMatch ? codeMatch[1] : ''
      let name = ''

      // Try to extract from title pattern: "Add <Country> tax regime"
      if (!code) {
        for (const [countryName, countryCode] of Object.entries(NAME_TO_CODE)) {
          if (lower.includes(countryName)) {
            code = countryCode
            name = countryName.charAt(0).toUpperCase() + countryName.slice(1)
            break
          }
        }
      }

      // Try prefix pattern: "sa: add Saudi Arabia"
      if (!code) {
        const prefixMatch = title.match(/^([a-z]{2}):\s/i)
        if (prefixMatch) {
          code = prefixMatch[1].toUpperCase()
        }
      }

      if (!code || seen.has(code)) continue
      seen.add(code)

      // Get country name from parentheses context or NAME_TO_CODE
      if (!name && codeMatch) {
        const beforeParen = title.substring(0, title.indexOf('(')).trim()
        const words = beforeParen.split(/\s+/)
        // Take last 1-3 words before the parenthesis as country name
        name = words.slice(-3).join(' ').replace(/^(add|feat:?\s*add|feat\(regimes\):?\s*add)\s*/i, '').trim()
      }
      if (!name) {
        name = Object.entries(NAME_TO_CODE).find(([, c]) => c === code)?.[0] || code
        name = name.charAt(0).toUpperCase() + name.slice(1)
      }

      results.push({
        countryCode: code,
        countryName: name,
        prUrl: pr.html_url,
        prTitle: title,
        author: pr.user?.login || ''
      })
    }

    return results
  } catch {
    return []
  }
}
