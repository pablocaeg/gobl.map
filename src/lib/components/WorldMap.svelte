<script lang="ts">
  import { onMount } from 'svelte'
  import { geoNaturalEarth1, geoPath, geoGraticule, geoArea } from 'd3-geo'
  import { select } from 'd3-selection'
  import { zoom, zoomIdentity, type ZoomBehavior } from 'd3-zoom'
  import 'd3-transition'
  import * as topojson from 'topojson-client'
  import { regimeData } from '$lib/stores/regimes'
  import { selectedCountry } from '$lib/stores/selection'
  import { pendingRegimes } from '$lib/stores/pending'
  import type { PendingRegime } from '$lib/utils/pending-regimes'
  import { numericToName, alpha2ToNumeric, numericToAlpha2 } from '$lib/data/country-codes'
  import {
    compliance,
    getComplianceLabel,
    getComplianceColor,
    type ComplianceInfo
  } from '$lib/data/compliance'
  import { countryRegion, regionColors } from '$lib/data/regions'
  import { locName } from '$lib/utils/format'
  import Flag from './Flag.svelte'
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
  let hoveredId: string | null = $state(null)
  let selectedId: string | null = $state(null)
  let tooltipX = $state(0)
  let tooltipY = $state(0)
  let tooltipVisible = $state(false)
  let tooltipContent = $state({
    name: '',
    flagCode: '',
    supported: false,
    isPending: false,
    prAuthor: '',
    taxScheme: '',
    currency: '',
    addons: 0,
    compliance: null as ComplianceInfo | null,
    needsContribution: false
  })
  let dataMap = $state<Map<string, CountryData>>(new Map())
  let pending = $state<PendingRegime[]>([])
  let zoomRef: ZoomBehavior<SVGSVGElement, unknown>

  // Alpha-2 → numeric for pending countries not in the main mapping
  const EXTRA_NUMERIC: Record<string, string> = {
    JP: '392', FI: '246', AD: '020', TR: '792', SA: '682',
    NO: '578', IL: '376', RO: '642', HU: '348', HR: '191',
    BG: '100', KR: '410', AU: '036', NZ: '554', EG: '818',
    NG: '566', KE: '404', CL: '152', PE: '604', EC: '218',
    UY: '858', PY: '600'
  }

  function toNumeric(code: string): string | undefined {
    return alpha2ToNumeric[code] || EXTRA_NUMERIC[code]
  }

  // Set of numeric codes for pending countries that aren't already supported
  let pendingNumeric = $derived.by(() => {
    const s = new Set<string>()
    for (const p of pending) {
      const num = toNumeric(p.countryCode)
      if (num && !dataMap.has(num)) s.add(num)
    }
    return s
  })

  function getPendingInfo(numericId: string): PendingRegime | undefined {
    for (const p of pending) {
      if (toNumeric(p.countryCode) === numericId) return p
    }
    return undefined
  }

  regimeData.subscribe((v) => (dataMap = v))
  selectedCountry.subscribe((v) => (selectedId = v ? v.numericCode : null))
  pendingRegimes.subscribe((v) => (pending = v))

  const projection = geoNaturalEarth1().scale(155).translate([480, 270])
  const pathGenerator = geoPath(projection)
  const graticule = geoGraticule().step([20, 20])

  onMount(async () => {
    const res = await fetch(`${base}/world-110m.json`)
    const world = await res.json()
    const countries = topojson.feature(
      world,
      world.objects.countries
    ) as unknown as GeoJSON.FeatureCollection

    // Remove Antarctica (id 010) — visual noise
    features = countries.features.filter((f) => f.id !== '010')

    outline = pathGenerator({ type: 'Sphere' }) || ''
    graticuleD = pathGenerator(graticule()) || ''

    // Single shared border path — cleaner and faster than per-country strokes
    const mesh = topojson.mesh(world, world.objects.countries, (a: any, b: any) => a !== b)
    bordersD = pathGenerator(mesh as any) || ''

    zoomRef = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .on('zoom', (event) => {
        select(gEl).attr('transform', event.transform.toString())
      })

    select(svgEl).call(zoomRef)

    select(svgEl).on('dblclick.zoom', () => {
      select(svgEl).transition().duration(500).call(zoomRef.transform, zoomIdentity)
    })
  })

  function getCountryInfo(id: string) {
    return dataMap.get(id)
  }

  function isSupported(id: string): boolean {
    return dataMap.has(id)
  }

  function isPending(id: string): boolean {
    return pendingNumeric.has(id)
  }

  function getCompliance(id: string): ComplianceInfo | null {
    const alpha = numericToAlpha2[id]
    if (alpha) return compliance[alpha] || null
    return null
  }

  // Country needs a contribution: requires invoicing, no GOBL support, no PR open
  function needsContribution(id: string): boolean {
    if (dataMap.has(id) || isPending(id)) return false
    const c = getCompliance(id)
    if (!c) return false
    return (
      c.b2g === 'mandatory' ||
      c.b2b === 'mandatory' ||
      c.b2b === 'upcoming' ||
      c.b2c === 'mandatory' ||
      c.b2c === 'upcoming'
    )
  }

  function getFill(id: string): string {
    if (selectedId === id) return '#ffffff'
    const info = getCountryInfo(id)
    if (info) {
      if (hoveredId === id) return '#ffffff'
      const region = countryRegion[info.countryCode] || countryRegion[info.regime.country]
      return region ? regionColors[region] : '#6EC5EE'
    }
    if (isPending(id)) {
      return hoveredId === id ? '#3a3a60' : 'url(#pending-pattern)'
    }
    if (needsContribution(id)) {
      return hoveredId === id ? '#2a1a2a' : 'url(#needs-pattern)'
    }
    return hoveredId === id ? '#1a1a40' : '#111130'
  }

  function getOpacity(id: string): number {
    if (!hoveredId) return 1
    if (hoveredId === id) return 1
    if (selectedId === id) return 1
    return 0.5
  }

  function getCountryName(id: string): string {
    const info = getCountryInfo(id)
    if (info) return locName(info.regime.name)
    return numericToName[id] || ''
  }

  function handleMouseEnter(event: MouseEvent, id: string) {
    hoveredId = id
    const info = getCountryInfo(id)
    const pendingInfo = getPendingInfo(id)
    const alpha = numericToAlpha2[id]
    const comp = getCompliance(id)
    tooltipContent = {
      name: pendingInfo?.countryName || getCountryName(id),
      flagCode: info
        ? info.countryCode
        : pendingInfo
          ? pendingInfo.countryCode
          : alpha || '',
      supported: isSupported(id),
      isPending: isPending(id) && !isSupported(id),
      prAuthor: pendingInfo?.author || '',
      taxScheme: info?.regime.tax_scheme || '',
      currency: info?.regime.currency || '',
      addons: info?.addons.length || 0,
      compliance: comp,
      needsContribution: needsContribution(id)
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

  // For MultiPolygon countries (France, US, etc.), get bounds of the largest
  // polygon only — avoids zooming to the middle of the ocean
  function mainlandBounds(feature: GeoJSON.Feature): [[number, number], [number, number]] {
    const geom = feature.geometry
    if (geom.type === 'MultiPolygon') {
      let largest: GeoJSON.Feature | null = null
      let maxArea = 0
      for (const coords of geom.coordinates) {
        const poly: GeoJSON.Feature = {
          type: 'Feature',
          properties: {},
          geometry: { type: 'Polygon', coordinates: coords }
        }
        const a = geoArea(poly)
        if (a > maxArea) {
          maxArea = a
          largest = poly
        }
      }
      if (largest) return pathGenerator.bounds(largest)
    }
    return pathGenerator.bounds(feature)
  }

  function handleClick(id: string) {
    const info = getCountryInfo(id)
    if (!info) {
      if (needsContribution(id)) {
        window.open('https://github.com/invopop/gobl', '_blank')
      }
      return
    }
    selectedCountry.set(info)

    // Zoom to mainland
    const feature = features.find((f) => f.id?.toString() === id)
    if (feature && svgEl && zoomRef) {
      const [[x0, y0], [x1, y1]] = mainlandBounds(feature)
      const dx = x1 - x0
      const dy = y1 - y0
      const cx = (x0 + x1) / 2
      const cy = (y0 + y1) / 2
      const scale = Math.min(4, 0.35 / Math.max(dx / width, dy / height))
      const tx = width / 2 - scale * cx
      const ty = height / 2 - scale * cy

      select(svgEl)
        .transition()
        .duration(500)
        .call(zoomRef.transform, zoomIdentity.translate(tx, ty).scale(scale))
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
      <radialGradient id="ocean" cx="50%" cy="45%" r="55%">
        <stop offset="0%" stop-color="#0c0c30" />
        <stop offset="100%" stop-color="#060618" />
      </radialGradient>
      <!-- Diagonal stripe pattern for pending/in-progress countries -->
      <pattern id="pending-pattern" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="6" height="6" fill="#161640" />
        <rect width="2" height="6" fill="#2a2a5a" />
      </pattern>
      <!-- Stripe pattern for countries needing contribution (reddish) -->
      <pattern id="needs-pattern" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="6" height="6" fill="#1a1020" />
        <rect width="2" height="6" fill="#3a1a30" />
      </pattern>
    </defs>
    <g bind:this={gEl}>
      <!-- Ocean -->
      <path d={outline} fill="url(#ocean)" stroke="none" />

      <!-- Graticule -->
      <path d={graticuleD} fill="none" stroke="#14143a" stroke-width="0.25" pointer-events="none" />

      <!-- Country fills — no per-country stroke, borders handled separately -->
      {#each features as feature}
        {@const id = feature.id?.toString() || ''}
        {@const d = pathGenerator(feature) || ''}
        {@const supported = isSupported(id)}
        <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
        <path
          {d}
          fill={getFill(id)}
          stroke="none"
          opacity={getOpacity(id)}
          class="country {supported || needsContribution(id) ? 'supported' : ''}"
          role={supported || needsContribution(id) ? 'button' : 'img'}
          tabindex={supported || needsContribution(id) ? 0 : -1}
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

      <!-- Shared borders — one single path, much cleaner -->
      <path
        d={bordersD}
        fill="none"
        stroke="#1c1c48"
        stroke-width="0.3"
        stroke-linejoin="round"
        pointer-events="none"
      />

      <!-- Sphere outline -->
      <path d={outline} fill="none" stroke="#1c1c48" stroke-width="0.4" pointer-events="none" />
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
        {#if tooltipContent.flagCode}
          <Flag code={tooltipContent.flagCode} size="sm" />
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
      {:else if tooltipContent.isPending}
        <div class="flex items-center gap-1.5 mt-1.5">
          <span class="w-1.5 h-1.5 rounded-full" style="background: #F0B866;"></span>
          <span class="text-[11px] font-medium" style="color: #F0B866;">In progress</span>
        </div>
        {#if tooltipContent.prAuthor}
          <div class="text-[10px] text-grey-dim mt-1">PR by @{tooltipContent.prAuthor}</div>
        {/if}
      {:else if tooltipContent.needsContribution}
        <div class="flex items-center gap-1.5 mt-1.5">
          <span class="w-1.5 h-1.5 rounded-full" style="background: #ef4444;"></span>
          <span class="text-[11px] font-medium" style="color: #ef4444;">Needs contribution</span>
        </div>
        {#if tooltipContent.compliance}
          <div class="flex gap-3 mt-1.5 text-[10px]">
            <span class="text-grey-dim">B2G: <span style="color: {getComplianceColor(tooltipContent.compliance.b2g)};">{getComplianceLabel(tooltipContent.compliance.b2g)}</span></span>
            <span class="text-grey-dim">B2B: <span style="color: {getComplianceColor(tooltipContent.compliance.b2b)};">{getComplianceLabel(tooltipContent.compliance.b2b)}</span></span>
            <span class="text-grey-dim">B2C: <span style="color: {getComplianceColor(tooltipContent.compliance.b2c)};">{getComplianceLabel(tooltipContent.compliance.b2c)}</span></span>
          </div>
          <div class="text-[10px] mt-1.5 pt-1.5" style="border-top: 1px solid #1a1a3e; color: #e87b7b;">
            Click to contribute →
          </div>
        {/if}
      {:else}
        <div class="flex items-center gap-1.5 mt-1">
          <span class="w-1.5 h-1.5 rounded-full bg-grey-dark"></span>
          <span class="text-[11px] text-grey-dim">Not yet supported</span>
        </div>
        {#if tooltipContent.compliance}
          <div class="flex gap-3 mt-1 text-[10px]">
            {#if tooltipContent.compliance.b2g !== 'unknown'}
              <span class="text-grey-dark">B2G: {getComplianceLabel(tooltipContent.compliance.b2g)}</span>
            {/if}
          </div>
        {/if}
      {/if}
    </div>
  {/if}
</div>

<style>
  .country {
    pointer-events: all;
    transition: fill 0.15s ease, opacity 0.15s ease;
  }
  .country.supported {
    cursor: pointer;
  }
</style>
