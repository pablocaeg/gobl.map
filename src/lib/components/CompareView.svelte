<script lang="ts">
  import { selectedCountry, compareMode } from '$lib/stores/selection'
  import { regimeData } from '$lib/stores/regimes'
  import { locName, countryFlag, currentRate, fmtPercent } from '$lib/utils/format'
  import type { CountryData } from '$lib/utils/data-loader'
  import { fly } from 'svelte/transition'

  let isOpen = $state(false)
  let dataMap = $state<Map<string, CountryData>>(new Map())

  // Local state — independent from global selection
  let codeA = $state('')
  let codeB = $state('')

  compareMode.subscribe((v) => {
    isOpen = v
    if (v) {
      // Pre-fill country A from whatever is currently selected on the map
      const sel = selectedCountry
      sel.subscribe((s) => {
        if (s && !codeA) codeA = s.countryCode
      })()
    }
  })
  regimeData.subscribe((v) => (dataMap = v))

  let allCountries = $derived(
    [...dataMap.values()].sort((a, b) =>
      locName(a.regime.name).localeCompare(locName(b.regime.name))
    )
  )

  let countryA = $derived.by(() => {
    if (!codeA) return null
    for (const [, d] of dataMap) {
      if (d.countryCode === codeA) return d
    }
    return null
  })

  let countryB = $derived.by(() => {
    if (!codeB) return null
    for (const [, d] of dataMap) {
      if (d.countryCode === codeB) return d
    }
    return null
  })

  function close() {
    compareMode.set(false)
    codeA = ''
    codeB = ''
  }

  interface RateEntry {
    category: string
    rateKey: string
    rateName: string
    percent: string
  }

  function getAllRates(data: CountryData): RateEntry[] {
    const result: RateEntry[] = []
    for (const cat of data.regime.categories) {
      if (cat.rates) {
        for (const rate of cat.rates) {
          const v = currentRate(rate.values)
          if (v) {
            result.push({
              category: cat.code,
              rateKey: rate.key,
              rateName: locName(rate.name),
              percent: fmtPercent(v.percent)
            })
          }
        }
      }
    }
    return result
  }

  let rateComparison = $derived.by(() => {
    if (!countryA || !countryB) return []
    const ratesA = getAllRates(countryA)
    const ratesB = getAllRates(countryB)

    // Match by category + rate key (e.g., "VAT:standard"), not display name
    const allKeys = new Set([
      ...ratesA.map((r) => `${r.category}:${r.rateKey}`),
      ...ratesB.map((r) => `${r.category}:${r.rateKey}`)
    ])

    return [...allKeys].map((key) => {
      const [cat, rateKey] = key.split(':')
      const a = ratesA.find((r) => r.category === cat && r.rateKey === rateKey)
      const b = ratesB.find((r) => r.category === cat && r.rateKey === rateKey)
      // Use whichever name is available (they describe the same rate key)
      const name = a?.rateName || b?.rateName || rateKey
      return { category: cat, name, a: a?.percent || '—', b: b?.percent || '—' }
    })
  })

  let addonComparison = $derived.by(() => {
    if (!countryA || !countryB) return []
    const allKeys = new Set([
      ...countryA.addons.map((a) => a.key),
      ...countryB.addons.map((a) => a.key)
    ])
    return [...allKeys].map((key) => {
      const a = countryA!.addons.find((ad) => ad.key === key)
      const b = countryB!.addons.find((ad) => ad.key === key)
      return { name: locName((a || b)!.name), key, hasA: !!a, hasB: !!b }
    })
  })

  let generalRows = $derived.by(() => {
    if (!countryA || !countryB) return []
    return [
      { label: 'Currency', a: countryA.regime.currency, b: countryB.regime.currency },
      { label: 'Timezone', a: countryA.regime.time_zone, b: countryB.regime.time_zone },
      {
        label: 'Tax Scheme',
        a: countryA.regime.tax_scheme || '—',
        b: countryB.regime.tax_scheme || '—'
      },
      {
        label: 'Categories',
        a: String(countryA.regime.categories.length),
        b: String(countryB.regime.categories.length)
      },
      {
        label: 'Identities',
        a: String(countryA.regime.identities?.length || 0),
        b: String(countryB.regime.identities?.length || 0)
      },
      {
        label: 'Corrections',
        a: countryA.regime.corrections?.flatMap((c) => c.types).join(', ') || '—',
        b: countryB.regime.corrections?.flatMap((c) => c.types).join(', ') || '—'
      }
    ]
  })
</script>

<svelte:window
  onkeydown={(e) => {
    if (e.key === 'Escape' && isOpen) close()
  }}
/>

