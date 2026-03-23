<script lang="ts">
  import { onDestroy } from 'svelte'
  import { regimeData } from '$lib/stores/regimes'
  import { pendingRegimes } from '$lib/stores/pending'
  import { compliance } from '$lib/data/compliance'
  import { countryRegion, regionColors, type Region } from '$lib/data/regions'
  import { highlightMode, type HighlightMode } from '$lib/stores/filters'
  import type { CountryData } from '$lib/utils/data-loader'
  import type { PendingRegime } from '$lib/utils/pending-regimes'

  let dataMap = $state<Map<string, CountryData>>(new Map())
  let pending = $state<PendingRegime[]>([])
  let highlight = $state<HighlightMode>(null)
  const unsubs = [
    regimeData.subscribe((v) => (dataMap = v)),
    pendingRegimes.subscribe((v) => (pending = v)),
    highlightMode.subscribe((v) => (highlight = v))
  ]

  function toggleHighlight(mode: 'needs' | 'pending') {
    highlightMode.set(highlight === mode ? null : mode)
  }
  onDestroy(() => unsubs.forEach((u) => u()))

  let stats = $derived.by(() => {
    const supported = dataMap.size
    const supportedCodes = new Set([...dataMap.values()].map((d) => d.countryCode))
    const pendingCodes = new Set(
      pending
        .filter((p) => !supportedCodes.has(p.countryCode))
        .map((p) => p.countryCode)
    )

    const totalCompliance = Object.keys(compliance).length
    const needsCount = Object.entries(compliance).filter(
      ([code, c]) =>
        (c.b2b === 'mandatory' || c.b2b === 'upcoming' || c.b2c === 'mandatory' || c.b2c === 'upcoming') &&
        !supportedCodes.has(code) &&
        !pendingCodes.has(code)
    ).length

    const addonKeys = new Set<string>()
    const regionCount: Record<string, number> = {}
    for (const [, data] of dataMap) {
      for (const addon of data.addons) addonKeys.add(addon.key)
      const region = countryRegion[data.countryCode]
      if (region) regionCount[region] = (regionCount[region] || 0) + 1
    }

    return {
      supported,
      inProgress: pendingCodes.size,
      needsCount,
      totalCompliance,
      addons: addonKeys.size,
      regionCount
    }
  })
</script>

<div
  class="flex items-center justify-between px-3 sm:px-5 md:px-8 py-2 text-[11px] shrink-0 overflow-x-auto no-scrollbar"
  style="background: #06061a; border-bottom: 1px solid #141435;"
>
  <div class="flex items-center gap-3 sm:gap-5 shrink-0">
    <div class="flex items-center gap-1.5">
      <span class="font-bold text-blue tabular-nums">{stats.supported}</span>
      <span class="text-grey-dim">regimes</span>
    </div>
    <div class="w-px h-3.5 shrink-0" style="background: #1a1a3e;"></div>
    <div class="flex items-center gap-1.5">
      <span class="font-bold text-blue tabular-nums">{stats.addons}</span>
      <span class="text-grey-dim">addons</span>
    </div>
    <div class="w-px h-3.5 shrink-0 hidden sm:block" style="background: #1a1a3e;"></div>
    <button
      class="hidden sm:flex items-center gap-1.5 rounded px-1.5 py-0.5 -mx-1.5 -my-0.5 transition-colors cursor-pointer"
      style="background: {highlight === 'pending' ? '#F0B86620' : 'transparent'};"
      onclick={() => toggleHighlight('pending')}
      aria-pressed={highlight === 'pending'}
    >
      <span class="font-bold tabular-nums" style="color: #F0B866;">{stats.inProgress}</span>
      <span class="transition-colors" style="color: {highlight === 'pending' ? '#F0B866' : ''};" class:text-grey-dim={highlight !== 'pending'}>in progress</span>
    </button>
    {#if stats.needsCount > 0}
      <div class="w-px h-3.5 shrink-0 hidden sm:block" style="background: #1a1a3e;"></div>
      <button
        class="hidden sm:flex items-center gap-1.5 rounded px-1.5 py-0.5 -mx-1.5 -my-0.5 transition-colors cursor-pointer"
        style="background: {highlight === 'needs' ? '#e87b7b20' : 'transparent'};"
        onclick={() => toggleHighlight('needs')}
        aria-pressed={highlight === 'needs'}
      >
        <span class="font-bold tabular-nums" style="color: #e87b7b;">{stats.needsCount}</span>
        <span class="transition-colors" style="color: {highlight === 'needs' ? '#e87b7b' : ''};" class:text-grey-dim={highlight !== 'needs'}>need contribution</span>
      </button>
    {/if}
  </div>
  <div class="hidden md:flex items-center gap-4">
    {#each Object.entries(stats.regionCount) as [region, count]}
      {@const color = regionColors[region as Region]}
      <div class="flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-sm" style="background: {color}"></span>
        <span class="text-grey-dim">{region}</span>
        <span class="font-semibold text-grey tabular-nums">{count}</span>
      </div>
    {/each}
  </div>
</div>
