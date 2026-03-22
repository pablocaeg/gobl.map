<script lang="ts">
  import { selectedCountry, compareMode } from '$lib/stores/selection'
  import { regimeData } from '$lib/stores/regimes'
  import { locName, countryFlag, currentRate, fmtPercent } from '$lib/utils/format'
  import type { CountryData } from '$lib/utils/data-loader'
  import { fly } from 'svelte/transition'

  let isOpen = $state(false)
  let dataMap = $state<Map<string, CountryData>>(new Map())
  let codeA = $state('')
  let codeB = $state('')

  compareMode.subscribe((v) => {
    isOpen = v
    if (v) {
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

  function swap() {
    const tmp = codeA
    codeA = codeB
    codeB = tmp
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
              rateKey: rate.rate,
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
    const allKeys = new Set([
      ...ratesA.map((r) => `${r.category}:${r.rateKey}`),
      ...ratesB.map((r) => `${r.category}:${r.rateKey}`)
    ])
    return [...allKeys].map((key) => {
      const [cat, rateKey] = key.split(':')
      const a = ratesA.find((r) => r.category === cat && r.rateKey === rateKey)
      const b = ratesB.find((r) => r.category === cat && r.rateKey === rateKey)
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
    style="background: rgba(4,4,33,0.75);"
    onclick={close}
    aria-label="Close"
  ></button>

  <div
    class="fixed inset-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[740px] sm:top-[4%] sm:bottom-[4%] z-50 rounded-2xl overflow-hidden flex flex-col"
    style="background: #080820; border: 1px solid #1e1e42; box-shadow: 0 32px 80px rgba(0,0,0,0.7);"
    transition:fly={{ y: 20, duration: 200 }}
  >
    <!-- Header -->
    <div
      class="flex items-center justify-between px-6 py-3.5 shrink-0"
      style="border-bottom: 1px solid #141435;"
    >
      <span class="text-[11px] font-semibold text-grey-dim uppercase tracking-widest"
        >Compare Regimes</span
      >
      <button onclick={close} class="p-1.5 text-grey-dim hover:text-grey transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Country selectors -->
    <div class="grid grid-cols-[1fr_auto_1fr] gap-2 items-center px-6 py-5 shrink-0" style="border-bottom: 1px solid #141435;">
      <select
        class="text-sm font-medium rounded-lg px-3 py-2.5 text-grey w-full"
        style="background: #0c0c28; border: 1px solid #1e1e42;"
        bind:value={codeA}
      >
        <option value="" disabled>Select country</option>
        {#each allCountries as c}
          <option value={c.countryCode}>
            {countryFlag(c.countryCode)} {locName(c.regime.name)}
          </option>
        {/each}
      </select>
      <button
        onclick={swap}
        class="w-8 h-8 rounded-full flex items-center justify-center text-grey-dim hover:text-blue transition-colors"
        style="background: #141435;"
        title="Swap countries"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      </button>
      <select
        class="text-sm font-medium rounded-lg px-3 py-2.5 text-grey w-full"
        style="background: #0c0c28; border: 1px solid #1e1e42;"
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

        <!-- Country headers side by side -->
        <div class="grid grid-cols-2" style="border-bottom: 1px solid #141435;">
          {#each [countryA, countryB] as c}
            <div class="px-6 py-5 text-center" style="background: #0a0a24;">
              <span class="text-4xl">{countryFlag(c.countryCode)}</span>
              <div class="text-lg font-bold text-grey mt-2">{locName(c.regime.name)}</div>
              <div class="flex items-center justify-center gap-2 mt-1.5">
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

        <!-- Tax Rates section -->
        {#if rateComparison.length > 0}
          <div class="px-6 pt-5 pb-3">
            <h4 class="text-[11px] font-semibold text-grey-dim uppercase tracking-wider">Tax Rates</h4>
          </div>
          <div class="mx-6 rounded-lg overflow-hidden" style="border: 1px solid #141435;">
            {#each rateComparison as row, i}
              {@const different = row.a !== row.b}
              {@const bothHave = row.a !== '—' && row.b !== '—'}
              <div
                class="grid grid-cols-[1fr_auto_1fr] items-center px-4 py-2.5"
                style="background: {i % 2 === 0 ? '#0c0c28' : '#0a0a24'};"
              >
                <div class="text-right">
                  <span class="text-sm tabular-nums {row.a === '—' ? 'text-grey-dark' : different ? 'font-bold text-grey' : 'text-paleblue'}">
                    {row.a}
                  </span>
                </div>
                <div class="px-5 text-center min-w-28">
                  <div class="text-[10px] font-mono text-grey-dark">{row.category}</div>
                  <div class="text-xs text-paleblue leading-tight">{row.name}</div>
                </div>
                <div>
                  <span class="text-sm tabular-nums {row.b === '—' ? 'text-grey-dark' : different ? 'font-bold text-grey' : 'text-paleblue'}">
                    {row.b}
                  </span>
                </div>
              </div>
            {/each}
          </div>
        {/if}

        <!-- Addons section -->
        {#if addonComparison.length > 0}
          <div class="px-6 pt-5 pb-3">
            <h4 class="text-[11px] font-semibold text-grey-dim uppercase tracking-wider">Addons & Formats</h4>
          </div>
          <div class="mx-6 rounded-lg overflow-hidden" style="border: 1px solid #141435;">
            {#each addonComparison as addon, i}
              <div
                class="grid grid-cols-[1fr_auto_1fr] items-center px-4 py-2.5"
                style="background: {i % 2 === 0 ? '#0c0c28' : '#0a0a24'};"
              >
                <div class="text-right">
                  {#if addon.hasA}
                    <span class="inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold" style="background: #6EC5EE18; color: #6EC5EE;">✓</span>
                  {:else}
                    <span class="text-grey-dark text-sm">—</span>
                  {/if}
                </div>
                <div class="px-5 text-center min-w-36">
                  <div class="text-xs text-paleblue">{addon.name}</div>
                  <span class="text-[10px] font-mono text-grey-dark">{addon.key}</span>
                </div>
                <div>
                  {#if addon.hasB}
                    <span class="inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold" style="background: #6EC5EE18; color: #6EC5EE;">✓</span>
                  {:else}
                    <span class="text-grey-dark text-sm">—</span>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        {/if}

        <!-- General section -->
        <div class="px-6 pt-5 pb-3">
          <h4 class="text-[11px] font-semibold text-grey-dim uppercase tracking-wider">General</h4>
        </div>
        <div class="mx-6 mb-6 rounded-lg overflow-hidden" style="border: 1px solid #141435;">
          {#each generalRows as row, i}
            {@const different = row.a !== row.b}
            <div
              class="grid grid-cols-[1fr_auto_1fr] items-center px-4 py-2.5"
              style="background: {i % 2 === 0 ? '#0c0c28' : '#0a0a24'};"
            >
              <span class="text-sm text-right {different ? 'font-semibold text-grey' : 'text-paleblue'}">{row.a}</span>
              <span class="px-5 text-xs text-grey-dim text-center min-w-28">{row.label}</span>
              <span class="text-sm {different ? 'font-semibold text-grey' : 'text-paleblue'}">{row.b}</span>
            </div>
          {/each}
        </div>

      {:else if countryA || countryB}
        <div class="flex flex-col items-center justify-center py-20 text-center px-8">
          <div class="w-12 h-12 rounded-full flex items-center justify-center mb-4" style="background: #141435;">
            <svg class="w-6 h-6 text-grey-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
          </div>
          <p class="text-sm text-grey-dim">Pick a second country to start comparing</p>
        </div>
      {:else}
        <div class="flex flex-col items-center justify-center py-20 text-center px-8">
          <div class="w-12 h-12 rounded-full flex items-center justify-center mb-4" style="background: #141435;">
            <svg class="w-6 h-6 text-grey-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
            </svg>
          </div>
          <p class="text-sm text-grey-dim">Select two countries to compare their tax regimes</p>
        </div>
      {/if}
    </div>
  </div>
{/if}
