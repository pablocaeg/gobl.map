<script lang="ts">
  import { regimeData } from '$lib/stores/regimes'
  import { pendingRegimes } from '$lib/stores/pending'
  import { compliance } from '$lib/data/compliance'
  import { countryRegion, regionColors, type Region } from '$lib/data/regions'
  import type { CountryData } from '$lib/utils/data-loader'
  import type { PendingRegime } from '$lib/utils/pending-regimes'

  let dataMap = $state<Map<string, CountryData>>(new Map())
  let pending = $state<PendingRegime[]>([])
  regimeData.subscribe((v) => (dataMap = v))
  pendingRegimes.subscribe((v) => (pending = v))

  let stats = $derived.by(() => {
    const supported = dataMap.size
    const supportedCodes = new Set([...dataMap.values()].map((d) => d.countryCode))
    const pendingCodes = new Set(
      pending
        .filter((p) => !supportedCodes.has(p.countryCode))
        .map((p) => p.countryCode)
    )

    // Countries that require e-invoicing (B2B mandatory or upcoming)
    const requiring = Object.entries(compliance).filter(
      ([, c]) => c.b2b === 'mandatory' || c.b2b === 'upcoming'
    )
    const totalRequiring = requiring.length

    // How many of those are covered by GOBL
    const coveredCount = requiring.filter(([code]) => supportedCodes.has(code)).length
    const coveragePercent = totalRequiring > 0 ? Math.round((coveredCount / totalRequiring) * 100) : 0

    // Needing contribution: require invoicing, no GOBL, no PR
    const needsCount = requiring.filter(
      ([code]) => !supportedCodes.has(code) && !pendingCodes.has(code)
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
      coveredCount,
      totalRequiring,
      coveragePercent,
      inProgress: pendingCodes.size,
      needsCount,
      addons: addonKeys.size,
      regionCount
    }
  })
</script>

<div
  class="flex items-center justify-between px-5 md:px-8 py-2 text-[11px] shrink-0"
  style="background: #06061a; border-bottom: 1px solid #141435;"
>
  <div class="flex items-center gap-5">
    <!-- Coverage progress -->
    <div class="flex items-center gap-2.5">
      <div class="w-20 h-1.5 rounded-full overflow-hidden" style="background: #1a1a3e;">
        <div
          class="h-full rounded-full transition-all duration-500"
          style="width: {stats.coveragePercent}%; background: #6EC5EE;"
        ></div>
      </div>
      <span class="text-paleblue">
        <span class="font-bold text-blue">{stats.coveredCount}</span><span class="text-grey-dark">/{stats.totalRequiring}</span>
        <span class="text-grey-dim">e-invoicing countries covered</span>
      </span>
    </div>
    <div class="w-px h-3.5" style="background: #1a1a3e;"></div>
    <div class="flex items-center gap-1.5">
      <span class="font-bold tabular-nums" style="color: #F0B866;">{stats.inProgress}</span>
      <span class="text-grey-dim">in progress</span>
    </div>
    {#if stats.needsCount > 0}
      <div class="w-px h-3.5" style="background: #1a1a3e;"></div>
      <div class="flex items-center gap-1.5">
        <span class="font-bold tabular-nums" style="color: #e87b7b;">{stats.needsCount}</span>
        <span class="text-grey-dim">need contribution</span>
      </div>
    {/if}
    <div class="w-px h-3.5" style="background: #1a1a3e;"></div>
    <div class="flex items-center gap-1.5">
      <span class="font-bold text-blue tabular-nums">{stats.addons}</span>
      <span class="text-grey-dim">addons</span>
    </div>
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
