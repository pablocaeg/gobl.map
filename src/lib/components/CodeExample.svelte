<script lang="ts">
  import type { CountryData } from '$lib/utils/data-loader'
  import { locName, currentRate } from '$lib/utils/format'
  import CopyButton from './CopyButton.svelte'

  let { country }: { country: CountryData } = $props()
  let expanded = $state(false)

  let code = $derived.by(() => {
    const r = country.regime
    const cat = r.categories[0]
    const stdRate = cat?.rates?.find((rt) => rt.rate === 'standard' || rt.rate === 'general')
    const rateVal = stdRate ? currentRate(stdRate.values) : null
    const percent = rateVal ? rateVal.percent.replace('%', '') : '0'

    const example = {
      $schema: 'https://gobl.org/draft-0/bill/invoice',
      currency: r.currency,
      tax: { id: `${r.country}XXXXXXXX` },
      supplier: {
        name: 'Example Corp',
        tax_id: { country: r.country, code: 'XXXXXXXX' }
      },
      customer: {
        name: 'Customer Ltd',
        tax_id: { country: r.country, code: 'YYYYYYYY' }
      },
      lines: [
        {
          quantity: '1',
          item: { name: 'Service', price: '100.00' },
          taxes: [{ cat: cat?.code || 'VAT', rate: 'standard' }]
        }
      ]
    }

    return JSON.stringify(example, null, 2)
  })
</script>

<div>
  <button
    class="w-full flex items-center justify-between text-left"
    onclick={() => (expanded = !expanded)}
  >
    <h4 class="text-[11px] font-semibold text-grey-dim uppercase tracking-wider">Code Example</h4>
    <svg
      class="w-3.5 h-3.5 text-grey-dark transition-transform duration-200 {expanded
        ? 'rotate-180'
        : ''}"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  {#if expanded}
    <div class="mt-2 rounded-lg overflow-hidden" style="border: 1px solid #1e1e42;">
      <div
        class="flex items-center justify-between px-3 py-1.5"
        style="background: #141435; border-bottom: 1px solid #1e1e42;"
      >
        <span class="text-[10px] font-mono text-grey-dark"
          >GOBL Invoice — {locName(country.regime.name)}</span
        >
        <CopyButton text={code} label="Copy" />
      </div>
      <pre
        class="p-3 text-xs text-paleblue leading-relaxed overflow-x-auto"
        style="background: #0a0a20; margin: 0;"><code>{code}</code></pre>
    </div>
  {/if}
</div>