{#if isOpen}
  <button
    class="fixed inset-0 z-50"
    style="background: rgba(4,4,33,0.7);"
    onclick={close}
    aria-label="Close"
  ></button>

  <div
    class="fixed inset-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[700px] sm:top-[5%] sm:bottom-[5%] z-50 rounded-xl overflow-hidden flex flex-col"
    style="background: #0a0a24; border: 1px solid #1e1e42; box-shadow: 0 24px 64px rgba(0,0,0,0.6);"
    transition:fly={{ y: 20, duration: 200 }}
  >
    <!-- Header -->
    <div
      class="flex items-center justify-between px-5 py-3 shrink-0"
      style="border-bottom: 1px solid #1a1a3e;"
    >
      <span class="text-[11px] font-semibold text-grey-dim uppercase tracking-widest"
        >Compare Regimes</span
      >
      <button onclick={close} class="p-1.5 text-grey-dim hover:text-grey transition-colors">
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          stroke-width="2.5"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Country selectors -->
    <div
      class="grid grid-cols-[1fr_auto_1fr] gap-3 items-center px-5 py-4"
      style="border-bottom: 1px solid #141435;"
    >
      <select
        class="text-sm font-medium rounded-lg px-3 py-2.5 text-grey"
        style="background: #0e0e2a; border: 1px solid #1e1e42;"
        bind:value={codeA}
      >
        <option value="" disabled>Select country</option>
        {#each allCountries as c}
          <option value={c.countryCode}>
            {countryFlag(c.countryCode)} {locName(c.regime.name)}
          </option>
        {/each}
      </select>
      <span class="text-[10px] font-bold text-grey-dark uppercase">vs</span>
      <select
        class="text-sm font-medium rounded-lg px-3 py-2.5 text-grey"
        style="background: #0e0e2a; border: 1px solid #1e1e42;"
        bind:value={codeB}
      >
        <option value="" disabled>Select country</option>
        {#each allCountries as c}
          <option value={c.countryCode}>
            {countryFlag(c.countryCode)} {locName(c.regime.name)}
          </option>
        {/each}
      </select>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto panel-scroll">
      {#if countryA && countryB}
        <!-- Country headers -->
        <div class="grid grid-cols-2 gap-px" style="background: #141435;">
          {#each [countryA, countryB] as c}
            <div class="px-4 py-4 text-center" style="background: #0a0a24;">
              <span class="text-3xl">{countryFlag(c.countryCode)}</span>
              <div class="text-base font-bold text-grey mt-2">{locName(c.regime.name)}</div>
              <div class="flex items-center justify-center gap-2 mt-1">
                <span class="font-mono text-xs text-grey-dim">{c.countryCode}</span>
                <span class="text-xs text-grey-dark">{c.regime.currency}</span>
                {#if c.regime.tax_scheme}
                  <span
                    class="text-[10px] font-semibold text-blue px-1.5 py-0.5 rounded"
                    style="background: #6EC5EE10;">{c.regime.tax_scheme}</span
                  >
                {/if}
              </div>
            </div>
          {/each}
        </div>

        <!-- Tax Rates -->
        {#if rateComparison.length > 0}
          <div class="px-5 pt-4 pb-2">
            <h4 class="text-[11px] font-semibold text-grey-dim uppercase tracking-wider">
              Tax Rates
            </h4>
          </div>
          {#each rateComparison as row}
            {@const different = row.a !== row.b}
            <div
              class="grid grid-cols-[1fr_auto_1fr] items-center px-5 py-2"
              style="border-bottom: 1px solid #0e0e2a;"
            >
              <span
                class="text-sm text-right tabular-nums {different
                  ? 'font-bold text-grey'
                  : 'text-paleblue'}">{row.a}</span
              >
              <div class="px-4 text-center min-w-24">
                <span class="text-[10px] text-grey-dark">{row.category}</span>
                <div class="text-xs text-paleblue">{row.name}</div>
              </div>
              <span
                class="text-sm tabular-nums {different ? 'font-bold text-grey' : 'text-paleblue'}"
                >{row.b}</span
              >
            </div>
          {/each}
        {/if}

        <!-- Addons -->
        {#if addonComparison.length > 0}
          <div class="px-5 pt-4 pb-2">
            <h4 class="text-[11px] font-semibold text-grey-dim uppercase tracking-wider">
              Addons & Formats
            </h4>
          </div>
          {#each addonComparison as addon}
            <div
              class="grid grid-cols-[1fr_auto_1fr] items-center px-5 py-2"
              style="border-bottom: 1px solid #0e0e2a;"
            >
              <div class="text-right">
                {#if addon.hasA}
                  <span class="text-blue text-sm">✓</span>
                {:else}
                  <span class="text-grey-dark text-sm">—</span>
                {/if}
              </div>
              <div class="px-4 text-center min-w-32">
                <div class="text-xs text-paleblue">{addon.name}</div>
                <span class="text-[10px] font-mono text-grey-dark">{addon.key}</span>
              </div>
              <div>
                {#if addon.hasB}
                  <span class="text-blue text-sm">✓</span>
                {:else}
                  <span class="text-grey-dark text-sm">—</span>
                {/if}
              </div>
            </div>
          {/each}
        {/if}

        <!-- General -->
        <div class="px-5 pt-4 pb-2">
          <h4 class="text-[11px] font-semibold text-grey-dim uppercase tracking-wider">
            General
          </h4>
        </div>
        {#each generalRows as row}
          {@const different = row.a !== row.b}
          <div
            class="grid grid-cols-[1fr_auto_1fr] items-center px-5 py-2"
            style="border-bottom: 1px solid #0e0e2a;"
          >
            <span
              class="text-sm text-right {different ? 'font-semibold text-grey' : 'text-paleblue'}"
              >{row.a}</span
            >
            <span class="px-4 text-xs text-grey-dim text-center min-w-24">{row.label}</span>
            <span class="text-sm {different ? 'font-semibold text-grey' : 'text-paleblue'}"
              >{row.b}</span
            >
          </div>
        {/each}
        <div class="h-4"></div>
      {:else if countryA || countryB}
        <div class="flex flex-col items-center justify-center py-16 text-center">
          <p class="text-sm text-grey-dim">Select a second country to compare</p>
        </div>
      {:else}
        <div class="flex flex-col items-center justify-center py-16 text-center">
          <p class="text-sm text-grey-dim">Select two countries to compare their tax regimes</p>
        </div>
      {/if}
    </div>
  </div>
{/if}
