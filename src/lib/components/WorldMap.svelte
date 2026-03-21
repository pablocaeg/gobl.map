<script lang="ts">
  import { onMount } from 'svelte'
  import { geoNaturalEarth1, geoPath, geoGraticule } from 'd3-geo'
  import { select } from 'd3-selection'
  import { zoom, zoomIdentity } from 'd3-zoom'
  import * as topojson from 'topojson-client'
  import { regimeData } from '$lib/stores/regimes'
  import { selectedCountry } from '$lib/stores/selection'
  import { numericToName } from '$lib/data/country-codes'
  import { countryRegion, regionColors } from '$lib/data/regions'
  import { locName, countryFlag } from '$lib/utils/format'
  import type { CountryData } from '$lib/utils/data-loader'

  let svgEl: SVGSVGElement
  let gEl: SVGGElement
  let tooltipEl = $state<HTMLDivElement>(undefined!)
  let width = 960
  let height = 500
  let features = $state<GeoJSON.Feature[]>([])
  let outline = $state<string>('')
  let graticuleD = $state<string>('')
  let hoveredId: string | null = $state(null)
  let selectedId: string | null = $state(null)
  let tooltipX = $state(0)
  let tooltipY = $state(0)
  let tooltipVisible = $state(false)
  let tooltipContent = $state({
    name: '',
    flag: '',
    supported: false,
    taxScheme: '',
    currency: '',
    addons: 0
  })
  let dataMap = $state<Map<string, CountryData>>(new Map())

  regimeData.subscribe((v) => (dataMap = v))
  selectedCountry.subscribe((v) => (selectedId = v ? v.numericCode : null))

  const projection = geoNaturalEarth1().scale(155).translate([480, 270])
  const pathGenerator = geoPath(projection)
  const graticule = geoGraticule().step([20, 20])

  onMount(async () => {
    const res = await fetch('/world-110m.json')
    const world = await res.json()
    const countries = topojson.feature(
      world,
      world.objects.countries
    ) as unknown as GeoJSON.FeatureCollection
    features = countries.features
    outline = pathGenerator({ type: 'Sphere' }) || ''
    graticuleD = pathGenerator(graticule()) || ''

    const zoomBehavior = zoom()
      .scaleExtent([1, 8])
      .on('zoom', (event) => {
        select(gEl).attr('transform', event.transform.toString())
      })

    select(svgEl).call(zoomBehavior as any)

    select(svgEl).on('dblclick.zoom', () => {
      select(svgEl)
        .transition()
        .duration(500)
        .call((zoomBehavior as any).transform, zoomIdentity)
    })
  })

  function getCountryInfo(id: string) {
    return dataMap.get(id)
  }

  function isSupported(id: string): boolean {
    return dataMap.has(id)
  }

  function getFill(id: string): string {
    if (selectedId === id) return '#ffffff'
    const info = getCountryInfo(id)
    if (!info) {
      return hoveredId === id ? '#1e1e42' : '#161636'
    }
    if (hoveredId === id) return '#ffffff'
    const region = countryRegion[info.countryCode] || countryRegion[info.regime.country]
    return region ? regionColors[region] : '#6EC5EE'
  }

  function getStroke(id: string): string {
    if (selectedId === id || hoveredId === id) return '#6EC5EE'
    return '#252548'
  }

  function getStrokeWidth(id: string): number {
    if (selectedId === id) return 2
    if (hoveredId === id) return 1.5
    return 0.3
  }

  function getOpacity(id: string): number {
    if (!hoveredId) return 1
    if (hoveredId === id) return 1
    if (selectedId === id) return 1
    return 0.6
  }

  function getCountryName(id: string): string {
    const info = getCountryInfo(id)
    if (info) return locName(info.regime.name)
    return numericToName[id] || ''
  }

  function handleMouseEnter(event: MouseEvent, id: string) {
    hoveredId = id
    const info = getCountryInfo(id)
    tooltipContent = {
      name: getCountryName(id),
      flag: info ? countryFlag(info.countryCode) : '',
      supported: isSupported(id),
      taxScheme: info?.regime.tax_scheme || '',
      currency: info?.regime.currency || '',
      addons: info?.addons.length || 0
    }
    tooltipVisible = true
    updateTooltipPosition(event)
  }

  function handleMouseMove(event: MouseEvent) {
    updateTooltipPosition(event)
  }

  function handleMouseLeave() {
    hoveredId = null
    tooltipVisible = false
  }

  function handleClick(id: string) {
    const info = getCountryInfo(id)
    if (info) {
      selectedCountry.set(info)
    }
  }

  function updateTooltipPosition(event: MouseEvent) {
    tooltipX = event.clientX + 14
    tooltipY = event.clientY - 10
    if (tooltipEl) {
      const rect = tooltipEl.getBoundingClientRect()
      if (tooltipX + rect.width > window.innerWidth - 10) {
        tooltipX = event.clientX - rect.width - 14
      }
      if (tooltipY + rect.height > window.innerHeight - 10) {
        tooltipY = event.clientY - rect.height - 10
      }
      if (tooltipY < 10) {
        tooltipY = 10
      }
    }
  }
