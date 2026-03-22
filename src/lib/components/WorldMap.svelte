<script lang="ts">
  import { onMount } from 'svelte'
  import { geoNaturalEarth1, geoPath, geoGraticule, geoCentroid } from 'd3-geo'
  import { select } from 'd3-selection'
  import { zoom, zoomIdentity, type ZoomBehavior } from 'd3-zoom'
  import 'd3-transition'
  import * as topojson from 'topojson-client'
  import { regimeData } from '$lib/stores/regimes'
  import { selectedCountry } from '$lib/stores/selection'
  import { numericToName } from '$lib/data/country-codes'
  import { countryRegion, regionColors } from '$lib/data/regions'
  import { locName, countryFlag } from '$lib/utils/format'
  import type { CountryData } from '$lib/utils/data-loader'
  import { base } from '$app/paths'

  let svgEl: SVGSVGElement
  let gEl: SVGGElement
  let tooltipEl = $state<HTMLDivElement>(undefined!)
  let width = 960
  let height = 500
  let features = $state<GeoJSON.Feature[]>([])
  let outline = $state<string>('')
  let graticuleD = $state<string>('')
  let bordersD = $state<string>('')
  let coastlineD = $state<string>('')
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

  // Markers for tiny countries that are hard to click
  let markers = $state<{ id: string; cx: number; cy: number; name: string }[]>([])
  const TINY_COUNTRIES = ['702'] // Singapore

  let zoomBehavior: ZoomBehavior<SVGSVGElement, unknown>

  regimeData.subscribe((v) => (dataMap = v))
  selectedCountry.subscribe((v) => (selectedId = v ? v.numericCode : null))

  const projection = geoNaturalEarth1().scale(155).translate([480, 265])
  const pathGenerator = geoPath(projection)
  const graticule = geoGraticule().step([15, 15])

  onMount(async () => {
    const res = await fetch(`${base}/world-110m.json`)
    const world = await res.json()
    const countries = topojson.feature(
      world,
      world.objects.countries
    ) as unknown as GeoJSON.FeatureCollection

    // Filter out Antarctica (id 010)
    features = countries.features.filter((f) => f.id !== '010')

    outline = pathGenerator({ type: 'Sphere' }) || ''
    graticuleD = pathGenerator(graticule()) || ''

    // Shared borders via topojson.mesh — much cleaner than per-country strokes
    const mesh = topojson.mesh(world, world.objects.countries, (a: any, b: any) => a !== b)
    bordersD = pathGenerator(mesh as any) || ''

    // Coastline — outer boundary of all land
    const coastline = topojson.mesh(world, world.objects.countries, (a: any, b: any) => a === b)
    coastlineD = pathGenerator(coastline as any) || ''

    // Compute markers for tiny countries
    const m: typeof markers = []
    for (const f of features) {
      const id = f.id?.toString() || ''
      if (TINY_COUNTRIES.includes(id)) {
        const [cx, cy] = projection(geoCentroid(f)) || [0, 0]
        m.push({ id, cx, cy, name: getCountryName(id) })
      }
    }
    markers = m

    zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .on('zoom', (event) => {
        select(gEl).attr('transform', event.transform.toString())
      })

    select(svgEl).call(zoomBehavior)

    // Double-click to reset
    select(svgEl).on('dblclick.zoom', () => {
      select(svgEl).transition().duration(600).call(zoomBehavior.transform, zoomIdentity)
    })
  })

  function getCountryInfo(id: string) {
    return dataMap.get(id)
  }

  function isSupported(id: string): boolean {
    return dataMap.has(id)
  }

  function getFill(id: string): string {
    const info = getCountryInfo(id)
    if (!info) return '#12122e'
    const region = countryRegion[info.countryCode] || countryRegion[info.regime.country]
    return region ? regionColors[region] : '#6EC5EE'
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
    if (!info) return
    selectedCountry.set(info)

    // Zoom to country
    const feature = features.find((f) => f.id?.toString() === id)
    if (feature && svgEl && zoomBehavior) {
      const [[x0, y0], [x1, y1]] = pathGenerator.bounds(feature)
      const dx = x1 - x0
      const dy = y1 - y0
      const cx = (x0 + x1) / 2
      const cy = (y0 + y1) / 2
      const scale = Math.min(8, 0.7 / Math.max(dx / width, dy / height))
      const tx = width / 2 - scale * cx
      const ty = height / 2 - scale * cy

      select(svgEl)
        .transition()
        .duration(600)
        .call(
          zoomBehavior.transform,
          zoomIdentity.translate(tx, ty).scale(scale)
        )
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
      <!-- Ocean gradient -->
      <radialGradient id="ocean" cx="50%" cy="45%" r="55%">
        <stop offset="0%" stop-color="#0d0d32" />
        <stop offset="100%" stop-color="#050516" />
      </radialGradient>

      <!-- Land shadow -->
      <filter id="land-shadow" x="-5%" y="-5%" width="110%" height="110%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="3" flood-color="#000" flood-opacity="0.3" />
      </filter>

      <!-- Hover glow for supported countries -->
      <filter id="hover-glow" x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
        <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.43  0 0 0 0 0.77  0 0 0 0 0.93  0 0 0 0.6 0" result="glow" />
        <feMerge>
          <feMergeNode in="glow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <g bind:this={gEl}>
      <!-- Ocean -->
      <path d={outline} fill="url(#ocean)" stroke="none" />

      <!-- Graticule -->
      <path
        d={graticuleD}
        fill="none"
        stroke="#161640"
        stroke-width="0.2"
        stroke-opacity="0.6"
        pointer-events="none"
      />

      <!-- Countries with shadow -->
      <g filter="url(#land-shadow)">
        {#each features as feature}
          {@const id = feature.id?.toString() || ''}
          {@const d = pathGenerator(feature) || ''}
          {@const supported = isSupported(id)}
          {@const isHovered = hoveredId === id}
          {@const isSelected = selectedId === id}
          <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
          <path
            {d}
            fill={isSelected ? '#fff' : isHovered && supported ? '#fff' : getFill(id)}
            opacity={hoveredId && !isHovered && !isSelected ? 0.5 : 1}
            class="country-path {supported ? 'cursor-pointer supported' : ''}"
            class:hovered={isHovered && supported}
            class:selected={isSelected}
            filter={isHovered && supported ? 'url(#hover-glow)' : undefined}
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
      </g>

      <!-- Shared borders — single clean line, no double-strokes -->
      <path
        d={bordersD}
        fill="none"
        stroke="#1a1a48"
        stroke-width="0.4"
        stroke-linejoin="round"
        pointer-events="none"
      />

      <!-- Coastline outline -->
      <path
        d={coastlineD}
        fill="none"
        stroke="#252560"
        stroke-width="0.6"
        stroke-linejoin="round"
        pointer-events="none"
      />

      <!-- Markers for tiny countries -->
      {#each markers as marker}
        {@const supported = isSupported(marker.id)}
        {#if supported}
          <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
          <g
            class="cursor-pointer"
            role="button"
            tabindex={0}
            onmouseenter={(e) => handleMouseEnter(e, marker.id)}
            onmousemove={handleMouseMove}
            onmouseleave={handleMouseLeave}
            onclick={() => handleClick(marker.id)}
            onkeydown={(e) => {
              if (e.key === 'Enter') handleClick(marker.id)
            }}
          >
            <circle cx={marker.cx} cy={marker.cy} r="4" fill="#6EC5EE" opacity="0.3" />
            <circle cx={marker.cx} cy={marker.cy} r="2" fill="#6EC5EE" />
            <text
              x={marker.cx + 6}
              y={marker.cy + 3}
              fill="#94B2CD"
              font-size="7"
              font-family="system-ui"
            >{marker.name}</text>
          </g>
        {/if}
      {/each}

      <!-- Sphere border -->
      <path d={outline} fill="none" stroke="#1a1a48" stroke-width="0.4" pointer-events="none" />
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

<style>
  .country-path {
    stroke: none;
    transition: fill 0.2s ease, opacity 0.25s ease;
    pointer-events: all;
  }

  .country-path.supported:hover {
    filter: url(#hover-glow);
  }
</style>
