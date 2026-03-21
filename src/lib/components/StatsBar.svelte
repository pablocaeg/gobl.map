<script lang="ts">
  import { regimeData } from '$lib/stores/regimes'
  import { countryRegion, regionColors, type Region } from '$lib/data/regions'
  import type { CountryData } from '$lib/utils/data-loader'

  let dataMap = $state<Map<string, CountryData>>(new Map())
  regimeData.subscribe((v) => (dataMap = v))

  let stats = $derived.by(() => {
    const regimes = dataMap.size
    const addonKeys = new Set<string>()
    const regionCount: Record<string, number> = {}
    let totalCategories = 0

    for (const [, data] of dataMap) {
      for (const addon of data.addons) addonKeys.add(addon.key)
      const region = countryRegion[data.countryCode]
      if (region) regionCount[region] = (regionCount[region] || 0) + 1
      totalCategories += data.regime.categories.length
    }

    return { regimes, addons: addonKeys.size, regionCount, totalCategories }
  })
</script>

<div
  class="flex items-center justify-between px-5 md:px-8 py-2 text-[11px] shrink-0"
  style="background: #06061a; border-bottom: 1px solid #141435;"
>
  <!-- Left: key metrics -->
  <div class="flex items-center gap-5">
    <div class="flex items-center gap-1.5">
      <span class="font-bold text-blue tabular-nums">{stats.regimes}</span>
      <span class="text-grey-dim">regimes</span>
    </div>
    <div class="flex items-center gap-1.5">
      <span class="font-bold text-blue tabular-nums">{stats.addons}</span>
      <span class="text-grey-dim">addons</span>
    </div>
    <div class="flex items-center gap-1.5">
      <span class="font-bold text-blue tabular-nums">{stats.totalCategories}</span>
      <span class="text-grey-dim">tax categories</span>
    </div>
  </div>
  <!-- Right: region breakdown -->
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