</script>

<div class="relative w-full h-full overflow-hidden">
  <svg
    bind:this={svgEl}
    viewBox="0 0 {width} {height}"
    class="w-full h-full"
    preserveAspectRatio="xMidYMid meet"
  >
    <defs>
      <radialGradient id="ocean-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#0c0c30" />
        <stop offset="100%" stop-color="#060618" />
      </radialGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <g bind:this={gEl}>
      <!-- Ocean -->
      <path d={outline} fill="url(#ocean-glow)" stroke="none" />

      <!-- Graticule -->
      <path d={graticuleD} fill="none" stroke="#1a1a3e" stroke-width="0.3" />

      <!-- Countries -->
      {#each features as feature}
        {@const id = feature.id?.toString() || ''}
        {@const d = pathGenerator(feature) || ''}
        {@const supported = isSupported(id)}
        <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
        <path
          {d}
          fill={getFill(id)}
          stroke={getStroke(id)}
          stroke-width={getStrokeWidth(id)}
          opacity={getOpacity(id)}
          class={supported ? 'cursor-pointer' : ''}
          style="transition: fill 0.2s ease, stroke 0.2s ease, opacity 0.2s ease; pointer-events: all;"
          filter={hoveredId === id && supported ? 'url(#glow)' : undefined}
          role={supported ? 'button' : 'img'}
          tabindex={supported ? 0 : -1}
          aria-label={getCountryName(id)}
          onmouseenter={(e) => handleMouseEnter(e, id)}
          onmousemove={handleMouseMove}
          onmouseleave={handleMouseLeave}
          onclick={() => handleClick(id)}
          onkeydown={(e) => {
            if (e.key === 'Enter') handleClick(id)
          }}
        />
      {/each}

      <!-- Sphere border -->
      <path d={outline} fill="none" stroke="#252548" stroke-width="0.5" pointer-events="none" />
    </g>
  </svg>

  <!-- Tooltip -->
  {#if tooltipVisible && tooltipContent.name}
    <div
      bind:this={tooltipEl}
      class="fixed z-50 pointer-events-none rounded-lg shadow-2xl border px-3.5 py-2.5 text-sm"
      style="left: {tooltipX}px; top: {tooltipY}px; background: #0e0e2aee; border-color: #2a2a50; backdrop-filter: blur(8px);"
    >
      <div class="flex items-center gap-2">
        {#if tooltipContent.flag}
          <span class="text-lg leading-none">{tooltipContent.flag}</span>
        {/if}
        <span class="font-semibold text-grey">{tooltipContent.name}</span>
      </div>
      {#if tooltipContent.supported}
        <div class="flex items-center gap-2 mt-1.5">
          <span
            class="inline-flex items-center gap-1 text-[11px] font-medium text-blue px-1.5 py-0.5 rounded"
            style="background: #6EC5EE12;"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-blue"></span>
            Supported
          </span>
          {#if tooltipContent.taxScheme}
            <span class="text-[11px] text-paleblue">{tooltipContent.taxScheme}</span>
          {/if}
          {#if tooltipContent.currency}
            <span class="text-[11px] text-grey-dim">{tooltipContent.currency}</span>
          {/if}
        </div>
        {#if tooltipContent.addons > 0}
          <div class="text-[11px] text-grey-dim mt-1">
            {tooltipContent.addons} addon{tooltipContent.addons > 1 ? 's' : ''}
          </div>
        {/if}
        <div
          class="text-[10px] text-grey-dark mt-1.5 pt-1.5"
          style="border-top: 1px solid #1a1a3e;"
        >
          Click to explore →
        </div>
      {:else}
        <div class="flex items-center gap-1.5 mt-1">
          <span class="w-1.5 h-1.5 rounded-full bg-grey-dark"></span>
          <span class="text-[11px] text-grey-dim">Not yet supported</span>
        </div>
      {/if}
    </div>
  {/if}
</div>
