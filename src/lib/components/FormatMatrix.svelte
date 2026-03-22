<script lang="ts">
  import { regimeData } from '$lib/stores/regimes'
  import { locName } from '$lib/utils/format'
  import Flag from './Flag.svelte'
  import type { CountryData } from '$lib/utils/data-loader'

  let dataMap = $state<Map<string, CountryData>>(new Map())
  regimeData.subscribe((v) => (dataMap = v))

  // Known conversion format repos in the GOBL ecosystem
  const formats = [
    { key: 'ubl', name: 'UBL', desc: 'Universal Business Language' },
    { key: 'cii', name: 'CII', desc: 'Cross-Industry Invoice' },
    { key: 'facturae', name: 'FacturaE', desc: 'Spain B2G' },
    { key: 'fatturapa', name: 'FatturaPA', desc: 'Italy SDI' },
    { key: 'cfdi', name: 'CFDI', desc: 'Mexico SAT' },
    { key: 'ksef', name: 'KSeF', desc: 'Poland FA-VAT' },
    { key: 'xinvoice', name: 'XInvoice', desc: 'Factur-X / ZUGFeRD' },
    { key: 'ticketbai', name: 'TicketBAI', desc: 'Spain Basque' },
    { key: 'verifactu', name: 'VeriFactu', desc: 'Spain AEAT' }
  ]

  // Map addon keys to format categories
  function getFormatsForCountry(data: CountryData): Set<string> {
    const fmts = new Set<string>()
    for (const addon of data.addons) {
      const k = addon.key.toLowerCase()
      if (k.includes('facturae')) fmts.add('facturae')
      if (k.includes('sdi') || k.includes('fatturapa')) fmts.add('fatturapa')
      if (k.includes('cfdi')) fmts.add('cfdi')
      if (k.includes('favat') || k.includes('ksef')) fmts.add('ksef')
      if (k.includes('facturx') || k.includes('zugferd') || k.includes('xrechnung'))
        fmts.add('xinvoice')
      if (k.includes('tbai') || k.includes('ticketbai')) fmts.add('ticketbai')
      if (k.includes('verifactu')) fmts.add('verifactu')
      if (k.includes('en16931') || k.includes('choruspro') || k.includes('ctc')) fmts.add('ubl')
      if (
        k.includes('mydata') ||
        k.includes('arca') ||
        k.includes('dian') ||
        k.includes('saft') ||
        k.includes('nfe') ||
        k.includes('nfse')
      )
        fmts.add('ubl')
    }
    // EU countries generally support UBL and CII
    const euCodes = [
      'AT',
      'BE',
      'CZ',
      'DE',
      'DK',
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
    if (euCodes.includes(data.countryCode)) {
      fmts.add('ubl')
      fmts.add('cii')
    }
    return fmts
  }

  let rows = $derived.by(() => {
    return [...dataMap.values()]
      .sort((a, b) => locName(a.regime.name).localeCompare(locName(b.regime.name)))
      .map((data) => ({
        data,
        formats: getFormatsForCountry(data)
      }))
  })
</script>

<div class="h-full overflow-auto panel-scroll">
  <table class="w-full text-sm">
    <thead class="sticky top-0 z-10" style="background: #06061a;">
      <tr style="border-bottom: 1px solid #1a1a3e;">
        <th
          class="text-left px-4 py-3 text-[11px] font-semibold text-grey-dim uppercase tracking-wider sticky left-0 z-20"
          style="background: #06061a;">Country</th
        >
        {#each formats as fmt}
          <th class="px-2 py-3 text-center" title={fmt.desc}>
            <span class="text-[10px] font-semibold text-grey-dim uppercase tracking-wider"
              >{fmt.name}</span
            >
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each rows as row}
        <tr style="border-bottom: 1px solid #0e0e2a;">
          <td class="px-4 py-2 sticky left-0" style="background: #060618;">
            <div class="flex items-center gap-2">
              <Flag code={row.data.countryCode} />
              <span class="text-sm font-medium text-grey">{locName(row.data.regime.name)}</span>
            </div>
          </td>
          {#each formats as fmt}
            <td class="px-2 py-2 text-center">
              {#if row.formats.has(fmt.key)}
                <span
                  class="inline-block w-5 h-5 rounded-full leading-5 text-center text-[11px] font-bold"
                  style="background: #6EC5EE20; color: #6EC5EE;">✓</span
                >
              {:else}
                <span class="text-grey-dark text-[10px]">—</span>
              {/if}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
