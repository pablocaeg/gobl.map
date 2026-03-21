<script lang="ts">
  import { selectedCountry, compareCountry, compareMode } from '$lib/stores/selection'
  import { regimeData } from '$lib/stores/regimes'
  import { locName, countryFlag, currentRate, fmtPercent } from '$lib/utils/format'
  import { countryRegion, regionColors } from '$lib/data/regions'
  import type { CountryData } from '$lib/utils/data-loader'
  import type { Region } from '$lib/data/regions'
  import { fly } from 'svelte/transition'

  let countryA = $state<CountryData | null>(null)
  let countryB = $state<CountryData | null>(null)
  let isComparing = $state(false)
  let dataMap = $state<Map<string, CountryData>>(new Map())

  selectedCountry.subscribe((v) => (countryA = v))
  compareCountry.subscribe((v) => (countryB = v))
  compareMode.subscribe((v) => (isComparing = v))
  regimeData.subscribe((v) => (dataMap = v))

  let allCountries = $derived(
    [...dataMap.values()].sort((a, b) =>
      locName(a.regime.name).localeCompare(locName(b.regime.name))
    )
  )

  function close() {
    compareMode.set(false)
    compareCountry.set(null)
  }

  function selectA(code: string) {
    for (const [, d] of dataMap) {
      if (d.countryCode === code) {
        selectedCountry.set(d)
        return
      }
    }
  }

  function selectB(code: string) {
    for (const [, d] of dataMap) {
      if (d.countryCode === code) {
        compareCountry.set(d)
        return
      }
    }
  }

  function getAllRates(
    data: CountryData
  ): { category: string; rateName: string; percent: string }[] {
    const result: { category: string; rateName: string; percent: string }[] = []
    for (const cat of data.regime.categories) {
      if (cat.rates) {
        for (const rate of cat.rates) {
          const v = currentRate(rate.values)
          if (v) {
            result.push({
              category: cat.code,
              rateName: locName(rate.name),
              percent: fmtPercent(v.percent)
            })
          }
        }
      }
    }
    return result
  }

  // Build unified rate comparison: merge all rate names across both countries
  let rateComparison = $derived.by(() => {
    if (!countryA || !countryB) return []
    const ratesA = getAllRates(countryA)
    const ratesB = getAllRates(countryB)
    const allNames = new Set([
      ...ratesA.map((r) => `${r.category}:${r.rateName}`),
      ...ratesB.map((r) => `${r.category}:${r.rateName}`)
    ])
    return [...allNames].map((key) => {
      const [cat, name] = key.split(':')
      const a = ratesA.find((r) => r.category === cat && r.rateName === name)
      const b = ratesB.find((r) => r.category === cat && r.rateName === name)
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
</script>

<svelte:window
  onkeydown={(e) => {
    if (e.key === 'Escape') close()
  }}
/>

{#if isComparing}
  <button
    class="fixed inset-0 z-50"
    style="background: rgba(4,4,33,0.7); backdrop-filter: blur(4px);"
    onclick={close}
    aria-label="Close"
  ></button>

  <div
    class="fixed inset-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[720px] sm:top-[5%] sm:bottom-[5%] z-50 rounded-xl overflow-hidden flex flex-col"
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
        class="text-sm font-medium rounded-lg px-3 py-2.5 text-grey appearance-none"
        style="background: #0e0e2a; border: 1px solid #1e1e42;"
        value={countryA?.countryCode || ''}
        onchange={(e) => selectA((e.target as HTMLSelectElement).value)}
      >
        <option value="" disabled>Select first country</option>
        {#each allCountries as c}
          <option value={c.countryCode}
            >{countryFlag(c.countryCode)} {locName(c.regime.name)}</option
          >
        {/each}
      </select>
      <span class="text-[10px] font-bold text-grey-dark uppercase">vs</span>
      <select
        class="text-sm font-medium rounded-lg px-3 py-2.5 text-grey appearance-none"
        style="background: #0e0e2a; border: 1px solid #1e1e42;"
        value={countryB?.countryCode || ''}
        onchange={(e) => selectB((e.target as HTMLSelectElement).value)}
      >
        <option value="" disabled>Select second country</option>
        {#each allCountries as c}
          <option value={c.countryCode}
            >{countryFlag(c.countryCode)} {locName(c.regime.name)}</option
          >
        {/each}
      </select>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto panel-scroll">
      {#if countryA && countryB}
        <!-- Country headers -->
        <div class="grid grid-cols-[1fr_1fr] gap-px" style="background: #141435;">
          {#each [countryA, countryB] as c}
            {@const region = countryRegion[c.countryCode] as Region}
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

        <!-- Tax Rates comparison -->
        {#if rateComparison.length > 0}
          <div class="px-5 pt-4 pb-2">
            <h4 class="text-[11px] font-semibold text-grey-dim uppercase tracking-wider mb-3">
              Tax Rates
            </h4>
          </div>
          <div style="border-top: 1px solid #141435;">
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
                <div class="px-4 text-center">
                  <span class="text-[10px] text-grey-dark">{row.category}</span>
                  <div class="text-xs text-paleblue">{row.name}</div>
                </div>
                <span
                  class="text-sm tabular-nums {different ? 'font-bold text-grey' : 'text-paleblue'}"
                  >{row.b}</span
                >
              </div>
            {/each}
          </div>
        {/if}

        <!-- Addons comparison -->
        {#if addonComparison.length > 0}
          <div class="px-5 pt-4 pb-2">
            <h4 class="text-[11px] font-semibold text-grey-dim uppercase tracking-wider mb-3">
              Addons & Formats
            </h4>
          </div>
          <div style="border-top: 1px solid #141435;">
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
                <div class="px-4 text-center">
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
          </div>
        {/if}

        <!-- General info -->
        <div class="px-5 pt-4 pb-2">
          <h4 class="text-[11px] font-semibold text-grey-dim uppercase tracking-wider mb-3">
            General
          </h4>
        </div>
        {#each [{ label: 'Timezone', a: countryA.regime.time_zone, b: countryB.regime.time_zone }, { label: 'Categories', a: String(countryA.regime.categories.length), b: String(countryB.regime.categories.length) }, { label: 'Identities', a: String(countryA.regime.identities?.length || 0), b: String(countryB.regime.identities?.length || 0) }, { label: 'Corrections', a: countryA.regime.corrections
                ?.flatMap((c) => c.types)
                .join(', ') || '—', b: countryB.regime.corrections
                ?.flatMap((c) => c.types)
                .join(', ') || '—' }] as row}
          {@const different = row.a !== row.b}
          <div
            class="grid grid-cols-[1fr_auto_1fr] items-center px-5 py-2"
            style="border-bottom: 1px solid #0e0e2a;"
          >
            <span
              class="text-sm text-right {different ? 'font-semibold text-grey' : 'text-paleblue'}"
              >{row.a}</span
            >
            <span class="px-4 text-xs text-grey-dim text-center w-28">{row.label}</span>
            <span class="text-sm {different ? 'font-semibold text-grey' : 'text-paleblue'}"
              >{row.b}</span
            >
          </div>
        {/each}

        <div class="h-4"></div>
      {:else}
        <div class="flex flex-col items-center justify-center py-16 text-center">
          <span class="text-3xl mb-3">🔍</span>
          <p class="text-sm text-grey-dim">
            Select two countries above to compare their tax regimes
          </p>
        </div>
      {/if}
    </div>
  </div>
{/if}
