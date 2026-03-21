<script lang="ts">
  import { regimeData } from '$lib/stores/regimes'
  import { selectedCountry } from '$lib/stores/selection'
  import { locName, countryFlag } from '$lib/utils/format'
  import type { CountryData } from '$lib/utils/data-loader'

  let query = $state('')
  let focused = $state(false)
  let dataMap = $state<Map<string, CountryData>>(new Map())
  regimeData.subscribe((v) => (dataMap = v))

  let results = $derived.by(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    const matches: CountryData[] = []
    for (const [, data] of dataMap) {
      const name = locName(data.regime.name).toLowerCase()
      const code = data.countryCode.toLowerCase()
      if (name.includes(q) || code.includes(q)) {
        matches.push(data)
      }
    }
    return matches.slice(0, 6)
  })

  function selectCountry(data: CountryData) {
    selectedCountry.set(data)
    query = ''
    focused = false
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      query = ''
      focused = false
    }
  }
</script>

<div class="relative">
  <div class="relative">
    <svg
      class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-dim pointer-events-none"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
    <input
      type="text"
      placeholder="Search countries..."
      bind:value={query}
      onfocus={() => (focused = true)}
      onblur={() => setTimeout(() => (focused = false), 200)}
      onkeydown={handleKeydown}
      class="w-56 pl-9 pr-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue/30 placeholder:text-grey-dim transition-all text-grey"
      style="background: #0e0e2acc; border-color: #2a2a50; backdrop-filter: blur(12px);"
    />
  </div>

  {#if focused && results.length > 0}
    <div
      class="absolute top-full mt-1.5 w-64 rounded-lg border overflow-hidden shadow-2xl"
      style="background: #0e0e2af0; border-color: #2a2a50; backdrop-filter: blur(12px);"
    >
      {#each results as result}
        <button
          class="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors"
          style="hover:background-color: red;"
          onmouseenter={(e) => (e.currentTarget.style.background = '#1a1a3e')}
          onmouseleave={(e) => (e.currentTarget.style.background = 'transparent')}
          onmousedown={() => selectCountry(result)}
        >
          <span class="text-base">{countryFlag(result.countryCode)}</span>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium text-grey truncate">{locName(result.regime.name)}</div>
            <div class="text-xs text-grey-dim">{result.countryCode} · {result.regime.currency}</div>
          </div>
          {#if result.regime.tax_scheme}
            <span
              class="text-[10px] font-medium px-1.5 py-0.5 rounded text-blue"
              style="background: #6EC5EE15;">{result.regime.tax_scheme}</span
            >
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>
